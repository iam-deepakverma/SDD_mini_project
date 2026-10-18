import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Hexagon, Lock, Mail, User, Building, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    program: 'B.Tech in Computer Science',
    currentSemester: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register(formData);
    setIsLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl md:rounded-[36px] shadow-sm border border-slate-200/80 max-w-lg w-full p-8 md:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E5A44] via-[#E27D60] to-[#DDA15E] p-0.5 mx-auto mb-3 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-[#2E5A44] fill-[#E8F1EC]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student Account Registration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create an academic portal account to enroll in university courses
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rachel Zane"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">University Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@emedley.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Academic Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 font-medium"
              >
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Mathematics & Computing">Mathematics</option>
                <option value="Electrical & Electronics">Electrical</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Semester Term</label>
              <input
                type="number"
                min={1}
                max={12}
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white font-bold transition flex items-center justify-center gap-2 shadow-sm mt-3"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Student Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-[#2E5A44] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
