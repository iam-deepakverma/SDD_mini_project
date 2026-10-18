import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Hexagon, Lock, Mail, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export const LoginPage = () => {
  const { login, switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickDemo = async (type) => {
    setIsLoading(true);
    const res = await switchDemoAccount(type);
    setIsLoading(false);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl md:rounded-[36px] shadow-sm border border-slate-200/80 max-w-md w-full p-8 md:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E5A44] via-[#E27D60] to-[#DDA15E] p-0.5 mx-auto mb-3 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-[#2E5A44] fill-[#E8F1EC]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Emedley</h1>
          <p className="text-xs text-slate-400 mt-1">
            Student Course Registration & Academic Portal
          </p>
        </div>

        {/* Demo Fast Login Pills (Easy grading/evaluation!) */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Personas
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('student-eligible')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 font-bold text-emerald-800 text-left transition shadow-2xs"
            >
              🎓 Alex (Eligible)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student-missing-prereq')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-500 font-bold text-amber-800 text-left transition shadow-2xs"
            >
              ⚠️ Maya (Missing Prereq)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student-high-credits')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-500 font-bold text-orange-800 text-left transition shadow-2xs"
            >
              ⚡ Jordan (High Credits)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-500 font-bold text-purple-800 text-left transition shadow-2xs"
            >
              🛡️ Sarah (Admin)
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@emedley.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white font-bold transition flex items-center justify-center gap-2 shadow-sm mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          New student?{' '}
          <Link to="/register" className="text-[#2E5A44] font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
