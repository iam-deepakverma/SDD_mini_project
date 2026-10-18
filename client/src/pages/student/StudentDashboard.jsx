import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Printer,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import api from '../../api/client.js';
import { TopBanner } from '../../components/common/TopBanner.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { PrintableRegistrationSlip } from '../../components/registration/PrintableRegistrationSlip.jsx';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const StudentDashboard = () => {
  const { user, academicSummary, refreshUser, dataVersion, notifyDataChanged } = useAuth();
  const { selectedCourses, totalCartCredits } = useCart();
  const [registrations, setRegistrations] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [enrolledFromWaitlist, setEnrolledFromWaitlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation modal state
  const [cancellingRegistration, setCancellingRegistration] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Printable slip state
  const [showSlip, setShowSlip] = useState(false);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [regRes, waitRes] = await Promise.all([
        api.get('/registrations/me?status=registered'),
        api.get('/waitlists/me'),
      ]);

      if (regRes.data.success) {
        setRegistrations(regRes.data.registrations || []);
      }
      if (waitRes.data.success) {
        setWaitlists(waitRes.data.waitlists || []);
        setEnrolledFromWaitlist(waitRes.data.enrolledFromWaitlist || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [user?._id, dataVersion]);

  const handleCancelRegistration = async () => {
    if (!cancellingRegistration) return;
    setIsCancelling(true);
    try {
      const res = await api.post(`/registrations/${cancellingRegistration._id}/cancel`, {
        reason: cancelReason || 'Student self-cancelled',
      });
      if (res.data.success) {
        toast.success('Course registration cancelled successfully.');
        setCancellingRegistration(null);
        setCancelReason('');
        notifyDataChanged('student_cancel_course');
        await fetchData(false);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  const registeredCredits = registrations.reduce(
    (sum, r) => sum + (r.creditsAtRegistration || r.course?.credits || 0),
    0
  );
  const maxCredits = academicSummary?.maxCredits || 18;
  const remainingCredits = Math.max(0, maxCredits - registeredCredits);
  const creditProgress = Math.min(100, Math.round((registeredCredits / maxCredits) * 100));

  // Chart data for semester credit visualizer
  const chartData = [
    { name: 'Completed', credits: (user?.completedCourses || []).reduce((s, c) => s + (c.credits || 0), 0) },
    { name: 'Enrolled Now', credits: registeredCredits },
    { name: 'In Cart', credits: totalCartCredits },
    { name: 'Allowance', credits: remainingCredits },
  ];

  const chartColors = ['#88B29C', '#2E5A44', '#E27D60', '#CBD5E1'];

  return (
    <div className="space-y-6">
      {/* 1. Emedley Style Top Hero Banner */}
      <TopBanner
        tag={`${academicSummary?.semesterName || 'Fall 2026'} • Active Session`}
        title={`Welcome back, ${user?.name || 'Student'}!`}
        description={`Your current enrollment is ${registeredCredits} credits. You have ${remainingCredits} remaining credits available for selection.`}
        primaryActionText="Browse Courses"
        primaryActionLink="/courses"
        secondaryActionText={selectedCourses.length > 0 ? `Review Cart (${selectedCourses.length})` : null}
        secondaryActionLink="/cart"
      />

      {/* Waitlist Accepted & Enrolled Celebration Alert */}
      {enrolledFromWaitlist && enrolledFromWaitlist.length > 0 && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 shadow-xs animate-fadeIn">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-900">Waitlist Accepted & Officially Enrolled!</h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Great news! Your waiting list application for{' '}
              <strong className="font-extrabold font-mono">
                {enrolledFromWaitlist.map((e) => e.course?.courseCode).join(', ')}
              </strong>{' '}
              was approved by the administration. You have been removed from the waiting list and enrolled into the course. Your class schedule and credits have been updated below!
            </p>
          </div>
        </div>
      )}

      {/* 2. Four Metric Cards (Directly matching reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          iconBg="bg-[#FCEEE9]"
          iconColor="text-[#E27D60]"
          tagText={`${creditProgress}% Limit`}
          tagBg="bg-orange-50 text-[#E27D60]"
          label="Registered Credits"
          value={`${registeredCredits}`}
          subtext={`/ ${maxCredits} max`}
        />

        <StatCard
          icon={BookOpen}
          iconBg="bg-[#E8F1EC]"
          iconColor="text-[#2E5A44]"
          tagText="Credit Pool"
          tagBg="bg-emerald-50 text-[#2E5A44]"
          label="Remaining Allowance"
          value={`${remainingCredits}`}
          subtext="credits left"
        />

        <StatCard
          icon={CheckCircle}
          iconBg="bg-slate-900"
          iconColor="text-white"
          tagText="Active"
          tagBg="bg-slate-100 text-slate-700"
          label="Enrolled Courses"
          value={`${registrations.length}`}
          subtext="classes this term"
        />

        <StatCard
          icon={Clock}
          iconBg="bg-[#EBF8F2]"
          iconColor="text-[#10B981]"
          tagText={waitlists.length > 0 ? 'Waitlisted' : 'Clear'}
          tagBg={waitlists.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}
          label="Waiting List"
          value={`${waitlists.length}`}
          subtext="queued courses"
        />
      </div>

      {/* 3. Middle Section: Credit Chart & Cart Quick Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Credit Allocation Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Academic Credit Distribution</h3>
              <p className="text-xs text-slate-400">
                Visual breakdown of completed, registered, and allowable semester credits
              </p>
            </div>
            <span className="text-xs font-bold text-[#2E5A44] bg-[#E8F1EC] px-3 py-1 rounded-full">
              Max {maxCredits} Credits
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="credits" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Course Selection Cart Quick Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Selection Cart</h3>
              <span className="w-6 h-6 rounded-full bg-[#E27D60] text-white text-xs font-bold flex items-center justify-center">
                {selectedCourses.length}
              </span>
            </div>

            {selectedCourses.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Your selection cart is empty</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-4">
                  Add eligible courses to your cart to review and confirm registration.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E8F1EC] text-[#2E5A44] hover:bg-[#d5e7dd] text-xs font-bold transition"
                >
                  <span>Explore Offerings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedCourses.map((c) => (
                  <div
                    key={c._id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{c.courseCode}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                        {c.title}
                      </span>
                    </div>
                    <Badge variant="terracotta" size="sm">
                      {c.credits} Cr
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCourses.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="text-slate-500">Cart Total:</span>
                <span className="text-[#E27D60]">{totalCartCredits} Credits</span>
              </div>
              <Link
                to="/cart"
                className="w-full py-2.5 rounded-full bg-[#E27D60] hover:bg-[#d06b4e] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Currently Enrolled Courses Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Currently Registered Courses</h3>
            <p className="text-xs text-slate-400">
              Official courses confirmed for {academicSummary?.semesterName || 'Fall 2026'}
            </p>
          </div>

          {registrations.length > 0 && (
            <button
              onClick={() => setShowSlip(true)}
              className="px-4 py-2 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Registration Slip</span>
            </button>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No courses registered yet</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Registration is open. Add courses to your cart and confirm your enrollment.
            </p>
            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Course Offerings</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Course Code</th>
                  <th className="pb-3 px-3">Course Title</th>
                  <th className="pb-3 px-3">Credits</th>
                  <th className="pb-3 px-3">Faculty</th>
                  <th className="pb-3 px-3">Schedule</th>
                  <th className="pb-3 px-3">Ref Code</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-bold font-mono text-[#2E5A44]">
                      {reg.course?.courseCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {reg.course?.title}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="terracotta" size="sm">
                        {reg.creditsAtRegistration || reg.course?.credits} Cr
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {reg.course?.facultyName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {reg.course?.schedule?.days?.join(', ') || 'TBA'} • {reg.course?.schedule?.time || 'TBA'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {reg.registrationReference}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setCancellingRegistration(reg)}
                        className="px-3 py-1 rounded-full text-rose-600 hover:bg-rose-50 text-xs font-semibold border border-transparent hover:border-rose-200 transition"
                      >
                        Drop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Dropping Course */}
      <ConfirmationDialog
        isOpen={!!cancellingRegistration}
        onClose={() => setCancellingRegistration(null)}
        onConfirm={handleCancelRegistration}
        title="Drop Course Registration"
        message={`Are you sure you want to drop ${cancellingRegistration?.course?.courseCode} (${cancellingRegistration?.course?.title})? This will release your reserved seat and reduce your registered credits by ${cancellingRegistration?.creditsAtRegistration || cancellingRegistration?.course?.credits} credits.`}
        confirmText="Confirm Drop"
        confirmVariant="danger"
        isLoading={isCancelling}
      >
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Reason for dropping (Optional):
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Schedule conflict, changed concentration..."
            className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>
      </ConfirmationDialog>

      {/* Printable Slip Modal */}
      <PrintableRegistrationSlip
        isOpen={showSlip}
        onClose={() => setShowSlip(false)}
        registrationData={registrations}
        student={user}
        academicYear={academicSummary?.academicYear || '2026-2027'}
        semesterName={academicSummary?.semesterName || 'Fall Semester 2026'}
      />
    </div>
  );
};
