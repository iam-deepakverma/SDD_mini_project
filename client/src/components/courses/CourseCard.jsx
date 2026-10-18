import React from 'react';
import {
  BookOpen,
  User,
  Clock,
  MapPin,
  Check,
  Plus,
  AlertTriangle,
  Users,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const CourseCard = ({
  course,
  student,
  isRegistered = false,
  isWaitlisted = false,
  onOpenDetails,
  onJoinWaitlist,
}) => {
  const { isInCart, addToCart, removeFromCart } = useCart();

  const inCart = isInCart(course._id);
  const availableSeats = Math.max(0, course.capacity - course.enrolledCount);
  const isFull = course.enrolledCount >= course.capacity;

  // Prerequisite check against student completed courses
  const completedCodes = new Set(
    (student?.completedCourses || []).map((c) => (c.courseCode || '').toUpperCase())
  );
  const completedIds = new Set(
    (student?.completedCourses || [])
      .filter((c) => c.course)
      .map((c) => (typeof c.course === 'object' ? c.course._id : c.course).toString())
  );

  const missingPrerequisites = (course.prerequisites || []).filter((prereq) => {
    const pCode = (prereq.courseCode || '').toUpperCase();
    const pId = (prereq._id || prereq).toString();
    return !completedCodes.has(pCode) && !completedIds.has(pId);
  });

  const prerequisitesMet = missingPrerequisites.length === 0;

  // Calculate seat fill percentage for mini progress bar
  const seatPercentage = course.capacity > 0
    ? Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100))
    : 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Code, Category, Credits Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#2E5A44] tracking-tight bg-[#E8F1EC] px-2.5 py-1 rounded-xl">
              {course.courseCode}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Sem {course.semester}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="terracotta" size="sm">
              {course.credits} Credits
            </Badge>
            <Badge variant="default" size="sm">
              {course.category || 'Core'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-bold text-slate-800 text-base mb-2 group-hover:text-[#2E5A44] transition-colors line-clamp-1">
          {course.title}
        </h4>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {course.description || 'No description provided.'}
        </p>

        {/* Faculty & Schedule Meta */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{course.facultyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {course.schedule?.days?.join(', ') || 'TBA'} • {course.schedule?.time || 'TBA'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{course.schedule?.room || 'Academic Block'}</span>
          </div>
        </div>

        {/* Prerequisites notice if any */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-500">Prerequisites:</span>
              <span
                className={`font-bold ${
                  prerequisitesMet ? 'text-emerald-600' : 'text-rose-500 flex items-center gap-1'
                }`}
              >
                {!prerequisitesMet && <AlertTriangle className="w-3 h-3" />}
                {prerequisitesMet ? 'Satisfied' : `${missingPrerequisites.length} Missing`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((p) => {
                const code = p.courseCode || p;
                const isMet = completedCodes.has(code.toUpperCase());
                return (
                  <span
                    key={code}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      isMet
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {code} {isMet ? '✓' : '✗'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Capacity / Available Seats Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3" /> Seats:
            </span>
            <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-700'}>
              {availableSeats} of {course.capacity} available
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : seatPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-[#2E5A44]'
              }`}
              style={{ width: `${seatPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetails(course)}
          className="text-xs font-semibold text-slate-600 hover:text-[#2E5A44] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {isRegistered ? (
          <Badge variant="success" size="md">
            <Check className="w-3 h-3 mr-1" /> Registered
          </Badge>
        ) : isWaitlisted ? (
          <Badge variant="warning" size="md">
            Waitlisted
          </Badge>
        ) : !prerequisitesMet ? (
          <button
            onClick={() => onOpenDetails(course)}
            className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 border border-rose-200 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missing Prereqs</span>
          </button>
        ) : isFull ? (
          <button
            onClick={() => onJoinWaitlist && onJoinWaitlist(course)}
            className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-200 transition"
          >
            <span>Join Waitlist</span>
          </button>
        ) : inCart ? (
          <button
            onClick={() => removeFromCart(course._id)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-600 border border-emerald-200 hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>In Cart</span>
          </button>
        ) : (
          <button
            onClick={() => addToCart(course)}
            className="px-4 py-1.5 rounded-full bg-[#E27D60] hover:bg-[#d46d50] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select course</span>
          </button>
        )}
      </div>
    </div>
  );
};
