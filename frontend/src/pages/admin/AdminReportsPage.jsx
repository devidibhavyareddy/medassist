import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  FlaskConical,
  CreditCard,
  RefreshCw,
  Printer,
  Activity,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import AppointmentChart from '../../components/charts/AppointmentChart';
import RevenueChart from '../../components/charts/RevenueChart';

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getClinicReports();
      setReports(res.data.reports || res.data);
    } catch (err) {
      console.error('Failed to load clinic reports', err);
      showToast('Error loading clinic intelligence report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loading text="Synthesizing clinic performance metrics..." />;
  }

  const totalAppts = reports?.totalAppointments || 0;
  const completedAppts = reports?.completedAppointments || 0;
  const cancelledAppts = reports?.cancelledAppointments || 0;
  const completionRate = totalAppts > 0 ? ((completedAppts / totalAppts) * 100).toFixed(1) : 0;
  const cancellationRate = totalAppts > 0 ? ((cancelledAppts / totalAppts) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Clinic Operations & Financial Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated institutional report across patient care delivery, revenue flow, and appointment efficiency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchReports} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Collected Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">
            ${(reports?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Settled via patient invoices
          </p>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Consultation Volume</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {totalAppts}
          </div>
          <p className="text-xs text-cyan-400 mt-1">
            {completionRate}% Successful Completion
          </p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Patient Cohort</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {reports?.totalPatients || 0}
          </div>
          <p className="text-xs text-indigo-400 mt-1">
            Across {reports?.totalDoctors || 0} Certified Doctors
          </p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Actions</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {(reports?.pendingLabOrders || 0) + (reports?.pendingInvoices || 0)}
          </div>
          <p className="text-xs text-amber-400 mt-1">
            {reports?.pendingLabOrders || 0} labs, {reports?.pendingInvoices || 0} bills
          </p>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Appointment Completion Dynamics"
            subtitle="Volume distribution grouped by clinical encounter status"
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
              <div className="text-slate-500 text-sm">No appointment chart data available</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Billing Resolution & Balance"
            subtitle="Financial settlement state of clinical transactions"
          />
          <div className="h-64 flex items-center justify-center">
            <RevenueChart
              paidCount={reports?.totalRevenue ? 1 : 0}
              pendingCount={reports?.pendingInvoices || 0}
              totalRevenue={reports?.totalRevenue || 0}
            />
          </div>
        </Card>
      </div>

      {/* Detailed Operations Breakdown Table */}
      <Card>
        <CardHeader
          title="Clinical Operations Key Metrics Summary"
          subtitle="Tabular institutional metrics for board reporting and auditing"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Operational Domain</th>
                <th className="py-3.5 px-6">Metric Indicator</th>
                <th className="py-3.5 px-6">Quantity / Value</th>
                <th className="py-3.5 px-6 text-right">Performance Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="py-4 px-6 font-medium text-slate-200">Patient Intake</td>
                <td className="py-4 px-6 text-slate-400">Total Registered Patients</td>
                <td className="py-4 px-6 font-mono text-cyan-300 font-bold">
                  {reports?.totalPatients || 0}
                </td>
                <td className="py-4 px-6 text-right">
                  <Badge variant="success">Active Registry</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-200">Clinical Encounters</td>
                <td className="py-4 px-6 text-slate-400">Successfully Completed Visits</td>
                <td className="py-4 px-6 font-mono text-emerald-400 font-bold">
                  {reports?.completedAppointments || 0}
                </td>
                <td className="py-4 px-6 text-right">
                  <Badge variant="success">{completionRate}% Completion</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-200">Appointments</td>
                <td className="py-4 px-6 text-slate-400">Cancelled / No-Show Rate</td>
                <td className="py-4 px-6 font-mono text-rose-400 font-bold">
                  {reports?.cancelledAppointments || 0}
                </td>
                <td className="py-4 px-6 text-right">
                  <Badge variant={cancellationRate > 15 ? 'warning' : 'neutral'}>
                    {cancellationRate}%
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-200">Diagnostic Services</td>
                <td className="py-4 px-6 text-slate-400">Specimens Pending Completion</td>
                <td className="py-4 px-6 font-mono text-amber-300 font-bold">
                  {reports?.pendingLabOrders || 0}
                </td>
                <td className="py-4 px-6 text-right">
                  <Badge variant={reports?.pendingLabOrders > 0 ? 'warning' : 'success'}>
                    {reports?.pendingLabOrders > 0 ? 'In Progress' : 'All Clear'}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-200">Revenue Settlement</td>
                <td className="py-4 px-6 text-slate-400">Unsettled Patient Balances</td>
                <td className="py-4 px-6 font-mono text-amber-300 font-bold">
                  {reports?.pendingInvoices || 0} Bills Pending
                </td>
                <td className="py-4 px-6 text-right">
                  <Badge variant={reports?.pendingInvoices > 0 ? 'warning' : 'success'}>
                    {reports?.pendingInvoices > 0 ? 'Collection Required' : 'Current'}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
