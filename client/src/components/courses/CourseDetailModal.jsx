import React from 'react';
import {
  X,
  BookOpen,
  User,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const CourseDetailModal = ({
  course,
  student,
  isOpen,
  onClose,
  onJoinWaitlist,
}) => {
  if (!isOpen || !course) return null;

  const { isInCart, addToCart, removeFromCart } = useCart();
  const inCart = isInCart(course._id);
  const availableSeats = Math.max(0, course.capacity - course.enrolledCount);
  const isFull = course.enrolledCount >= course.capacity;

  const completedCodes = new Set(
    (student?.completedCourses || []).map((c) => (c.courseCode || '').toUpperCase())
  );

  const missingPrerequisites = (course.prerequisites || []).filter((p) => {
    const code = (p.courseCode || p).toUpperCase();
    return !completedCodes.has(code);
  });

  const prerequisitesMet = missingPrerequisites.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="font-extrabold text-base text-[#2E5A44] bg-[#E8F1EC] px-3 py-1 rounded-xl">
            {course.courseCode}
          </span>
          <Badge variant="terracotta">{course.credits} Academic Credits</Badge>
          <Badge variant="default">Semester {course.semester}</Badge>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
          {course.title}
        </h3>

        {/* Course Description */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Course Overview
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {course.description || 'No detailed syllabus available.'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Faculty & Department
            </h5>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-semibold">
                <User className="w-4 h-4 text-slate-400" />
                <span>{course.facultyName}</span>
              </div>
              {course.facultyEmail && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{course.facultyEmail}</span>
                </div>
              )}
              <div className="text-slate-500 pl-6">
                Department: {course.department}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Class Schedule & Location
            </h5>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{course.schedule?.days?.join(', ') || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{course.schedule?.time || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{course.schedule?.room || 'Academic Block'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prerequisites Section */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Prerequisite Verification
          </h4>
          {course.prerequisites && course.prerequisites.length > 0 ? (
            <div className="space-y-2">
              {course.prerequisites.map((p) => {
                const code = (p.courseCode || p).toUpperCase();
                const title = p.title || '';
                const isCompleted = completedCodes.has(code);

                return (
                  <div
                    key={code}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">{code}</span>
                        {title && <span className="ml-1.5 text-slate-600">— {title}</span>}
                      </div>
                    </div>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Missing Requirement'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              No prerequisites required. This course is open to all eligible students.
            </p>
          )}
        </div>

        {/* Seat Availability Summary */}
        <div className="flex items-center justify-between bg-[#E8F1EC] p-4 rounded-2xl border border-[#A3C9B4]/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2E5A44] shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2E5A44]">Class Capacity</p>
              <p className="text-xs text-slate-600">
                {course.enrolledCount} enrolled of {course.capacity} total seats
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                isFull
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-white text-[#2E5A44] shadow-xs'
              }`}
            >
              {availableSeats} Seats Left
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>

          {!prerequisitesMet ? (
            <div className="text-right">
              <span className="text-xs text-rose-600 font-semibold block mb-0.5">
                Prerequisites incomplete
              </span>
              <button
                disabled
                className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
              >
                Registration Locked
              </button>
            </div>
          ) : isFull ? (
            <button
              onClick={() => {
                onClose();
                onJoinWaitlist && onJoinWaitlist(course);
              }}
              className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
            >
              Join Course Waitlist
            </button>
          ) : inCart ? (
            <button
              onClick={() => removeFromCart(course._id)}
              className="px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition"
            >
              Remove from Selection Cart
            </button>
          ) : (
            <button
              onClick={() => {
                addToCart(course);
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-[#E27D60] hover:bg-[#d06b4e] text-white text-xs font-bold shadow-sm transition"
            >
              Add to Selection Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
