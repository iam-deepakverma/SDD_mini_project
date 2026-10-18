import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { Clock, Users, AlertCircle, Info, Trash2, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const WaitlistPage = () => {
  const { user, refreshUser, dataVersion, notifyDataChanged } = useAuth();
  const [waitlists, setWaitlists] = useState([]);
  const [enrolledFromWaitlist, setEnrolledFromWaitlist] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'enrolled'
  const [isLoading, setIsLoading] = useState(true);

  const [leavingEntry, setLeavingEntry] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchWaitlists = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get('/waitlists/me?status=all');
      if (res.data.success) {
        const all = res.data.waitlists || [];
        setWaitlists(all.filter((w) => ['waiting', 'offered'].includes(w.status)));
        setEnrolledFromWaitlist(all.filter((w) => w.status === 'enrolled'));
        setActiveCount(res.data.activeCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlists(true);
  }, [user?._id, dataVersion]);

  const handleLeaveWaitlist = async () => {
    if (!leavingEntry) return;
    setIsLeaving(true);
    try {
      const res = await api.delete(`/waitlists/${leavingEntry._id}`);
      if (res.data.success) {
        toast.success('Successfully left the waiting list.');
        setLeavingEntry(null);
        notifyDataChanged('leave_waitlist');
        await fetchWaitlists(false);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave waitlist.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Course Waiting List Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor your real-time queue position and status for full courses.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-xs w-full sm:w-auto justify-around sm:justify-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition text-center ${
              activeTab === 'active'
                ? 'bg-[#2E5A44] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Queue ({waitlists.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition text-center ${
              activeTab === 'enrolled'
                ? 'bg-[#2E5A44] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Promoted ({enrolledFromWaitlist.length})
          </button>
        </div>
      </div>

      {/* Promoted Alert Banner if any enrolled courses exist */}
      {enrolledFromWaitlist.length > 0 && activeTab === 'active' && (
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                You were accepted into {enrolledFromWaitlist.length} course(s) from the waitlist!
              </p>
              <p className="text-[11px] text-emerald-700">
                Course: {enrolledFromWaitlist.map((e) => e.course?.courseCode).join(', ')} — Enrolled officially.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('enrolled')}
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 self-end sm:self-auto"
          >
            View Details
          </button>
        </div>
      )}

      {/* Info Callout */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">How Course Waiting Lists Function</p>
          <p className="text-slate-600 leading-relaxed">
            When an enrolled student drops a course or course capacity is expanded by the administration, seats are offered in strict queue order. Once accepted by the administrator, you are automatically enrolled into the course and removed from the queue.
          </p>
        </div>
      </div>

      {/* Tab: Active Queue */}
      {activeTab === 'active' && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm animate-pulse h-28" />
              ))}
            </div>
          ) : waitlists.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No active waitlist entries</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You are not currently queued for any course. If an eligible course reaches capacity in the catalogue, you can join its waitlist directly.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {waitlists.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-sm text-[#2E5A44] bg-[#E8F1EC] px-3 py-1 rounded-xl">
                        {entry.course?.courseCode}
                      </span>
                      <Badge variant={entry.status === 'offered' ? 'terracotta' : 'warning'}>
                        {entry.status === 'offered' ? 'Seat Offered!' : 'In Queue'}
                      </Badge>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        Queue Position #{entry.queuePosition}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      {entry.course?.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Faculty: {entry.course?.facultyName}</span>
                      <span>•</span>
                      <span>{entry.course?.credits} Credits</span>
                      <span>•</span>
                      <span>Joined on {new Date(entry.joinedAt).toLocaleDateString()}</span>
                    </div>

                    {entry.status === 'offered' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        🎉 A seat has become available for you! Contact your advisor or accept the offer to complete your registration.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setLeavingEntry(entry)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Leave Waitlist</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Promoted & Enrolled */}
      {activeTab === 'enrolled' && (
        <div className="space-y-4">
          {enrolledFromWaitlist.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No waitlist promotions on record</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When an administrator accepts your waiting list position, the course will appear here and in your active registrations.
              </p>
            </div>
          ) : (
            enrolledFromWaitlist.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-[#2E5A44] bg-[#E8F1EC] px-3 py-1 rounded-xl">
                      {entry.course?.courseCode}
                    </span>
                    <Badge variant="success">Promoted & Enrolled</Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {entry.course?.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Faculty: {entry.course?.facultyName} • {entry.course?.credits} Credits
                  </p>

                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Accepted by administrator! You have come out of the waitlist and are officially registered in this course.
                    </span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#2E5A44] hover:bg-[#224333] shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <span>View in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!leavingEntry}
        onClose={() => setLeavingEntry(null)}
        onConfirm={handleLeaveWaitlist}
        title="Leave Course Waitlist"
        message={`Are you sure you want to surrender your waitlist position (#${leavingEntry?.queuePosition}) for ${leavingEntry?.course?.courseCode}? You will forfeit your position in queue.`}
        confirmText="Leave Waitlist"
        confirmVariant="danger"
        isLoading={isLeaving}
      />
    </div>
  );
};
