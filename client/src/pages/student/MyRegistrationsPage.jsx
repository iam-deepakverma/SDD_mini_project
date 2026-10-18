import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { PrintableRegistrationSlip } from '../../components/registration/PrintableRegistrationSlip.jsx';
import {
  GraduationCap,
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyRegistrationsPage = () => {
  const { user, academicSummary, refreshUser, dataVersion, notifyDataChanged } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('registered');
  const [isLoading, setIsLoading] = useState(true);

  // Print slip state
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Cancellation state
  const [cancellingRegistration, setCancellingRegistration] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRegistrations = async (showLoading = false) => {
    if (showLoading && registrations.length === 0) setIsLoading(true);
    try {
      const res = await api.get(`/registrations/me?status=${statusFilter}`);
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations(registrations.length === 0);
  }, [statusFilter, user?._id]);

  useEffect(() => {
    if (dataVersion > 0) {
      fetchRegistrations(false);
    }
  }, [dataVersion]);

  const handleCancelRegistration = async () => {
    if (!cancellingRegistration) return;
    setIsCancelling(true);
    try {
      const res = await api.post(`/registrations/${cancellingRegistration._id}/cancel`, {
        reason: cancelReason || 'Self-cancelled by student',
      });
      if (res.data.success) {
        toast.success('Course registration cancelled.');
        setCancellingRegistration(null);
        setCancelReason('');
        notifyDataChanged('student_drop_course');
        await fetchRegistrations(false);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  const activeRegistrations = registrations.filter((r) => r.status === 'registered');
  const activeCredits = activeRegistrations.reduce(
    (sum, r) => sum + (r.creditsAtRegistration || r.course?.credits || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            My Registered Courses & Academic Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmed course schedule and registration references for semester records.
          </p>
        </div>

        {activeRegistrations.length > 0 && (
          <button
            onClick={() => setSelectedSlip(activeRegistrations)}
            className="px-4 py-2 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Verified Slip</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Credit Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto justify-around sm:justify-start">
          {[
            { id: 'registered', label: 'Active Enrolled' },
            { id: 'cancelled', label: 'Dropped' },
            { id: 'all', label: 'All History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition text-center ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-slate-500">
            Active Credits:{' '}
            <strong className="text-[#2E5A44] font-bold text-sm">
              {activeCredits} Cr
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">
            Enrolled Classes:{' '}
            <strong className="text-slate-800 font-bold">
              {activeRegistrations.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Registrations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm">
          <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No registrations found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You do not have any registrations under the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {registrations.map((reg) => {
            const isRegistered = reg.status === 'registered';

            return (
              <div
                key={reg._id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-[#2E5A44] bg-[#E8F1EC] px-3 py-1 rounded-xl">
                      {reg.course?.courseCode}
                    </span>
                    <Badge variant={isRegistered ? 'success' : 'danger'} size="sm">
                      {isRegistered ? 'Enrolled' : 'Cancelled'}
                    </Badge>
                    <Badge variant="terracotta" size="sm">
                      {reg.creditsAtRegistration || reg.course?.credits} Credits
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {reg.course?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {reg.course?.facultyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {reg.course?.schedule?.days?.join(', ') || 'TBA'} •{' '}
                      {reg.course?.schedule?.time || 'TBA'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {reg.course?.schedule?.room || 'Academic Block'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Ref: <strong className="font-mono text-slate-600">{reg.registrationReference}</strong></span>
                    <span>•</span>
                    <span>Registered on {new Date(reg.registeredAt).toLocaleDateString()}</span>
                    {reg.cancelledAt && (
                      <>
                        <span>•</span>
                        <span className="text-rose-500 font-medium">
                          Cancelled on {new Date(reg.cancelledAt).toLocaleDateString()} ({reg.cancellationReason || 'Dropped'})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setSelectedSlip(reg)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Slip</span>
                  </button>

                  {isRegistered && (
                    <button
                      onClick={() => setCancellingRegistration(reg)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                    >
                      Drop Class
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Dropping Course */}
      <ConfirmationDialog
        isOpen={!!cancellingRegistration}
        onClose={() => setCancellingRegistration(null)}
        onConfirm={handleCancelRegistration}
        title="Drop Registered Course"
        message={`Are you sure you want to drop ${cancellingRegistration?.course?.courseCode} (${cancellingRegistration?.course?.title})? You will release your seat and reduce your registered credits.`}
        confirmText="Confirm Drop"
        confirmVariant="danger"
        isLoading={isCancelling}
      >
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Reason for dropping:
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Schedule conflict, prerequisite adjustment..."
            className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>
      </ConfirmationDialog>

      {/* Printable Confirmation Slip */}
      <PrintableRegistrationSlip
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        registrationData={selectedSlip}
        student={user}
        academicYear={academicSummary?.academicYear || '2026-2027'}
        semesterName={academicSummary?.semesterName || 'Fall Semester 2026'}
      />
    </div>
  );
};
