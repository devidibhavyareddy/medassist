import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, Activity, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedBackground from '../components/background/AnimatedBackground';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      // Redirect by user role
      const redirectMap = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        labTechnician: '/lab/dashboard',
        patient: '/patient/dashboard',
      };
      navigate(redirectMap[data.user.role] || '/');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Selectors for Viva Demonstration
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-800">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              MEDASSIST
            </span>
          </Link>
          <p className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold mt-2">
            Secure Healthcare Portal Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-500">
              Enter your clinical credentials to access your designated workspace.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="name@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Demo Credentials Quick-Select Pill Bar (Ideal for Evaluator / Viva) */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> One-Click Demo Login:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@medassist.com', '123456')}
                className="px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 transition-colors font-semibold cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor@medassist.com', '123456')}
                className="px-2 py-1.5 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 transition-colors font-semibold cursor-pointer"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('receptionist@medassist.com', '123456')}
                className="px-2 py-1.5 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 transition-colors font-semibold cursor-pointer"
              >
                Receptionist
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('lab@medassist.com', '123456')}
                className="px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 transition-colors font-semibold cursor-pointer"
              >
                Lab Tech
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('patient@medassist.com', '123456')}
                className="px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 transition-colors font-semibold cursor-pointer"
              >
                Patient
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Create Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
