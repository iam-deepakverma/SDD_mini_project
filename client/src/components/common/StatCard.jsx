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
      className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
          {Icon && <Icon className="w-5 h-5 stroke-[2.2]" />}
        </div>
        {tagText && (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${tagBg}`}>
            {tagText}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
          {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};
