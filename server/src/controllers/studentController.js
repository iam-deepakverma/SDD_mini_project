import { User } from '../models/User.js';
import { Registration } from '../models/Registration.js';
import { Course } from '../models/Course.js';

/**
 * @desc    Get current student full profile with registrations & transcript
 * @route   GET /api/students/me
 * @access  Private (Student)
 */
export const getMyProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const registrations = await Registration.find({ student: student._id })
      .populate('course', 'courseCode title credits facultyName department schedule')
      .sort({ registeredAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all students (Admin)
 * @route   GET /api/students
 * @access  Private (Admin)
 */
export const getAllStudents = async (req, res) => {
  try {
    const { search, department, semester, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { studentId: regex }];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.currentSemester = Number(semester);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single student details with registrations & completed courses (Admin)
 * @route   GET /api/students/:id
 * @access  Private (Admin)
 */
export const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const registrations = await Registration.find({ student: student._id })
      .populate('course')
      .sort({ registeredAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update student academic record / completed courses (Admin)
 * @route   PATCH /api/students/:id/academic-record
 * @access  Private (Admin)
 */
export const updateAcademicRecord = async (req, res) => {
  try {
    const { completedCourses, currentSemester, department, program, isActive } = req.body;
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (completedCourses !== undefined) {
      // Validate completed courses
      student.completedCourses = completedCourses.map((c) => ({
        courseCode: c.courseCode.toUpperCase().trim(),
        title: c.title || '',
        grade: c.grade || 'A',
        credits: Number(c.credits) || 3,
        completedSemester: Number(c.completedSemester) || 1,
        course: c.course || null,
      }));
    }

    if (currentSemester !== undefined) student.currentSemester = Number(currentSemester);
    if (department !== undefined) student.department = department.trim();
    if (program !== undefined) student.program = program.trim();
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student academic record updated successfully.',
      student,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
