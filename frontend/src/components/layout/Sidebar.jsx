import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Stethoscope,
  ScrollText,
  FileBarChart,
  Calendar,
  FolderHeart,
  Pill,
  TestTubes,
  Clock,
  Sparkles,
  Receipt,
  FileCheck,
  FolderLock,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleNavItems = {
    admin: [
      { to: '/admin/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'User Directory', icon: Users },
      { to: '/admin/departments', label: 'Departments', icon: Building2 },
      { to: '/admin/services', label: 'Clinical Services', icon: Activity },
      { to: '/admin/doctors', label: 'Medical Staff', icon: Stethoscope },
      { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ScrollText },
      { to: '/admin/reports', label: 'Clinic Reports', icon: FileBarChart },
    ],
    doctor: [
      { to: '/doctor/dashboard', label: 'Physician Overview', icon: LayoutDashboard },
      { to: '/doctor/appointments', label: 'Appointment Queue', icon: Calendar },
      { to: '/doctor/patients', label: 'Patient Directory', icon: Users },
      { to: '/doctor/records', label: 'Clinical Records', icon: FolderHeart },
      { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
      { to: '/doctor/labs', label: 'Lab Orders', icon: TestTubes },
      { to: '/doctor/follow-ups', label: 'Follow-ups', icon: Clock },
      { to: '/doctor/ai', label: 'AI Clinical Summary', icon: Sparkles },
    ],
    receptionist: [
      { to: '/receptionist/dashboard', label: 'Reception Dashboard', icon: LayoutDashboard },
      { to: '/receptionist/patients', label: 'Patient Registration', icon: Users },
      { to: '/receptionist/appointments', label: 'Appointments & Queue', icon: Calendar },
      { to: '/receptionist/invoices', label: 'Invoices & Billing', icon: Receipt },
    ],
    labTechnician: [
      { to: '/lab/dashboard', label: 'Laboratory Overview', icon: LayoutDashboard },
      { to: '/lab/orders', label: 'Order Workflow', icon: TestTubes },
      { to: '/lab/results', label: 'Result Entry & Verify', icon: FileCheck },
    ],
    patient: [
      { to: '/patient/dashboard', label: 'My Health Portal', icon: LayoutDashboard },
      { to: '/patient/timeline', label: 'Medical Timeline', icon: Activity },
      { to: '/patient/appointments', label: 'Book & History', icon: Calendar },
      { to: '/patient/prescriptions', label: 'Prescriptions (AI Explanations)', icon: Pill },
      { to: '/patient/records', label: 'Clinical Records', icon: FolderHeart },
      { to: '/patient/documents', label: 'Secure Documents', icon: FolderLock },
      { to: '/patient/invoices', label: 'My Invoices', icon: Receipt },
    ],
  };

  const navItems = roleNavItems[user.role] || [];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080d1a]/95 backdrop-blur-xl border-r border-cyan-500/15 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                MEDASSIST
                <span className="text-[9px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">INTELLIGENT CARE</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group select-none ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && item.to.includes('/ai') && (
                <span className="ml-auto text-[10px] font-mono bg-teal-950/70 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Role Card & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed && (
          <div className="mb-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold uppercase shrink-0">
              {user.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider truncate">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 shrink-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
