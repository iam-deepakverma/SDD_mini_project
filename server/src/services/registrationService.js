import { Course } from '../models/Course.js';
import { Registration } from '../models/Registration.js';
import { Waitlist } from '../models/Waitlist.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { User } from '../models/User.js';
import { generateRegistrationReference } from '../utils/referenceGenerator.js';

export class RegistrationService {
  /**
   * Fetch current system settings or create default
   */
  static async getSettings() {
    let setting = await SystemSetting.findOne();
    if (!setting) {
      setting = await SystemSetting.create({});
    }
    return setting;
  }

  /**
   * Check if registration period is currently open
   */
  static async checkRegistrationWindow() {
    const settings = await this.getSettings();
    const now = new Date();

    if (!settings.registrationOpen) {
      return {
        isOpen: false,
        message: 'Course registration is currently closed by the administration.',
        settings,
      };
    }

    if (settings.registrationStart && now < new Date(settings.registrationStart)) {
      return {
        isOpen: false,
        message: `Course registration has not started yet. Opens on ${new Date(settings.registrationStart).toLocaleString()}.`,
        settings,
      };
    }

    if (settings.registrationEnd && now > new Date(settings.registrationEnd)) {
      return {
        isOpen: false,
        message: `Course registration period ended on ${new Date(settings.registrationEnd).toLocaleString()}.`,
        settings,
      };
    }

    return { isOpen: true, message: 'Registration is open.', settings };
  }

  /**
   * Validate prerequisites for a course against a student's completed courses
   */
  static async validatePrerequisites(student, course) {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return { eligible: true, missingPrerequisites: [] };
    }

    // Populate prerequisites if needed
    const populatedCourse = await Course.findById(course._id)
      .populate('prerequisites', 'courseCode title credits')
      .lean();

    const completedCodes = new Set(
      (student.completedCourses || []).map((c) => (c.courseCode || '').toUpperCase())
    );
    const completedIds = new Set(
      (student.completedCourses || [])
        .filter((c) => c.course)
        .map((c) => c.course.toString())
    );

    const missing = [];
    for (const prereq of populatedCourse.prerequisites || []) {
      const codeMatches = prereq.courseCode && completedCodes.has(prereq.courseCode.toUpperCase());
      const idMatches = prereq._id && completedIds.has(prereq._id.toString());

      if (!codeMatches && !idMatches) {
        missing.push({
          id: prereq._id,
          courseCode: prereq.courseCode,
          title: prereq.title,
          credits: prereq.credits,
        });
      }
    }

