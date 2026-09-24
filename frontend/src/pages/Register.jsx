import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, Phone, Activity, ArrowRight } from 'lucide-react';
import AnimatedBackground from '../components/background/AnimatedBackground';
import Button from '../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      showToast('Registration successful! You may now sign in.', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#060913] text-slate-100">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              MEDASSIST
            </span>
          </Link>
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mt-2">
            Patient Portal Registration
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel border border-cyan-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Create Account</h2>
            <p className="text-xs text-slate-400">
              Register for direct access to digital appointments, prescriptions, and lab telemetry.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone Number</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                <Phone className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
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
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already registered with MedAssist?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
