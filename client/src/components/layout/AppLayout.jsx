import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Map route pathname to user friendly title
  const getPageTitle = (path) => {
    if (path.startsWith('/admin/dashboard')) return 'Admin Dashboard & Analytics';
    if (path.startsWith('/admin/courses')) return 'Course Management';
    if (path.startsWith('/admin/students')) return 'Student Directory';
    if (path.startsWith('/admin/registrations')) return 'Registration Records';
    if (path.startsWith('/admin/waitlists')) return 'Waitlist Management';
    if (path.startsWith('/admin/settings')) return 'Semester Settings';
    if (path.startsWith('/courses')) return 'Course Catalogue & Offerings';
    if (path.startsWith('/cart')) return 'Selection Cart & Review';
    if (path.startsWith('/my-registrations')) return 'My Registered Courses';
    if (path.startsWith('/waitlist')) return 'Waiting List Status';
    if (path.startsWith('/profile')) return 'Student Academic Profile';
    return 'Dashboard';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#EAEFEA] p-2 sm:p-4 md:p-6 flex items-center justify-center">
      {/* Main floating white canvas replicating the Emedley UI design */}
      <div className="w-full max-w-[1600px] min-h-[92vh] bg-white rounded-3xl md:rounded-[36px] shadow-sm border border-slate-200/80 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <Header onOpenSidebar={() => setSidebarOpen(true)} title={title} />

          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50/40">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
