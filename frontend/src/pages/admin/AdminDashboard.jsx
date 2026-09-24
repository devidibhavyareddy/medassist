import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { reportApi } from '../../api/reportApi';
import { auditApi } from '../../api/auditApi';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserCheck,
  Stethoscope,
  Building2,
  Layers,
  Calendar,
  DollarSign,
  FlaskConical,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import AppointmentChart from '../../components/charts/AppointmentChart';
import RevenueChart from '../../components/charts/RevenueChart';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, reportRes, auditRes] = await Promise.allSettled([
        dashboardApi.getAdminDashboard(),
        reportApi.getClinicReports(),
        auditApi.getAll(),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value.data.dashboard || dashRes.value.data);
      }
      if (reportRes.status === 'fulfilled') {
        setReports(reportRes.value.data.reports || reportRes.value.data);
      }
      if (auditRes.status === 'fulfilled') {
        const logs = auditRes.value.data.logs || auditRes.value.data || [];
        setRecentLogs(logs.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
      showToast('Error loading administrative telemetry', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const kpis = [
    {
      title: 'Total Users',
      value: dashboard?.totalUsers ?? '0',
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      sub: 'All portal accounts',
    },
    {
      title: 'Active Patients',
      value: dashboard?.totalPatients ?? '0',
      icon: UserCheck,
      color: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30',
      sub: 'Registered records',
    },
    {
      title: 'Medical Doctors',
      value: dashboard?.totalDoctors ?? '0',
      icon: Stethoscope,
      color: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
      sub: 'Certified practitioners',
    },
    {
      title: 'Appointments',
      value: dashboard?.totalAppointments ?? '0',
      icon: Calendar,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      sub: `${reports?.completedAppointments || 0} completed`,
    },
    {
      title: 'Departments',
      value: dashboard?.totalDepartments ?? '0',
      icon: Building2,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      sub: `${dashboard?.totalServices || 0} Clinical Services`,
    },
    {
      title: 'Gross Revenue',
      value: `$${(reports?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
      sub: `${dashboard?.paidInvoices || 0} invoices settled`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
              System Online & Operational
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent mt-1">
            Clinic Operations & System Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Executive oversight, user role controls, medical catalog management, and audit streams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchAdminData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Feed
          </Button>
          <Link to="/admin/reports">
            <Button className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Detailed Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
                {kpi.value}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Appointment Trajectory & Status"
            subtitle="Real-time distribution across consultation lifecycles"
          />
          <div className="h-64 flex items-center justify-center">
            {reports?.appointmentsByStatus ? (
              <AppointmentChart
                data={reports.appointmentsByStatus.map((item) => ({
                  name: item._id,
                  count: item.count,
                }))}
              />
            ) : (
              <div className="text-slate-500 text-sm">No appointment metric streams</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Revenue & Invoice Distribution"
            subtitle="Settled vs Outstanding clinical billing"
          />
          <div className="h-64 flex items-center justify-center">
            <RevenueChart
              paidCount={dashboard?.paidInvoices || 0}
              pendingCount={dashboard?.pendingInvoices || 0}
              totalRevenue={reports?.totalRevenue || 0}
            />
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Quick Links & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Operational Shortcuts"
            subtitle="Rapid navigation to clinical administrative modules"
          />
          <div className="space-y-2.5">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">User Access Control</div>
                  <div className="text-xs text-slate-400">Roles & Account Permissions</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/doctors"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Physicians & Staff</div>
                  <div className="text-xs text-slate-400">Hours, Fees & Profiles</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/departments"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Departments</div>
                  <div className="text-xs text-slate-400">Units & Divisions</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/services"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Clinical Catalog</div>
                  <div className="text-xs text-slate-400">Pricing & Procedures</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/audit-logs"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Security Audit Trail</div>
                  <div className="text-xs text-slate-400">HIPAA Compliance Stream</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </Card>

        {/* Live Audit Trail Feed */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <CardHeader
              title="Recent Security Audit Activity"
              subtitle="Latest tamper-evident event occurrences across the platform"
            />
            <Link to="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No recent audit transactions logged
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-start sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/70 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <span className="font-semibold text-slate-200 font-mono">
                        {log.action}
                      </span>
                      <span className="text-slate-400 ml-2">
                        by{' '}
                        <span className="text-cyan-300">
                          {log.userId?.name || 'System Actor'}
                        </span>{' '}
                        ({log.userId?.role || 'Service'})
                      </span>
                      {log.entityType && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {log.entityType}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap pl-2">
                    {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
