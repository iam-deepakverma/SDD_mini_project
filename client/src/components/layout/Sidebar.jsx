import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Clock,
  UserCheck,
  BookMarked,
  Users,
  ClipboardList,
  ListOrdered,
  Sliders,
  LogOut,
  HelpCircle,
  Hexagon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const { selectedCourses } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Course Catalogue', path: '/courses', icon: BookOpen },
    {
      label: 'Selection Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: selectedCourses.length > 0 ? selectedCourses.length : null,
    },
    { label: 'My Registrations', path: '/my-registrations', icon: GraduationCap },
    { label: 'Waitlist Status', path: '/waitlist', icon: Clock },
    { label: 'Academic Profile', path: '/profile', icon: UserCheck },
  ];

  const adminNavItems = [
    { label: 'Dashboard & Stats', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Course Management', path: '/admin/courses', icon: BookMarked },
    { label: 'Student Directory', path: '/admin/students', icon: Users },
    { label: 'Registration Records', path: '/admin/registrations', icon: ClipboardList },
    { label: 'Waitlist Queue', path: '/admin/waitlists', icon: ListOrdered },
    { label: 'Semester Settings', path: '/admin/settings', icon: Sliders },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2E5A44] via-[#E27D60] to-[#DDA15E] p-0.5 flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-[#2E5A44] fill-[#E8F1EC]" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-800 leading-none">
                  Emedley
                </h1>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  {isAdmin ? 'Admin Console' : 'Student Portal'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FCEEE9] text-[#E27D60] shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-[#E27D60] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Visual card widget at bottom (direct replica from reference image) */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#C78652] via-[#3B6E52] to-[#204231] text-white mb-4 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full border border-white bg-amber-200 flex items-center justify-center text-[9px] font-bold text-slate-800">
                    AL
                  </div>
                  <div className="w-6 h-6 rounded-full border border-white bg-emerald-200 flex items-center justify-center text-[9px] font-bold text-slate-800">
                    SL
                  </div>
                  <div className="w-6 h-6 rounded-full border border-white bg-orange-200 flex items-center justify-center text-[9px] font-bold text-slate-800">
                    14+
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-medium text-emerald-50/95 leading-tight mb-3">
                Need academic advising or prerequisites assistance?
              </p>

              <div className="flex items-center gap-2">
                <NavLink
                  to={isAdmin ? '/admin/settings' : '/profile'}
                  className="w-full text-center py-1.5 px-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition backdrop-blur-xs"
                >
                  {isAdmin ? 'System Rules' : 'My Records'}
                </NavLink>
              </div>
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#E8F1EC] text-[#2E5A44] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EM'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
