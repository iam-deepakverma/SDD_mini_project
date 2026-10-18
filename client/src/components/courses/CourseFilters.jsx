import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export const CourseFilters = ({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  credits,
  onCreditsChange,
  availability,
  onAvailabilityChange,
  sortBy,
  onSortChange,
  totalResults,
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm mb-5 sm:mb-6 space-y-3 sm:space-y-4">
      {/* Top Filter Row: Search & Availability Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by course code, title, professor name..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44] transition"
          />
        </div>

        {/* Availability Toggle Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto justify-around sm:justify-start shrink-0">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'available', label: 'Open Seats' },
            { id: 'full', label: 'Full / Waitlist' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onAvailabilityChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                availability === tab.id
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Dropdowns Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Department */}
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
          </select>

          {/* Credits */}
          <select
            value={credits}
            onChange={(e) => onCreditsChange(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          >
            <option value="All">All Credits</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="courseCode">Course Code</option>
              <option value="title">Course Title</option>
              <option value="credits">Credits</option>
              <option value="enrolledCount">Enrollment Count</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-xl">
            {totalResults} {totalResults === 1 ? 'Course' : 'Courses'}
          </span>
        </div>
      </div>
    </div>
  );
};
