import { Course } from '../models/Course.js';
import { Registration } from '../models/Registration.js';
import { Waitlist } from '../models/Waitlist.js';

/**
 * @desc    Get all courses with search, filtering, sorting & pagination
 * @route   GET /api/courses
 * @access  Public (or authenticated)
 */
export const getCourses = async (req, res) => {
  try {
    const {
      search,
      department,
      semester,
      credits,
      category,
      availability,
      sortBy = 'courseCode',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
      includeInactive,
    } = req.query;

    const query = {};

    // Inactive filter (only admins can view inactive courses)
    if (!includeInactive || req.user?.role !== 'admin') {
      query.isActive = true;
    }

    // Search by code, title, faculty
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { courseCode: searchRegex },
        { title: searchRegex },
        { facultyName: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (credits && credits !== 'All') {
      query.credits = Number(credits);
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Availability filter
    if (availability === 'available') {
      query.$expr = { $lt: ['$enrolledCount', '$capacity'] };
    } else if (availability === 'full') {
      query.$expr = { $gte: ['$enrolledCount', '$capacity'] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('prerequisites', 'courseCode title credits')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(query),
    ]);

    // Attach virtual fields for lean objects
    const coursesWithVirtuals = courses.map((c) => ({
      ...c,
      availableSeats: Math.max(0, c.capacity - c.enrolledCount),
      isFull: c.enrolledCount >= c.capacity,
    }));

    return res.status(200).json({
      success: true,
      count: coursesWithVirtuals.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      courses: coursesWithVirtuals,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'prerequisites',
      'courseCode title credits department'
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private (Admin only)
 */
export const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      title,
      description,
      credits,
      facultyName,
      facultyEmail,
      department,
      semester,
      prerequisites,
      capacity,
      schedule,
      category,
    } = req.body;

    // Check duplicate code
    const existing = await Course.findOne({
      courseCode: (courseCode || '').toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A course with code '${courseCode.toUpperCase()}' already exists.`,
      });
    }

    const course = await Course.create({
      courseCode: (courseCode || '').toUpperCase().trim(),
      title: (title || '').trim(),
      description,
      credits: Number(credits),
      facultyName: (facultyName || '').trim(),
      facultyEmail: (facultyEmail || '').trim(),
      department: (department || '').trim(),
      semester: Number(semester),
      prerequisites: prerequisites || [],
      capacity: Number(capacity),
      enrolledCount: 0,
      schedule: schedule || { days: ['Mon', 'Wed'], time: '10:00 AM - 11:30 AM', room: 'Block B-101' },
      category: category || 'Core',
      isActive: true,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      'prerequisites',
      'courseCode title credits'
    );

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: populatedCourse,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin only)
 */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const {
      courseCode,
      title,
      description,
      credits,
      facultyName,
      facultyEmail,
      department,
      semester,
      prerequisites,
      capacity,
      schedule,
      category,
      isActive,
    } = req.body;

    // Guard: capacity cannot be lower than current enrolled count
    if (capacity !== undefined && Number(capacity) < course.enrolledCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be reduced below current enrolled students (${course.enrolledCount}).`,
      });
    }

    // Check courseCode uniqueness if altered
    if (courseCode && courseCode.toUpperCase().trim() !== course.courseCode) {
      const codeExists = await Course.findOne({
        courseCode: courseCode.toUpperCase().trim(),
        _id: { $ne: course._id },
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: `Course code '${courseCode.toUpperCase()}' is already in use.`,
        });
      }
      course.courseCode = courseCode.toUpperCase().trim();
    }

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description;
    if (credits !== undefined) course.credits = Number(credits);
    if (facultyName !== undefined) course.facultyName = facultyName.trim();
    if (facultyEmail !== undefined) course.facultyEmail = facultyEmail.trim();
    if (department !== undefined) course.department = department.trim();
    if (semester !== undefined) course.semester = Number(semester);
    if (prerequisites !== undefined) course.prerequisites = prerequisites;
    if (capacity !== undefined) course.capacity = Number(capacity);
    if (schedule !== undefined) course.schedule = schedule;
    if (category !== undefined) course.category = category;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();

    const updated = await Course.findById(course._id).populate(
      'prerequisites',
      'courseCode title credits'
    );

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle course active status
 * @route   PATCH /api/courses/:id/status
 * @access  Private (Admin only)
 */
export const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    course.isActive = !course.isActive;
    await course.save();

    return res.status(200).json({
      success: true,
      message: `Course marked as ${course.isActive ? 'Active' : 'Inactive'}.`,
      isActive: course.isActive,
      course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete course (safeguarded)
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin only)
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Safety check: Cannot delete course if active registrations exist
    const activeRegsCount = await Registration.countDocuments({
      course: course._id,
      status: 'registered',
    });

    if (activeRegsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${activeRegsCount} active enrolled student(s). Please deactivate the course instead.`,
      });
    }

    // Also check if other courses reference this as a prerequisite
    const prereqDependents = await Course.find({
      prerequisites: course._id,
    }).select('courseCode title');

    if (prereqDependents.length > 0) {
      const depCodes = prereqDependents.map((d) => d.courseCode).join(', ');
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. It is listed as a prerequisite for: ${depCodes}. Remove it from those courses first.`,
      });
    }

    await Course.findByIdAndDelete(course._id);
    await Waitlist.deleteMany({ course: course._id });

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