    return {
      eligible: missing.length === 0,
      missingPrerequisites: missing,
    };
  }

  /**
   * Calculate student's currently registered credits for a semester
   */
  static async getStudentRegisteredCredits(studentId, semester) {
    const activeRegistrations = await Registration.find({
      student: studentId,
      semester,
      status: 'registered',
    }).populate('course', 'credits');

    return activeRegistrations.reduce((sum, reg) => {
      const credits = reg.creditsAtRegistration || reg.course?.credits || 0;
      return sum + credits;
    }, 0);
  }

  /**
   * Validate if adding additional credits violates credit limits
   */
  static async validateCreditLimit(studentId, semester, additionalCredits) {
    const settings = await this.getSettings();
    const currentCredits = await this.getStudentRegisteredCredits(studentId, semester);
    const maxCredits = settings.maxCredits || 18;
    const newTotal = currentCredits + additionalCredits;

    return {
      eligible: newTotal <= maxCredits,
      currentCredits,
      additionalCredits,
      newTotal,
      maxCredits,
      excessCredits: Math.max(0, newTotal - maxCredits),
    };
  }

  /**
   * Batch validate candidate courses before registration submission
   */
  static async validateBatch(studentId, courseIds, targetSemester) {
    const windowCheck = await this.checkRegistrationWindow();
    const settings = windowCheck.settings;
    const student = await User.findById(studentId).lean();
    if (!student) throw new Error('Student not found');

    const semester = targetSemester || settings.currentSemester;
    const courses = await Course.find({
      _id: { $in: courseIds },
      isActive: true,
    }).populate('prerequisites', 'courseCode title credits');

    const currentCredits = await this.getStudentRegisteredCredits(studentId, semester);
    const existingRegistrations = await Registration.find({
      student: studentId,
      semester,
      status: 'registered',
    }).select('course');
    const existingCourseIds = new Set(existingRegistrations.map((r) => r.course.toString()));

    const courseValidations = [];
    let totalBatchCredits = 0;

    for (const course of courses) {
      const prereqCheck = await this.validatePrerequisites(student, course);
      const isAlreadyRegistered = existingCourseIds.has(course._id.toString());
      const hasAvailableSeat = course.enrolledCount < course.capacity;

      // Check if student is already in waitlist
      const activeWaitlist = await Waitlist.findOne({
        student: studentId,
        course: course._id,
        semester,
        status: { $in: ['waiting', 'offered'] },
      });

      const courseValidation = {
        courseId: course._id,
        courseCode: course.courseCode,
        title: course.title,
        credits: course.credits,
        capacity: course.capacity,
        enrolledCount: course.enrolledCount,
        availableSeats: Math.max(0, course.capacity - course.enrolledCount),
        isFull: !hasAvailableSeat,
        isAlreadyRegistered,
        prerequisitesMet: prereqCheck.eligible,
        missingPrerequisites: prereqCheck.missingPrerequisites,
        isWaitlisted: !!activeWaitlist,
        waitlistStatus: activeWaitlist ? activeWaitlist.status : null,
        canRegister:
          windowCheck.isOpen &&
          !isAlreadyRegistered &&
          prereqCheck.eligible &&
          hasAvailableSeat,
        canWaitlist:
          windowCheck.isOpen &&
          settings.waitingListEnabled &&
          !isAlreadyRegistered &&
          !activeWaitlist &&
          !hasAvailableSeat &&
          prereqCheck.eligible,
      };

      if (courseValidation.canRegister) {
        totalBatchCredits += course.credits;
      }

      courseValidations.push(courseValidation);
    }

    const projectedTotal = currentCredits + totalBatchCredits;
    const creditCheck = {
      currentCredits,
      batchCredits: totalBatchCredits,
      projectedTotal,
      maxCredits: settings.maxCredits,
      withinLimit: projectedTotal <= settings.maxCredits,
      excessCredits: Math.max(0, projectedTotal - settings.maxCredits),
    };

    return {
      windowOpen: windowCheck.isOpen,
      windowMessage: windowCheck.message,
      settings,
      creditCheck,
      courseValidations,
      allValid:
        windowCheck.isOpen &&
        creditCheck.withinLimit &&
        courseValidations.every((c) => c.canRegister),
    };
  }

  /**
   * Execute course registration with atomic seat allocation
   */
  static async registerCourses(studentId, courseIds, targetSemester) {
    // 1. Check registration window
    const windowCheck = await this.checkRegistrationWindow();
    if (!windowCheck.isOpen) {
      throw new Error(windowCheck.message);
    }

    const settings = windowCheck.settings;
    const semester = targetSemester || settings.currentSemester;
    const student = await User.findById(studentId);
    if (!student) throw new Error('Student record not found.');

    if (student.role !== 'student') {
      throw new Error('Only student accounts are eligible for course registration.');
    }

    // 2. Fetch target courses
    const courses = await Course.find({
      _id: { $in: courseIds },
      isActive: true,
    }).populate('prerequisites');

    if (courses.length !== courseIds.length) {
      throw new Error('One or more selected courses are invalid or no longer active.');
    }

    // 3. Check for existing active registrations (prevent duplicate registration)
    const existingRegs = await Registration.find({
      student: studentId,
      course: { $in: courseIds },
      semester,
      status: 'registered',
    }).populate('course', 'courseCode');

    if (existingRegs.length > 0) {
      const dupes = existingRegs.map((r) => r.course.courseCode).join(', ');
      throw new Error(`You are already registered for course(s): ${dupes}`);
    }

    // 4. Validate prerequisites on server
    for (const course of courses) {
      const prereqCheck = await this.validatePrerequisites(student, course);
      if (!prereqCheck.eligible) {
        const missingCodes = prereqCheck.missingPrerequisites.map((p) => p.courseCode).join(', ');
        throw new Error(
          `Prerequisite requirement not met for ${course.courseCode} (${course.title}). Missing: ${missingCodes}`
        );
      }
    }

    // 5. Validate credit limits on server
    const batchCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const creditCheck = await this.validateCreditLimit(studentId, semester, batchCredits);
    if (!creditCheck.eligible) {
      throw new Error(
        `Credit limit exceeded. Current: ${creditCheck.currentCredits}, Attempting: +${batchCredits}, Maximum: ${creditCheck.maxCredits}. Excess: ${creditCheck.excessCredits} credits.`
      );
    }

    // 6. Atomic seat reservation & registration record creation
    // To handle concurrency safely: For each course, atomically increment enrolledCount ONLY IF enrolledCount < capacity
    const registeredResults = [];
    const reservedCourseIds = [];

    try {
      for (const course of courses) {
        // Atomic seat reservation
        const updatedCourse = await Course.findOneAndUpdate(
          {
            _id: course._id,
            isActive: true,
            $expr: { $lt: ['$enrolledCount', '$capacity'] },
          },
          { $inc: { enrolledCount: 1 } },
          { new: true }
        );

        if (!updatedCourse) {
          throw new Error(
            `Course ${course.courseCode} (${course.title}) has reached maximum capacity (${course.capacity} seats). Registration aborted.`
          );
        }

        reservedCourseIds.push(course._id);

        // Generate unique reference
        const refNumber = generateRegistrationReference('REG');

        // Create registration document
        const registration = await Registration.create({
          registrationReference: refNumber,
          student: studentId,
          course: course._id,
          semester,
          academicYear: settings.academicYear,
          creditsAtRegistration: course.credits,
          status: 'registered',
          registeredAt: new Date(),
        });

        registeredResults.push({
          registrationId: registration._id,
          registrationReference: refNumber,
          courseId: course._id,
          courseCode: course.courseCode,
          title: course.title,
          credits: course.credits,
          facultyName: course.facultyName,
        });

        // If student was on waitlist for this course, mark waitlist as enrolled
        await Waitlist.findOneAndUpdate(
          {
            student: studentId,
            course: course._id,
            semester,
            status: { $in: ['waiting', 'offered'] },
          },
          { status: 'enrolled' }
        );
      }

      return {
        success: true,
        message: `Successfully registered for ${registeredResults.length} course(s).`,
        registrations: registeredResults,
        semester,
        academicYear: settings.academicYear,
        totalCreditsAdded: batchCredits,
      };
    } catch (err) {
      // Rollback any reserved seats if subsequent course failed
      if (reservedCourseIds.length > 0) {
        await Course.updateMany(
          { _id: { $in: reservedCourseIds } },
          { $inc: { enrolledCount: -1 } }
        );
        // Clean up created registrations in this failed batch
        const createdRegIds = registeredResults.map((r) => r.registrationId);
        if (createdRegIds.length > 0) {
          await Registration.deleteMany({ _id: { $in: createdRegIds } });
        }
      }
      throw err;
    }
  }

  /**
   * Cancel course registration
   */
  static async cancelRegistration(registrationId, user, reason = '') {
    const registration = await Registration.findById(registrationId).populate('course');
    if (!registration) {
      throw new Error('Registration record not found.');
    }

    if (registration.status === 'cancelled') {
      throw new Error('This registration is already cancelled.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = registration.student.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new Error('You are not authorized to cancel this registration.');
    }

    // Check cancellation deadline for students
    const settings = await this.getSettings();
    if (!isAdmin) {
      if (!settings.allowCancellation) {
        throw new Error('Course cancellation is currently disabled by university policy.');
      }
      if (settings.cancellationDeadline && new Date() > new Date(settings.cancellationDeadline)) {
        throw new Error(
          `Cancellation deadline passed on ${new Date(settings.cancellationDeadline).toLocaleDateString()}.`
        );
      }
    }

    // Mark registration as cancelled
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    registration.cancellationReason = reason || (isAdmin ? 'Cancelled by administrator' : 'Student self-dropped');
    await registration.save();

    // Safely decrement course enrolled count
    if (registration.course) {
      await Course.findByIdAndUpdate(registration.course._id, {
        $inc: { enrolledCount: -1 },
      });

      // Check if there is an active waiting list entry to promote or alert
      const nextWaitlist = await Waitlist.findOne({
        course: registration.course._id,
        status: 'waiting',
      })
        .sort({ queuePosition: 1 })
        .populate('student', 'name email');

      if (nextWaitlist) {
        // Seat is now available for candidate
        nextWaitlist.status = 'offered';
        nextWaitlist.offeredAt = new Date();
        nextWaitlist.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h offer
        await nextWaitlist.save();
      }
    }

    return {
      success: true,
      message: `Course ${registration.course?.courseCode || ''} registration successfully cancelled.`,
      registration,
    };
  }

  /**
   * Join course waitlist
   */
  static async joinWaitlist(studentId, courseId, targetSemester) {
    const windowCheck = await this.checkRegistrationWindow();
    if (!windowCheck.isOpen) throw new Error(windowCheck.message);

    const settings = windowCheck.settings;
    if (!settings.waitingListEnabled) {
      throw new Error('Waiting list is currently disabled.');
    }

    const semester = targetSemester || settings.currentSemester;
    const student = await User.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      throw new Error('Course not found or inactive.');
    }

    // Check if course is actually full
    if (course.enrolledCount < course.capacity) {
      throw new Error('Course has open seats available. Direct registration is recommended.');
    }

    // Check if already registered
    const existingReg = await Registration.findOne({
      student: studentId,
      course: courseId,
      semester,
      status: 'registered',
    });
    if (existingReg) {
      throw new Error('You are already registered for this course.');
    }

    // Check if already in waitlist
    const existingWaitlist = await Waitlist.findOne({
      student: studentId,
      course: courseId,
      semester,
      status: { $in: ['waiting', 'offered'] },
    });
    if (existingWaitlist) {
      throw new Error(`You are already on the waiting list (Queue Position #${existingWaitlist.queuePosition}).`);
    }

    // Validate prerequisites even for waitlist
    const prereqCheck = await this.validatePrerequisites(student, course);
    if (!prereqCheck.eligible) {
      const missingCodes = prereqCheck.missingPrerequisites.map((p) => p.courseCode).join(', ');
      throw new Error(`Cannot join waitlist. Missing prerequisite(s): ${missingCodes}`);
    }

    // Determine queue position
    const maxQueue = await Waitlist.countDocuments({
      course: courseId,
      semester,
      status: { $in: ['waiting', 'offered'] },
    });
    const queuePosition = maxQueue + 1;

    const waitlistEntry = await Waitlist.create({
      student: studentId,
      course: courseId,
      semester,
      queuePosition,
      status: 'waiting',
      joinedAt: new Date(),
    });

    return {
      success: true,
      message: `Successfully joined waitlist for ${course.courseCode} at position #${queuePosition}.`,
      waitlist: waitlistEntry,
      queuePosition,
    };
  }

  /**
   * Leave waitlist
   */
  static async leaveWaitlist(waitlistId, user) {
    const entry = await Waitlist.findById(waitlistId);
    if (!entry) throw new Error('Waitlist record not found.');

    const isAdmin = user.role === 'admin';
    const isOwner = entry.student.toString() === user._id.toString();
    if (!isAdmin && !isOwner) {
      throw new Error('Not authorized to modify this waitlist entry.');
    }

    entry.status = 'cancelled';
    await entry.save();

    // Reorder remaining queue positions for this course
    const remaining = await Waitlist.find({
      course: entry.course,
      semester: entry.semester,
      status: 'waiting',
      queuePosition: { $gt: entry.queuePosition },
    }).sort({ queuePosition: 1 });

    for (let i = 0; i < remaining.length; i++) {
      remaining[i].queuePosition = entry.queuePosition + i;
      await remaining[i].save();
    }

    return {
      success: true,
      message: 'Successfully removed from waitlist.',
    };
  }
}
