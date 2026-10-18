import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Sliders, Save, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    semesterName: 'Fall Semester 2026',
    academicYear: '2026-2027',
    currentSemester: 5,
    maxCredits: 18,
    registrationOpen: true,
    waitingListEnabled: true,
    allowCancellation: true,
    registrationStart: '',
    registrationEnd: '',
    cancellationDeadline: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          setSettings({
            semesterName: s.semesterName || 'Fall Semester 2026',
            academicYear: s.academicYear || '2026-2027',
            currentSemester: s.currentSemester || 5,
            maxCredits: s.maxCredits || 18,
            registrationOpen: s.registrationOpen ?? true,
            waitingListEnabled: s.waitingListEnabled ?? true,
            allowCancellation: s.allowCancellation ?? true,
            registrationStart: s.registrationStart ? s.registrationStart.slice(0, 10) : '',
            registrationEnd: s.registrationEnd ? s.registrationEnd.slice(0, 10) : '',
            cancellationDeadline: s.cancellationDeadline ? s.cancellationDeadline.slice(0, 10) : '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load system settings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        toast.success('System settings saved successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Semester & Registration Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure university credit allowances, open/close registration windows, and enforce waiting list rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6 max-w-4xl">
        {/* Registration Window Switch */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Course Registration Period</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle global student course enrollment eligibility on or off.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registrationOpen}
              onChange={(e) => setSettings({ ...settings, registrationOpen: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E5A44]"></div>
            <span className="ml-3 text-xs font-bold text-slate-700">
              {settings.registrationOpen ? 'Registration OPEN' : 'Registration CLOSED'}
            </span>
          </label>
        </div>

        {/* Semester Term & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Semester Name</label>
            <input
              type="text"
              required
              value={settings.semesterName}
              onChange={(e) => setSettings({ ...settings, semesterName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
            <input
              type="text"
              required
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Semester Term Number</label>
            <input
              type="number"
              min="1"
              max="12"
              required
              value={settings.currentSemester}
              onChange={(e) => setSettings({ ...settings, currentSemester: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Credit Ceiling Configuration */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
          <label className="font-bold text-amber-950 block text-sm">
            Maximum Credit Limit Per Student
          </label>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Students cannot exceed this cumulative registered credit ceiling without administrative override.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min="3"
              max="30"
              required
              value={settings.maxCredits}
              onChange={(e) => setSettings({ ...settings, maxCredits: Number(e.target.value) })}
              className="w-32 px-3.5 py-2 bg-white rounded-xl border border-amber-300 font-bold text-slate-800 text-sm"
            />
            <span className="font-semibold text-amber-900">Credits Maximum per Semester</span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Registration Start Date</label>
            <input
              type="date"
              value={settings.registrationStart}
              onChange={(e) => setSettings({ ...settings, registrationStart: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Registration End Date (Deadline)</label>
            <input
              type="date"
              value={settings.registrationEnd}
              onChange={(e) => setSettings({ ...settings, registrationEnd: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Waiting List & Cancellation Policies */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Academic Policy Toggles
          </h4>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-800">Waiting Lists Enabled</p>
              <p className="text-slate-500 text-[11px]">Allow students to join queues when courses reach full capacity.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.waitingListEnabled}
              onChange={(e) => setSettings({ ...settings, waitingListEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-[#2E5A44] focus:ring-[#2E5A44]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-800">Allow Self-Service Course Dropping</p>
              <p className="text-slate-500 text-[11px]">Permit students to drop classes prior to the drop deadline.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowCancellation}
              onChange={(e) => setSettings({ ...settings, allowCancellation: e.target.checked })}
              className="w-5 h-5 rounded text-[#2E5A44] focus:ring-[#2E5A44]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full font-bold text-xs bg-[#2E5A44] hover:bg-[#224333] text-white shadow-sm flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Policy...' : 'Save Semester Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
