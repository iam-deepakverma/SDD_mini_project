import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import {
  Clock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaitlistManagementPage = () => {
  const { notifyDataChanged, dataVersion } = useAuth();
  const [waitlists, setWaitlists] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [isLoading, setIsLoading] = useState(true);

  // Seat offer state
  const [offeringEntry, setOfferingEntry] = useState(null);
  const [isOffering, setIsOffering] = useState(false);

  const fetchWaitlists = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get(`/waitlists/admin?status=${status}`);
      if (res.data.success) {
        setWaitlists(res.data.waitlists || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlists(true);
  }, [status, dataVersion]);

  const handleOfferSeat = async () => {
    if (!offeringEntry) return;
    setIsOffering(true);
    try {
      const res = await api.post(`/waitlists/admin/${offeringEntry._id}/offer`);
      if (res.data.success) {
        toast.success(res.data.message || 'Seat allocated and student enrolled!');
        setOfferingEntry(null);
        notifyDataChanged('admin_offer_seat');
        await fetchWaitlists(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to offer seat.');
    } finally {
      setIsOffering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Waitlist Queue Oversight & Priority Seat Allocation
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage waiting queues across full classes, promote waitlisted students, and allocate reserved seats.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm w-fit">
        {[
          { id: 'waiting', label: 'Active Queued' },
          { id: 'offered', label: 'Offered Seat' },
          { id: 'enrolled', label: 'Promoted / Enrolled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id)}
            className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition ${
              status === tab.id
                ? 'bg-[#2E5A44] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
        {waitlists.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No waitlist entries found</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              There are currently no students in the selected waitlist queue.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Position</th>
                <th className="pb-3 px-3">Course Code</th>
                <th className="pb-3 px-3">Course Title</th>
                <th className="pb-3 px-3">Student Name</th>
                <th className="pb-3 px-3">Student ID</th>
                <th className="pb-3 px-3">Joined Date</th>
                <th className="pb-3 px-3">Queue Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {waitlists.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-extrabold text-[#E27D60]">
                    #{entry.queuePosition}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#2E5A44]">
                    {entry.course?.courseCode}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {entry.course?.title}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {entry.student?.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {entry.student?.studentId}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(entry.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={entry.status === 'enrolled' ? 'success' : 'warning'} size="sm">
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {entry.status === 'waiting' && (
                      <button
                        onClick={() => setOfferingEntry(entry)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#2E5A44] hover:bg-[#224333] shadow-xs transition"
                      >
                        Enroll Student
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Dialog for Seat Offer / Direct Enrollment */}
      <ConfirmationDialog
        isOpen={!!offeringEntry}
        onClose={() => setOfferingEntry(null)}
        onConfirm={handleOfferSeat}
        title="Promote Waitlist Candidate"
        message={`Promote candidate ${offeringEntry?.student?.name} (#${offeringEntry?.queuePosition} in queue) into ${offeringEntry?.course?.courseCode}? A reserved seat will be officially registered for this student and their dashboard will be updated immediately.`}
        confirmText="Allocate Seat & Enroll"
        confirmVariant="primary"
        isLoading={isOffering}
      />
    </div>
  );
};
