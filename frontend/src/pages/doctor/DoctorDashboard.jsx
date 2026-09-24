import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Users,
  TestTubes,
  Clock,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Activity,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getDoctorDashboard();
      setData(res.data.dashboard);
    } catch (err) {
      console.error('Doctor dashboard error', err);
      setError(err.response?.data?.message || 'Failed to load physician dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStartConsultation = async (appt) => {
    try {
      if (appt.status === 'scheduled' || appt.status === 'checkedIn') {
        await appointmentApi.updateAppointmentStatus(appt._id, 'inConsultation');
      }
      navigate(`/doctor/consultation/${appt._id}`);
    } catch (err) {
      navigate(`/doctor/consultation/${appt._id}`);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Physician Profile Missing"
        description={error}
        actionLabel="Retry"
        onAction={fetchDashboard}
      />
    );
  }

  const {
    doctor,
    todayAppointments = [],
    upcomingAppointments = [],
    totalPatients = 0,
    pendingLabOrders = 0,
    pendingFollowUps = 0,
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Doctor Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {doctor?.fullName || 'Physician Station'}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {doctor?.doctorId}
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-mono mt-1">
                {doctor?.specialization || 'Clinical Specialist'} • Physician Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/doctor/ai">
              <Button variant="ai" size="md" icon={Sparkles}>
                AI Clinical Studio
              </Button>
            </Link>
            <Link to="/doctor/appointments">
              <Button variant="secondary" size="md" icon={Calendar}>
                View Queue ({todayAppointments.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Appointments */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Today</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-white">{todayAppointments.length}</div>
            <p className="text-xs text-slate-400 mt-1">Scheduled patients today</p>
          </div>
          <Link to="/doctor/appointments" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            Open daily queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Patient Count */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Patients</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-white">{totalPatients}</div>
            <p className="text-xs text-slate-400 mt-1">Unique patients treated</p>
          </div>
          <Link to="/doctor/patients" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
            Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Pending Lab Orders */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
              <TestTubes className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Lab Orders</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-purple-300">{pendingLabOrders}</div>
            <p className="text-xs text-slate-400 mt-1">Diagnostic panels in-flight</p>
          </div>
          <Link to="/doctor/labs" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
            Review lab tests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Pending Follow-ups */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Follow-ups</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-rose-300">{pendingFollowUps}</div>
            <p className="text-xs text-slate-400 mt-1">Upcoming monitored reviews</p>
          </div>
          <Link to="/doctor/follow-ups" className="text-xs text-rose-400 hover:underline flex items-center gap-1">
            Manage follow-ups <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* Main Grid: Today's Clinical Schedule / Timeline & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="lg:col-span-8">
          <Card glow>
            <CardHeader
              title="Today's Consultation Schedule & Queue"
              subtitle={`Timeline of active patients for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
              action={<span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">Live Queue</span>}
            />

            {todayAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Appointments Today"
                description="Your daily schedule is clear of scheduled appointments."
              />
            ) : (
              <div className="space-y-3.5">
                {todayAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs shrink-0">
                        #{appt.queueNumber || '-'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {appt.patientId?.fullName || 'Patient'}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {appt.patientId?.patientId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {appt.reason || 'General Consultation'} • {appt.patientId?.phone || 'No phone'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono text-cyan-300 font-semibold block">
                          {appt.startTime} - {appt.endTime}
                        </span>
                        <Badge status={appt.status} className="mt-1" />
                      </div>

                      {appt.status !== 'completed' && (
                        <Button
                          onClick={() => handleStartConsultation(appt)}
                          variant="primary"
                          size="sm"
                          icon={Play}
                        >
                          Consult
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming Appointments List */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader
              title="Upcoming Visits"
              subtitle="Next confirmed appointments"
              action={
                <Link to="/doctor/appointments">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              }
            />

            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No future bookings beyond today.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-white text-xs">
                        {appt.patientId?.fullName || 'Patient'}
                      </span>
                      <time className="text-[10px] font-mono text-cyan-400">
                        {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </time>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Time: {appt.startTime}</span>
                      <span className="font-mono text-teal-300">#{appt.queueNumber || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
