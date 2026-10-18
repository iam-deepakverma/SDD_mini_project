import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const UnauthorizedPage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 text-center max-w-md w-full border border-slate-100 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">403 — Access Denied</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          You do not have administrative clearance to access this portal section. Your account is assigned role: <strong className="font-bold text-slate-700 capitalize">{user?.role || 'Guest'}</strong>.
        </p>

        <div className="mt-6">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
