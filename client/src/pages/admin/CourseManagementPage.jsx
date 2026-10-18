import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const CourseManagementPage = () => {
  const { dataVersion, notifyDataChanged } = useAuth();
  const [courses, setCourses] = useState([]);
  const [allCoursesForPrereqs, setAllCoursesForPrereqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  // Modal State: Create or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    facultyName: '',
    facultyEmail: '',
    department: 'Computer Science',
    semester: 5,
    prerequisites: [],
    capacity: 40,
    category: 'Core',
    scheduleDays: 'Mon, Wed',
    scheduleTime: '10:00 AM - 11:30 AM',
    scheduleRoom: 'Academic Block B-201',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async (showLoading = false) => {
    if (showLoading && courses.length === 0) setIsLoading(true);
    try {
      const res = await api.get('/courses?includeInactive=true&limit=100');
      if (res.data.success) {
        setCourses(res.data.courses || []);
        setAllCoursesForPrereqs(res.data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(true);
  }, []);

  useEffect(() => {
    if (dataVersion > 0) {
      fetchCourses(false);
    }
  }, [dataVersion]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,
      facultyName: '',
      facultyEmail: '',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [],
      capacity: 40,
      category: 'Core',
      scheduleDays: 'Mon, Wed',
      scheduleTime: '10:00 AM - 11:30 AM',
      scheduleRoom: 'Academic Block B-201',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description || '',
      credits: course.credits,
      facultyName: course.facultyName,
      facultyEmail: course.facultyEmail || '',
      department: course.department,
      semester: course.semester,
      prerequisites: (course.prerequisites || []).map((p) => p._id || p),
      capacity: course.capacity,
      category: course.category || 'Core',
      scheduleDays: course.schedule?.days?.join(', ') || 'Mon, Wed',
      scheduleTime: course.schedule?.time || '10:00 AM - 11:30 AM',
      scheduleRoom: course.schedule?.room || 'Academic Block B-201',
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        courseCode: formData.courseCode,
        title: formData.title,
        description: formData.description,
        credits: Number(formData.credits),
        facultyName: formData.facultyName,
        facultyEmail: formData.facultyEmail,
        department: formData.department,
        semester: Number(formData.semester),
        prerequisites: formData.prerequisites,
        capacity: Number(formData.capacity),
        category: formData.category,
        schedule: {
          days: formData.scheduleDays.split(',').map((d) => d.trim()),
          time: formData.scheduleTime.trim(),
          room: formData.scheduleRoom.trim(),
        },
      };

      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, payload);
        toast.success('Course updated successfully.');
      } else {
        await api.post('/courses', payload);
        toast.success('Course created successfully.');
      }

      setIsModalOpen(false);
      notifyDataChanged('course_saved');
      await fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (courseId) => {
    try {
      const res = await api.patch(`/courses/${courseId}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        notifyDataChanged('course_status_toggled');
        await fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/courses/${deletingCourse._id}`);
      if (res.data.success) {
        toast.success('Course deleted successfully.');
        setDeletingCourse(null);
        notifyDataChanged('course_deleted');
        await fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.facultyName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === 'All' || c.department === department;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Curriculum & Course Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure courses, faculty assignments, prerequisite dependencies, and capacity limits.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-full bg-[#E27D60] hover:bg-[#d06b4e] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, title, professor..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Department:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3">Code</th>
              <th className="pb-3 px-3">Title</th>
              <th className="pb-3 px-3">Credits</th>
              <th className="pb-3 px-3">Faculty</th>
              <th className="pb-3 px-3">Prerequisites</th>
              <th className="pb-3 px-3">Enrolled / Cap</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCourses.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-3 font-mono font-bold text-[#2E5A44]">
                  {c.courseCode}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">
                  {c.title}
                </td>
                <td className="py-3 px-3">
                  <Badge variant="terracotta" size="sm">{c.credits} Cr</Badge>
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {c.facultyName}
                </td>
                <td className="py-3 px-3">
                  {c.prerequisites && c.prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.prerequisites.map((p) => (
                        <span
                          key={p.courseCode || p}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                        >
                          {p.courseCode || p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>
                <td className="py-3 px-3 font-medium">
                  <span
                    className={
                      c.enrolledCount >= c.capacity
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-700'
                    }
                  >
                    {c.enrolledCount} / {c.capacity}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => handleToggleStatus(c._id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCourse(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingCourse ? `Edit Course: ${editingCourse.courseCode}` : 'Create New Course Offering'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., CS301"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Database Management Systems"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline topics covered, course goals, and learning outcomes..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credits (1-6) *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capacity (Max Seats) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyName}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    placeholder="e.g., Dr. Edgar Codd"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Prerequisites Multi-Select Picker */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Required Prerequisites (Select all that apply)
                </label>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto space-y-1.5">
                  {allCoursesForPrereqs
                    .filter((c) => !editingCourse || c._id !== editingCourse._id)
                    .map((course) => {
                      const isSelected = formData.prerequisites.includes(course._id);
                      return (
                        <label
                          key={course._id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-white p-1 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  prerequisites: [...formData.prerequisites, course._id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  prerequisites: formData.prerequisites.filter((id) => id !== course._id),
                                });
                              }
                            }}
                            className="rounded text-[#2E5A44] focus:ring-[#2E5A44]"
                          />
                          <span className="font-mono font-bold">{course.courseCode}</span>
                          <span>— {course.title}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Schedule Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Meeting Days</label>
                  <input
                    type="text"
                    value={formData.scheduleDays}
                    onChange={(e) => setFormData({ ...formData, scheduleDays: e.target.value })}
                    placeholder="Mon, Wed"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class Time</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    placeholder="10:00 AM - 11:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Room</label>
                  <input
                    type="text"
                    value={formData.scheduleRoom}
                    onChange={(e) => setFormData({ ...formData, scheduleRoom: e.target.value })}
                    placeholder="Block C-301"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full font-bold bg-[#2E5A44] hover:bg-[#224333] text-white shadow-sm transition"
                >
                  {isSaving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course Offering"
        message={`Are you sure you want to delete ${deletingCourse?.courseCode} (${deletingCourse?.title})? This will permanently delete the course record. Courses with active student registrations cannot be deleted and must be deactivated instead.`}
        confirmText="Delete Course"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
