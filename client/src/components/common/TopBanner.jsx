import React from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBanner = ({
  tag = 'Academic Year 2026-2027',
  title = 'Student Course Registration Portal — Fall Semester 2026',
  description = 'Explore university offerings, verify required prerequisites, track credit limits, and confirm your semester schedule.',
  primaryActionText = 'Browse Courses',
  primaryActionLink = '/courses',
  secondaryActionText,
  secondaryActionLink,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#C78652] via-[#487254] to-[#254F3B] p-6 lg:p-8 text-white shadow-md">
      {/* Subtle radial backdrop accent */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-10 w-60 h-60 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-amber-100 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{tag}</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            {title}
          </h2>

          <p className="text-sm text-emerald-50/90 leading-relaxed mb-5">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {primaryActionLink && (
              <Link
                to={primaryActionLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#254F3B] hover:bg-emerald-50 font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all duration-150"
              >
                <BookOpen className="w-4 h-4" />
                <span>{primaryActionText}</span>
              </Link>
            )}

            {secondaryActionText && secondaryActionLink && (
              <Link
                to={secondaryActionLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium text-xs tracking-wide border border-white/20 transition-all duration-150"
              >
                <span>{secondaryActionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Right side visual badge / isometric chart simulation from reference image */}
        <div className="hidden lg:flex items-center justify-center pr-4">
          <div className="relative bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-inner flex flex-col items-center min-w-[200px]">
            <div className="flex items-end gap-2.5 h-20 mb-3 px-2">
              <div className="w-5 bg-emerald-200/40 rounded-t h-10 animate-pulse" />
              <div className="w-5 bg-emerald-300/60 rounded-t h-16" />
              <div className="w-5 bg-white rounded-t h-20 shadow-md" />
              <div className="w-5 bg-amber-200/80 rounded-t h-12" />
            </div>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider block">
                Portal Status
              </span>
              <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                Registration Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
