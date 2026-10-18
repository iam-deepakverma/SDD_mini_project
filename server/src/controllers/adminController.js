import { Course } from '../models/Course.js';
import { Registration } from '../models/Registration.js';
import { Waitlist } from '../models/Waitlist.js';
import { User } from '../models/User.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { exportRegistrationsToCSV } from '../utils/csvExporter.js';

/**
 * @desc    Get admin analytics dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const settings = (await SystemSetting.findOne()) || {};
    const semester = settings.currentSemester || 5;

    const [
      totalStudents,
      totalCourses,
      activeCoursesCount,
      activeRegistrationsCount,
      totalWaitlistsCount,
      courses,
      recentRegistrations,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Registration.countDocuments({ status: 'registered', semester }),
      Waitlist.countDocuments({ status: 'waiting', semester }),
      Course.find({ isActive: true }).select('courseCode title capacity enrolledCount department credits'),
      Registration.find()
        .sort({ registeredAt: -1 })
        .limit(10)
        .populate('student', 'name studentId email')
        .populate('course', 'courseCode title credits'),
    ]);

    // Calculate total capacity and seats occupied
    const totalCapacity = courses.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const seatUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    // Department breakdown
    const departmentMap = {};
    for (const c of courses) {
      const dept = c.department || 'General';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { department: dept, courses: 0, capacity: 0, enrolled: 0 };
      }
      departmentMap[dept].courses += 1;
      departmentMap[dept].capacity += c.capacity || 0;
      departmentMap[dept].enrolled += c.enrolledCount || 0;
    }
    const departmentStats = Object.values(departmentMap);

    // Top enrolled courses
    const topCourses = [...courses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 6)
      .map((c) => ({
        courseCode: c.courseCode,
        title: c.title,
        enrolled: c.enrolledCount,
        capacity: c.capacity,
        utilization: c.capacity > 0 ? Math.round((c.enrolledCount / c.capacity) * 100) : 0,
      }));

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        activeCoursesCount,
        activeRegistrationsCount,
        totalWaitlistsCount,
        totalCapacity,
        totalEnrolled,
        seatUtilization,
      },
      settings,
      departmentStats,
      topCourses,
      recentRegistrations,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all registrations with search, filter & pagination (Admin)
 * @route   GET /api/admin/registrations
 * @access  Private (Admin)
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const {
      search,
      semester,
      status,
      courseId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (courseId && courseId !== 'all') {
      query.course = courseId;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let registrationsQuery = Registration.find(query)
      .populate('student', 'name studentId email department program')
      .populate('course', 'courseCode title credits facultyName capacity enrolledCount')
      .sort({ registeredAt: -1 });

    const [registrations, total] = await Promise.all([
      registrationsQuery.skip(skip).limit(limitNum),
      Registration.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Export registrations to CSV (Admin)
 * @route   GET /api/admin/reports/csv
 * @access  Private (Admin)
 */
export const exportRegistrationsCSV = async (req, res) => {
  try {
    const { semester, status } = req.query;
    const query = {};

    if (semester && semester !== 'all') query.semester = Number(semester);
    if (status && status !== 'all') query.status = status;

    const registrations = await Registration.find(query)
      .populate('student', 'name studentId email department')
      .populate('course', 'courseCode title credits facultyName')
      .sort({ registeredAt: -1 });

    const csvData = exportRegistrationsToCSV(registrations);

    res.header('Content-Type', 'text/csv');
    res.attachment(`course_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csvData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Public or Authenticated
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update system settings (Admin)
 * @route   PUT /api/admin/settings
 * @access  Private (Admin)
 */
export const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting();
    }

    const {
      semesterName,
      academicYear,
      currentSemester,
      registrationStart,
      registrationEnd,
      maxCredits,
      registrationOpen,
      waitingListEnabled,
      allowCancellation,
      cancellationDeadline,
    } = req.body;

    if (semesterName !== undefined) settings.semesterName = semesterName;
    if (academicYear !== undefined) settings.academicYear = academicYear;
    if (currentSemester !== undefined) settings.currentSemester = Number(currentSemester);
    if (registrationStart !== undefined) settings.registrationStart = new Date(registrationStart);
    if (registrationEnd !== undefined) settings.registrationEnd = new Date(registrationEnd);
    if (maxCredits !== undefined) settings.maxCredits = Number(maxCredits);
    if (registrationOpen !== undefined) settings.registrationOpen = Boolean(registrationOpen);
    if (waitingListEnabled !== undefined) settings.waitingListEnabled = Boolean(waitingListEnabled);
    if (allowCancellation !== undefined) settings.allowCancellation = Boolean(allowCancellation);
    if (cancellationDeadline !== undefined) settings.cancellationDeadline = new Date(cancellationDeadline);

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      settings,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
