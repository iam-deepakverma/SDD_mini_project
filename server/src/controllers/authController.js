import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Registration } from '../models/Registration.js';
import { SystemSetting } from '../models/SystemSetting.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_emedley_course_portal_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Send token via cookie and JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  const sanitizedUser = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    program: user.program,
    currentSemester: user.currentSemester,
    completedCourses: user.completedCourses || [],
    avatarUrl: user.avatarUrl,
  };

  return res.status(statusCode).json({
    success: true,
    token,
    user: sanitizedUser,
  });
};

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, studentId, department, program, currentSemester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let finalStudentId = studentId;
    if (!finalStudentId) {
      // Auto-generate student ID if not provided
      const count = await User.countDocuments({ role: 'student' });
      finalStudentId = `STU-2026-${String(count + 101).padStart(4, '0')}`;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId: finalStudentId,
      department: department || 'Computer Science & Engineering',
      program: program || 'B.Tech in Computer Science',
      currentSemester: currentSemester || 5,
      completedCourses: [],
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently disabled. Please contact the administrator.',
      });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Get current logged in user & academic summary
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('completedCourses.course', 'courseCode title credits');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const settings = (await SystemSetting.findOne()) || {};
    const semester = settings.currentSemester || user.currentSemester || 5;

    // Calculate registered credits
    const activeRegistrations = await Registration.find({
      student: user._id,
      semester,
      status: 'registered',
    }).populate('course', 'courseCode title credits facultyName schedule');

    const registeredCredits = activeRegistrations.reduce(
      (sum, r) => sum + (r.creditsAtRegistration || r.course?.credits || 0),
      0
    );

    return res.status(200).json({
      success: true,
      user,
      academicSummary: {
        currentSemester: semester,
        semesterName: settings.semesterName || 'Fall 2026',
        maxCredits: settings.maxCredits || 18,
        registeredCredits,
        remainingCredits: Math.max(0, (settings.maxCredits || 18) - registeredCredits),
        registeredCoursesCount: activeRegistrations.length,
        registrationOpen: settings.registrationOpen ?? true,
        registrationEnd: settings.registrationEnd,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
