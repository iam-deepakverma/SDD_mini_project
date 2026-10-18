import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { TopBanner } from '../../components/common/TopBanner.jsx';
import {
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  Download,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { useAuth } from '../../context/AuthContext.jsx';

export const AdminDashboard = () => {
  const { dataVersion } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async (showLoading = false) => {
    if (showLoading && !data) setIsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  useEffect(() => {
    if (dataVersion > 0) {
      fetchDashboard(false);
    }
  }, [dataVersion]);

  const stats = data?.stats || {};
  const settings = data?.settings || {};
  const departmentStats = data?.departmentStats || [];
  const topCourses = data?.topCourses || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <TopBanner
        tag="Administrative Management & Oversight"
        title="University Registration Performance & Analytics"
        description="Comprehensive real-time statistics on seat utilization, department demand, active course waitlists, and student enrollments."
        primaryActionText="Manage Courses"
        primaryActionLink="/admin/courses"
        secondaryActionText="System Settings"
        secondaryActionLink="/admin/settings"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-[#FCEEE9]"
          iconColor="text-[#E27D60]"
          tagText="Registered"
          tagBg="bg-orange-50 text-[#E27D60]"
          label="Total Students"
          value={stats.totalStudents || 0}
          subtext="student accounts"
        />

        <StatCard
          icon={BookOpen}
          iconBg="bg-[#E8F1EC]"
          iconColor="text-[#2E5A44]"
          tagText={`${stats.seatUtilization || 0}% Occupied`}
          tagBg="bg-emerald-50 text-[#2E5A44]"
          label="Seat Utilization"
          value={`${stats.totalEnrolled || 0}`}
          subtext={`/ ${stats.totalCapacity || 0} seats`}
        />

        <StatCard
          icon={GraduationCap}
          iconBg="bg-slate-900"
          iconColor="text-white"
          tagText="Term Enrollments"
          tagBg="bg-slate-100 text-slate-700"
          label="Active Registrations"
          value={stats.activeRegistrationsCount || 0}
          subtext="confirmed seats"
        />

        <StatCard
          icon={Clock}
          iconBg="bg-[#EBF8F2]"
          iconColor="text-[#10B981]"
          tagText={stats.totalWaitlistsCount > 0 ? 'Queued' : 'Empty'}
          tagBg={stats.totalWaitlistsCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}
          label="Waiting List Entries"
          value={stats.totalWaitlistsCount || 0}
          subtext="pending promotions"
        />
      </div>

      {/* Analytics Charts (Department Breakdown & Top Courses) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Department Capacity vs Enrolled */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Department Capacity vs Enrollment
              </h3>
              <p className="text-xs text-slate-400">
                Seat distribution across academic departments
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              {stats.seatUtilization}% Global Utilization
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAF9' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="capacity" name="Total Capacity" fill="#A3C9B4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="enrolled" name="Enrolled Seats" fill="#2E5A44" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top Enrolled Courses Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">High-Demand Courses</h3>
            <Link to="/admin/courses" className="text-xs font-semibold text-[#2E5A44] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3.5">
            {topCourses.map((c) => (
              <div key={c.courseCode} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 font-mono">{c.courseCode}</span>
                  <span className="text-slate-500 font-semibold">
                    {c.enrolled} / {c.capacity} ({c.utilization}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      c.utilization >= 100
                        ? 'bg-rose-500'
                        : c.utilization > 80
                        ? 'bg-[#E27D60]'
                        : 'bg-[#2E5A44]'
                    }`}
                    style={{ width: `${Math.min(100, c.utilization)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Recent Registration Activity</h3>
            <p className="text-xs text-slate-400">
              Live registrations submitted by enrolled students
            </p>
          </div>
          <Link
            to="/admin/registrations"
            className="text-xs font-bold text-[#2E5A44] hover:underline flex items-center gap-1"
          >
            <span>All Registrations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Student ID</th>
                <th className="pb-3 px-3">Course</th>
                <th className="pb-3 px-3">Credits</th>
                <th className="pb-3 px-3">Ref Code</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRegistrations.map((reg) => (
                <tr key={reg._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {reg.student?.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {reg.student?.studentId}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#2E5A44]">
                    {reg.course?.courseCode}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="terracotta" size="sm">
                      {reg.creditsAtRegistration || reg.course?.credits} Cr
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {reg.registrationReference}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant={reg.status === 'registered' ? 'success' : 'danger'} size="sm">
                      {reg.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
