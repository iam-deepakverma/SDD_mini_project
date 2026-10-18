import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import {
  Users,
  Search,
  BookOpen,
  Plus,
  Trash2,
  X,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const StudentManagementPage = () => {
  const { dataVersion, notifyDataChanged } = useAuth();
  const [students, setStudents] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal: Manage Student Academic Records
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newGrade, setNewGrade] = useState('A');
  const [newCredits, setNewCredits] = useState(4);
  const [newCompletedSem, setNewCompletedSem] = useState(2);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounced search to prevent rapid queries on keystrokes
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = async (showLoading = false) => {
    if (showLoading && students.length === 0) setIsLoading(true);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get(`/students?search=${encodeURIComponent(debouncedSearch)}`),
        api.get('/courses?limit=100'),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students || []);
      }
      if (coursesRes.data.success) {
        setCoursesList(coursesRes.data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(students.length === 0);
  }, [debouncedSearch]);

  useEffect(() => {
    if (dataVersion > 0) {
      fetchStudents(false);
    }
  }, [dataVersion]);

  const openRecordModal = (student) => {
    setSelectedStudent(student);
    setCompletedCourses(student.completedCourses || []);
    setNewCourseCode('');
    setNewCourseTitle('');
  };

  const handleAddCompletedCourse = () => {
    if (!newCourseCode.trim()) {
      toast.error('Course code is required.');
      return;
    }

    const upperCode = newCourseCode.trim().toUpperCase();
    if (completedCourses.some((c) => c.courseCode === upperCode)) {
      toast.error(`${upperCode} is already in the completed courses list.`);
      return;
    }

    setCompletedCourses([
      ...completedCourses,
      {
        courseCode: upperCode,
        title: newCourseTitle.trim() || upperCode,
        grade: newGrade,
        credits: Number(newCredits),
        completedSemester: Number(newCompletedSem),
      },
    ]);

    setNewCourseCode('');
    setNewCourseTitle('');
  };

  const handleRemoveCompletedCourse = (codeToRemove) => {
    setCompletedCourses(completedCourses.filter((c) => c.courseCode !== codeToRemove));
  };

  const handleSaveAcademicRecord = async () => {
    if (!selectedStudent) return;
    setIsUpdating(true);
    try {
      const res = await api.patch(`/students/${selectedStudent._id}/academic-record`, {
        completedCourses,
      });

      if (res.data.success) {
        toast.success(`Updated academic record for ${selectedStudent.name}.`);
        setSelectedStudent(null);
        notifyDataChanged('admin_update_student_record');
        await fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update academic record.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Student Directory & Academic Records
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          View enrolled students and assign verified completed courses to fulfill prerequisite requirements.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {students.length} Registered Students
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3">Student Name</th>
              <th className="pb-3 px-3">Student ID</th>
              <th className="pb-3 px-3">Email</th>
              <th className="pb-3 px-3">Program & Dept</th>
              <th className="pb-3 px-3">Current Term</th>
              <th className="pb-3 px-3">Completed Prereqs</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-3 font-bold text-slate-800">
                  {student.name}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#2E5A44]">
                  {student.studentId}
                </td>
                <td className="py-3 px-3 text-slate-500">
                  {student.email}
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {student.department}
                </td>
                <td className="py-3 px-3 text-slate-700 font-medium">
                  Semester {student.currentSemester}
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {(student.completedCourses || []).map((c) => (
                      <span
                        key={c.courseCode}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200"
                      >
                        {c.courseCode} ({c.grade})
                      </span>
                    ))}
                    {(student.completedCourses || []).length === 0 && (
                      <span className="text-slate-400">0 recorded</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => openRecordModal(student)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#2E5A44] bg-[#E8F1EC] hover:bg-[#d8e7de] border border-[#A3C9B4]/60 transition"
                  >
                    Manage Record
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Manage Academic Records & Prerequisites */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1EC] text-[#2E5A44] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Academic Record: {selectedStudent.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Student ID: {selectedStudent.studentId} • {selectedStudent.department}
                </p>
              </div>
            </div>

            {/* List of currently assigned completed courses */}
            <div className="mt-4 mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Completed Course Records ({completedCourses.length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {completedCourses.map((c) => (
                  <div
                    key={c.courseCode}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#2E5A44] mr-2">
                        {c.courseCode}
                      </span>
                      <span className="font-semibold text-slate-700">{c.title}</span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        ({c.credits} Cr • Sem {c.completedSemester} • Grade: {c.grade})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCompletedCourse(c.courseCode)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Completed Course Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#2E5A44]" />
                Add Completed Course (Satisfies Prerequisites)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Quick Select from Catalog</label>
                  <select
                    onChange={(e) => {
                      const selected = coursesList.find((c) => c.courseCode === e.target.value);
                      if (selected) {
                        setNewCourseCode(selected.courseCode);
                        setNewCourseTitle(selected.title);
                        setNewCredits(selected.credits);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  >
                    <option value="">-- Choose Course --</option>
                    {coursesList.map((c) => (
                      <option key={c._id} value={c.courseCode}>
                        {c.courseCode} — {c.title} ({c.credits} Cr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Course Code</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS201"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  >
                    {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'P'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Completed Sem</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCompletedSem}
                    onChange={(e) => setNewCompletedSem(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCompletedCourse}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-semibold transition"
              >
                + Add to Academic Record
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveAcademicRecord}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#2E5A44] hover:bg-[#224333] text-white shadow-sm transition"
              >
                {isUpdating ? 'Saving Record...' : 'Save Academic Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
