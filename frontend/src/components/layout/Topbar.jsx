import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  Shield,
  Stethoscope,
  User,
  FlaskConical,
  ClipboardList,
} from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';
import CommandPalette from '../search/CommandPalette';

const Topbar = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Theme toggle state
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('medassist_theme') === 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.add('light');
      localStorage.setItem('medassist_theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('medassist_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  // Generate readable title
  const getPageTitle = (path) => {
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) return 'Dashboard';
    const last = segments[segments.length - 1];
    const mapping = {
      dashboard: 'Overview & Analytics',
      timeline: 'Patient Clinical Timeline',
      appointments: 'Appointment Management',
      records: 'Medical Records & Clinical History',
      prescriptions: 'Prescriptions & AI Explanations',
      labs: 'Laboratory Diagnostics',
      invoices: 'Billing & Invoice Ledger',
      'follow-ups': 'Follow-Up Consultations',
      ai: 'AI Clinical Summary Studio',
      users: 'User Administration',
      departments: 'Department Management',
      services: 'Clinical Services',
      doctors: 'Physician Staff',
      'audit-logs': 'System Audit Logs',
      reports: 'Clinic Telemetry & Reports',
      documents: 'Secure Health Documents',
      orders: 'Lab Order Workflow',
      results: 'Diagnostic Lab Results',
    };
    return mapping[last] || last.charAt(0).toUpperCase() + last.slice(1);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      case 'doctor':
        return <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />;
      case 'receptionist':
        return <ClipboardList className="w-3.5 h-3.5 text-teal-400" />;
      case 'labTechnician':
        return <FlaskConical className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-[#080d1a]/80 backdrop-blur-xl border-b border-cyan-500/15 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        </div>

        {/* Center / Search bar trigger */}
        <div className="flex-1 max-w-md mx-4 hidden lg:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-colors text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search MedAssist...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Open search palette"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-300" />}
          </button>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User profile dropdown / info */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-white tracking-tight leading-none">
                  {user.name}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {getRoleIcon(user.role)}
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-medium">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                title="Logout of MedAssist"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Topbar;
