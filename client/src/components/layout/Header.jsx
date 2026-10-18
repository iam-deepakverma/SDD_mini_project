import React, { useState } from 'react';
import {
  Search,
  Mic,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Menu,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenSidebar, title = 'Dashboard' }) => {
  const { user, isAdmin, logout, switchDemoAccount, academicSummary } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (type) => {
    setShowDemoMenu(false);
    await switchDemoAccount(type);
    navigate(type === 'admin' ? '/admin/dashboard' : '/dashboard');
  };

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 px-3 sm:py-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-100 rounded-none sm:rounded-t-3xl sticky top-0 z-30">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-800 tracking-tight leading-none truncate">
            {title}
          </h2>
          <p className="hidden xs:block text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 sm:mt-1 truncate">
            {currentDate} {academicSummary?.semesterName ? `• ${academicSummary.semesterName}` : ''}
          </p>
        </div>
      </div>

      {/* Center: Search Bar (as in reference image) */}
      <div className="flex-1 max-w-md mx-auto hidden md:block px-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, professors, codes..."
            className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50/80 hover:bg-slate-100/60 focus:bg-white rounded-full border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44] transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/courses?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
          />
          <button
            type="button"
            title="Voice search"
            className="absolute right-3 text-slate-400 hover:text-slate-600"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Controls: Theme switch, Demo Switcher, Notification, User Chip */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Demo Persona Switcher (Convenient for evaluators) */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#E8F1EC] text-[#2E5A44] hover:bg-[#d8e7de] text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition border border-[#A3C9B4]/60"
            title="Switch demo persona for testing"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Demo Switcher</span>
            <span className="inline md:hidden">Demo</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs">
              <div className="px-2 py-1 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                Select Persona to Test
              </div>
              <button
                onClick={() => handleDemoSwitch('student-eligible')}
                className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 text-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-emerald-800">Alex Mercer (Student)</p>
                  <p className="text-[10px] text-slate-400">Junior CS • Prereqs Met</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoSwitch('student-missing-prereq')}
                className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-amber-800">Maya Chen (Student)</p>
                  <p className="text-[10px] text-slate-400">Sophomore • Missing CS201</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoSwitch('student-high-credits')}
                className="w-full text-left p-2 rounded-xl hover:bg-orange-50 text-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-orange-800">Jordan Hayes (Student)</p>
                  <p className="text-[10px] text-slate-400">Senior • Near Credit Ceiling</p>
                </div>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => handleDemoSwitch('admin')}
                className="w-full text-left p-2 rounded-xl hover:bg-purple-50 text-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-purple-800">Sarah Lin (Administrator)</p>
                  <p className="text-[10px] text-slate-400">Dean of Registry • Admin Access</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Pill (Sun / Moon) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60">
          <button
            onClick={() => setIsDarkMode(false)}
            className={`p-1 rounded-full transition ${!isDarkMode ? 'bg-white shadow-xs text-amber-500' : 'text-slate-400'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDarkMode(true)}
            className={`p-1 rounded-full transition ${isDarkMode ? 'bg-white shadow-xs text-indigo-500' : 'text-slate-400'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E27D60]" />
        </button>

        {/* User Profile Badge (Rightmost in reference image) */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8F1EC] text-[#2E5A44] font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EM'}
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <p className="text-xs font-bold text-slate-800">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Guest'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-fadeIn text-xs">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate(isAdmin ? '/admin/settings' : '/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAdmin ? 'System Settings' : 'My Profile'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
