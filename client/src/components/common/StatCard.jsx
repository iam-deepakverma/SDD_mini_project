import React from 'react';

export const StatCard = ({
  icon: Icon,
  iconBg = 'bg-[#FCEEE9]',
  iconColor = 'text-[#E27D60]',
  tagText,
  tagBg = 'bg-orange-50 text-orange-600',
  label,
  value,
  subtext,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-200' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-2.5 sm:mb-4">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
        </div>
        {tagText && (
          <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full truncate max-w-[95px] sm:max-w-none ${tagBg}`}>
            {tagText}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap sm:flex-nowrap">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
          {subtext && <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};
