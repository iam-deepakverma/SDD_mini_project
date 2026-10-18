import { RegistrationService } from '../services/registrationService.js';
import { Waitlist } from '../models/Waitlist.js';
import { Course } from '../models/Course.js';
import { Registration } from '../models/Registration.js';
import { generateRegistrationReference } from '../utils/referenceGenerator.js';

/**
 * @desc    Join course waitlist
 * @route   POST /api/waitlists
 * @access  Private (Student)
 */
export const joinWaitlist = async (req, res) => {
  try {
    const { courseId, semester } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }

    const result = await RegistrationService.joinWaitlist(
      req.user._id,
      courseId,
      semester
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to join waitlist.',
    });
  }
};

/**
 * @desc    Get current student's waitlist positions
 * @route   GET /api/waitlists/me
 * @access  Private (Student)
 */
export const getMyWaitlists = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { student: req.user._id };

    if (status === 'all') {
      query.status = { $in: ['waiting', 'offered', 'enrolled'] };
    } else if (status === 'enrolled') {
      query.status = 'enrolled';
    } else if (status && status !== 'active') {
      query.status = status;
    } else {
      query.status = { $in: ['waiting', 'offered'] };
    }

    const waitlists = await Waitlist.find(query)
      .populate('course', 'courseCode title credits capacity enrolledCount facultyName')
      .sort({ createdAt: -1 });

    // Also get count of active waiting
    const activeCount = await Waitlist.countDocuments({
      student: req.user._id,
      status: { $in: ['waiting', 'offered'] },
    });

    const enrolledFromWaitlist = await Waitlist.find({
      student: req.user._id,
      status: 'enrolled',
    })
      .populate('course', 'courseCode title credits facultyName')
      .sort({ updatedAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      count: waitlists.length,
      activeCount,
      waitlists,
      enrolledFromWaitlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cancel waitlist entry
 * @route   DELETE /api/waitlists/:id
 * @access  Private (Student or Admin)
 */
export const leaveWaitlist = async (req, res) => {
  try {
    const result = await RegistrationService.leaveWaitlist(req.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all waitlists grouped or filtered (Admin)
 * @route   GET /api/waitlists/admin
 * @access  Private (Admin)
 */
export const getAllWaitlists = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const query = {};

    if (courseId) query.course = courseId;
    if (status) query.status = status;

    const waitlists = await Waitlist.find(query)
      .populate('student', 'name email studentId department program')
      .populate('course', 'courseCode title credits capacity enrolledCount')
      .sort({ course: 1, queuePosition: 1 });

    return res.status(200).json({
      success: true,
      count: waitlists.length,
      waitlists,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin offers seat or directly enrolls top waitlist student
 * @route   POST /api/waitlists/admin/:id/offer
 * @access  Private (Admin)
 */
export const offerSeat = async (req, res) => {
  try {
    const waitlist = await Waitlist.findById(req.params.id)
      .populate('student')
      .populate('course');

    if (!waitlist) {
      return res.status(404).json({ success: false, message: 'Waitlist entry not found.' });
    }

    if (waitlist.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: `Waitlist entry status is already '${waitlist.status}'.`,
      });
    }

    const course = waitlist.course;

    // Check if course has space or expand capacity to accommodate
    if (course.enrolledCount >= course.capacity) {
      course.capacity = course.capacity + 1;
    }

    // Atomic seat allocation
    course.enrolledCount += 1;
    await course.save();

    // Mark waitlist as officially enrolled
    waitlist.status = 'enrolled';
    await waitlist.save();

    // Reorder remaining waitlist entries for this course
    const remaining = await Waitlist.find({
      course: course._id,
      semester: waitlist.semester,
      status: 'waiting',
      queuePosition: { $gt: waitlist.queuePosition },
    }).sort({ queuePosition: 1 });

    for (let i = 0; i < remaining.length; i++) {
      remaining[i].queuePosition = waitlist.queuePosition + i;
      await remaining[i].save();
    }

    // Check if student already has active registration for this course
    let registration = await Registration.findOne({
      student: waitlist.student._id,
      course: course._id,
      semester: waitlist.semester,
      status: 'registered',
    });

    if (!registration) {
      // Create official registration record
      const ref = generateRegistrationReference('REG-WL');
      registration = await Registration.create({
        registrationReference: ref,
        student: waitlist.student._id,
        course: course._id,
        semester: waitlist.semester,
        academicYear: '2026-2027',
        creditsAtRegistration: course.credits,
        status: 'registered',
        registeredAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully enrolled waitlisted student ${waitlist.student.name} into ${course.courseCode}.`,
      registration,
      waitlist,
    });
  } catch (error) {
    console.error('Error in offerSeat:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
