import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Users,
  Receipt,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ClipboardList,
  UserPlus,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const ReceptionistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getReceptionistDashboard();
      setData(res.data.dashboard);
    } catch (err) {
      console.error('Receptionist dashboard error', err);
      showToast('Error loading reception dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async (apptId) => {
    try {
      await appointmentApi.updateAppointmentStatus(apptId, 'checkedIn');
      showToast('Patient checked in and placed in physician queue!', 'success');
      fetchDashboard();
    } catch (err) {
      showToast('Failed to check in patient', 'error');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const {
    todayAppointments = [],
    upcomingAppointments = [],
    totalPatients = 0,
    pendingInvoices = 0,
    todayCompleted = 0,
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Reception Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/30">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Reception Desk
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-500/30 text-teal-300">
                  Frontline Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Patient arrivals, queue triage, walk-in registration, and billing settlement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/receptionist/patients">
              <Button variant="primary" size="md" icon={UserPlus}>
                Register Patient
              </Button>
            </Link>
            <Link to="/receptionist/invoices">
              <Button variant="secondary" size="md" icon={Receipt}>
                Billing Ledger
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Today</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-white">{todayAppointments.length}</div>
            <p className="text-xs text-slate-400 mt-1">Total appointments booked</p>
          </div>
          <Link to="/receptionist/appointments" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            Manage arrivals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Total Patients */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Total EHRs</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-white">{totalPatients}</div>
            <p className="text-xs text-slate-400 mt-1">Enrolled patient records</p>
          </div>
          <Link to="/receptionist/patients" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            Patient directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Pending Invoices */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Pending Bills</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-amber-300">{pendingInvoices}</div>
            <p className="text-xs text-slate-400 mt-1">Invoices awaiting payment</p>
          </div>
          <Link to="/receptionist/invoices" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            Collect payment <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Completed Today */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Completed</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-emerald-300">{todayCompleted}</div>
            <p className="text-xs text-slate-400 mt-1">Concluded consultations</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live operational sync</span>
        </Card>
      </div>

      {/* Today's Queue with One-Click Check-in */}
      <Card glow>
        <CardHeader
          title="Today's Patient Queue & Check-In"
          subtitle="Check in patients upon counter arrival to alert attending physicians"
        />

        {todayAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Today"
            description="The consultation schedule has no bookings for today."
          />
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appt) => (
              <div
                key={appt._id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs shrink-0">
                    #{appt.queueNumber || '-'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {appt.patientId?.fullName || 'Patient'}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        {appt.patientId?.patientId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Doctor: {appt.doctorId?.fullName} ({appt.doctorId?.specialization}) • {appt.patientId?.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono text-cyan-400 font-semibold block">
                      {appt.startTime} - {appt.endTime}
                    </span>
                    <Badge status={appt.status} className="mt-1" />
                  </div>

                  {appt.status === 'scheduled' || appt.status === 'requested' ? (
                    <Button
                      onClick={() => handleCheckIn(appt._id)}
                      variant="primary"
                      size="sm"
                    >
                      Check-In
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;
