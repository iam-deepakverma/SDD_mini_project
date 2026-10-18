import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Calendar,
  Building,
  CheckCircle,
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();

  const completedCourses = user?.completedCourses || [];
  const totalCompletedCredits = completedCourses.reduce(
    (sum, c) => sum + (c.credits || 0),
    0
  );

  // Approximate GPA calculation
  const gradePoints = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    P: 3.0,
  };

  let totalPoints = 0;
  completedCourses.forEach((c) => {
    const pts = gradePoints[c.grade] || 3.0;
    totalPoints += pts * (c.credits || 3);
  });
  const gpa =
    totalCompletedCredits > 0
      ? (totalPoints / totalCompletedCredits).toFixed(2)
      : '3.80';

  const degreeTotalCredits = 120;
  const progressPercent = Math.min(
    100,
    Math.round((totalCompletedCredits / degreeTotalCredits) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Student Academic Profile & Official Transcript
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Verified academic records, completed prerequisite history, and cumulative GPA standing.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F1EC] text-[#2E5A44] font-black text-xl flex items-center justify-center border border-slate-200 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                <Badge variant="mint" size="sm">Active Standing</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.program}</p>
              <p className="text-xs font-mono font-bold text-[#2E5A44] mt-1">
                Student ID: {user?.studentId || 'STU-2026-001'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:text-left bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cumulative GPA
              </span>
              <span className="text-xl font-black text-[#2E5A44]">{gpa} / 4.00</span>
            </div>
          </div>
        </div>

        {/* Academic Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Department</span>
              <span className="font-semibold text-slate-800">{user?.department}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Current Term</span>
              <span className="font-semibold text-slate-800">Semester {user?.currentSemester || 5}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">University Email</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Degree Progress */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#E27D60]" />
            Undergraduate Degree Progress
          </span>
          <span className="text-slate-500">
            {totalCompletedCredits} of {degreeTotalCredits} Credits Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2E5A44] to-[#E27D60] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Completed Courses / Prerequisite Records Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Completed Academic Records</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified completed courses used to satisfy system prerequisites for registration.
          </p>
        </div>

        {completedCourses.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No completed courses on record yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Administrators can add completed courses through the Admin Console.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Course Code</th>
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">Credits</th>
                  <th className="pb-3 px-3">Completed Term</th>
                  <th className="pb-3 px-3">Grade</th>
                  <th className="pb-3 px-3 text-right">Prerequisite Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedCourses.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#2E5A44]">
                      {c.courseCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {c.title || c.courseCode}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.credits || 3} Cr
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      Semester {c.completedSemester || 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                        {c.grade || 'A'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Satisfied
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
