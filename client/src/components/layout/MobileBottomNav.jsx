import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Clock,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const MobileBottomNav = () => {
  const { isAdmin } = useAuth();
  const { selectedCourses } = useCart();

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Catalogue', path: '/courses', icon: BookOpen },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: selectedCourses.length > 0 ? selectedCourses.length : null,
    },
    { label: 'Enrolled', path: '/my-registrations', icon: GraduationCap },
    { label: 'Waitlist', path: '/waitlist', icon: Clock },
  ];

  const adminNavItems = [
    { label: 'Stats', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Records', path: '/admin/registrations', icon: ClipboardList },
    { label: 'Waitlist', path: '/admin/waitlists', icon: Clock },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                  isActive
                    ? 'text-[#2E5A44] font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E27D60] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-[#2E5A44]' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#2E5A44] absolute -bottom-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
