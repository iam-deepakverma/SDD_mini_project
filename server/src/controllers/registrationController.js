import { RegistrationService } from '../services/registrationService.js';
import { Registration } from '../models/Registration.js';

/**
 * @desc    Validate selected courses prior to registration confirmation
 * @route   POST /api/registrations/validate
 * @access  Private (Student)
 */
export const validateSelection = async (req, res) => {
  try {
    const { courseIds, semester } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of course IDs to validate.',
      });
    }

    const validation = await RegistrationService.validateBatch(
      req.user._id,
      courseIds,
      semester
    );

    return res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Validation failed.',
    });
  }
};

/**
 * @desc    Confirm and submit course registration
 * @route   POST /api/registrations/confirm
 * @access  Private (Student)
 */
export const confirmRegistration = async (req, res) => {
  try {
    const { courseIds, semester } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No courses selected for registration.',
      });
    }

    const result = await RegistrationService.registerCourses(
      req.user._id,
      courseIds,
      semester
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Course registration failed.',
    });
  }
};

/**
 * @desc    Get current student's course registrations & history
 * @route   GET /api/registrations/me
 * @access  Private (Student)
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const { semester, status } = req.query;
    const query = { student: req.user._id };

    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const registrations = await Registration.find(query)
      .populate({
        path: 'course',
        select: 'courseCode title description credits facultyName department schedule room capacity enrolledCount',
      })
      .sort({ registeredAt: -1 });

    const totalActiveCredits = registrations
      .filter((r) => r.status === 'registered')
      .reduce((sum, r) => sum + (r.creditsAtRegistration || r.course?.credits || 0), 0);

    return res.status(200).json({
      success: true,
      count: registrations.length,
      totalActiveCredits,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single registration details (printable confirmation slip)
 * @route   GET /api/registrations/:id
 * @access  Private
 */
export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('student', 'name email studentId department program currentSemester')
      .populate('course');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    // Access check: Only owner student or admin can access
    const isOwner = registration.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    return res.status(200).json({ success: true, registration });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cancel a course registration
 * @route   POST /api/registrations/:id/cancel
 * @access  Private
 */
export const cancelRegistration = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await RegistrationService.cancelRegistration(
      req.params.id,
      req.user,
      reason
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.registration,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel registration.',
    });
  }
};
