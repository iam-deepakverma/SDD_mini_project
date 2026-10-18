import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { PrintableRegistrationSlip } from '../../components/registration/PrintableRegistrationSlip.jsx';
import {
  Download,
  Search,
  Filter,
  Printer,
  Trash2,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const RegistrationManagementPage = () => {
  const { dataVersion, notifyDataChanged } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [semester, setSemester] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Print slip state
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Cancellation state
  const [cancellingReg, setCancellingReg] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRegistrations = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (semester !== 'all') params.append('semester', semester);
      params.append('limit', '100');

      const res = await api.get(`/admin/registrations?${params.toString()}`);
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
    fetchRegistrations(true);
  }, [status, semester, dataVersion]);

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/admin/reports/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Registration report exported to CSV.');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  const handleAdminCancel = async () => {
    if (!cancellingReg) return;
    setIsCancelling(true);
    try {
      const res = await api.post(`/registrations/${cancellingReg._id}/cancel`, {
        reason: cancelReason || 'Cancelled by administrative authority',
      });
      if (res.data.success) {
        toast.success('Registration cancelled.');
        setCancellingReg(null);
        setCancelReason('');
        notifyDataChanged('admin_cancel_registration');
        await fetchRegistrations(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(s) ||
      r.student?.studentId?.toLowerCase().includes(s) ||
      r.course?.courseCode?.toLowerCase().includes(s) ||
      r.registrationReference?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            University Registration Records & Reporting
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit enrolled students, verify reference numbers, and export semester CSV reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, ID, course, or reference code..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="registered">Registered Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3">Reference</th>
              <th className="pb-3 px-3">Student Name</th>
              <th className="pb-3 px-3">Student ID</th>
              <th className="pb-3 px-3">Course</th>
              <th className="pb-3 px-3">Credits</th>
              <th className="pb-3 px-3">Registration Date</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRegistrations.map((reg) => (
              <tr key={reg._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-3 font-mono font-bold text-slate-600 text-[11px]">
                  {reg.registrationReference}
                </td>
                <td className="py-3 px-3 font-bold text-slate-800">
                  {reg.student?.name}
                </td>
                <td className="py-3 px-3 font-mono text-[#2E5A44]">
                  {reg.student?.studentId}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-800">
                  <span className="font-mono font-bold text-[#2E5A44] mr-1.5">
                    {reg.course?.courseCode}
                  </span>
                  {reg.course?.title}
                </td>
                <td className="py-3 px-3 font-bold text-slate-700">
                  {reg.creditsAtRegistration || reg.course?.credits} Cr
                </td>
                <td className="py-3 px-3 text-slate-500">
                  {new Date(reg.registeredAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={reg.status === 'registered' ? 'success' : 'danger'} size="sm">
                    {reg.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedSlip(reg)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="View Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {reg.status === 'registered' && (
                      <button
                        onClick={() => setCancellingReg(reg)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Cancel Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog for Admin Drop */}
      <ConfirmationDialog
        isOpen={!!cancellingReg}
        onClose={() => setCancellingReg(null)}
        onConfirm={handleAdminCancel}
        title="Administrative Registration Cancellation"
        message={`Are you sure you want to cancel the registration of ${cancellingReg?.student?.name} for ${cancellingReg?.course?.courseCode}? A seat will be released and top waiting list candidates will be eligible.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        isLoading={isCancelling}
      >
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Administrative reason for cancellation:
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Degree audit adjustment, non-payment, academic advising decision..."
            className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20"
          />
        </div>
      </ConfirmationDialog>

      {/* Printable Slip Modal */}
      <PrintableRegistrationSlip
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        registrationData={selectedSlip}
        student={selectedSlip?.student}
        academicYear={selectedSlip?.academicYear || '2026-2027'}
        semesterName={`Semester ${selectedSlip?.semester || 5}`}
      />
    </div>
  );
};
