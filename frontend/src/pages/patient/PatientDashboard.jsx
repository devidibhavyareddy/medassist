import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { patientApi } from '../../api/patientApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Pill,
  TestTubes,
  Receipt,
  Clock,
  Bell,
  ArrowRight,
  Sparkles,
  User,
  HeartPulse,
  Plus,
  AlertCircle,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const PatientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const { showToast } = useToast();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getPatientDashboard();
      setData(res.data.dashboard);
      setNeedsProfile(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNeedsProfile(true);
      } else {
        setError(err.response?.data?.message || 'Unable to load patient health dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await patientApi.createMyProfile({
        ...profileForm,
        allergies: profileForm.allergies ? profileForm.allergies.split(',').map((s) => s.trim()) : [],
      });
      showToast('Patient profile established successfully!', 'success');
      setProfileModalOpen(false);
      loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/4 mb-2" />
          <div className="h-4 bg-slate-800/60 rounded w-1/3" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Profile setup callout if patient hasn't initialized EHR profile yet
  if (needsProfile) {
    return (
      <div className="space-y-6">
        <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30 text-center max-w-xl mx-auto space-y-4 my-12">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Complete Your Clinical Profile</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to MedAssist. To link your digital health records, schedule appointments, and receive
            prescriptions, please complete your basic clinical profile.
          </p>
          <Button onClick={() => setProfileModalOpen(true)} variant="primary" size="lg" icon={Plus}>
            Establish Medical Profile
          </Button>
        </div>

        {/* Modal for creating profile */}
        <Modal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          title="Clinical Profile Registration"
          subtitle="All fields are encrypted and restricted to medical personnel."
        >
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Phone</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Residential Address</label>
              <input
                type="text"
                placeholder="123 Health Ave, Bangalore"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Allergies (comma separated)</label>
              <input
                type="text"
                placeholder="Penicillin, Peanuts, Pollen"
                value={profileForm.allergies}
                onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button onClick={() => setProfileModalOpen(false)} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button type="submit" isLoading={savingProfile} variant="primary" size="sm">
                Save & Initialize EHR
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Error Loading Health Portal</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <Button onClick={loadDashboard} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const {
    patient,
    upcomingAppointment,
    recentPrescriptions = [],
    recentLabResults = [],
    pendingInvoices = [],
    followUps = [],
    unreadNotifications = 0,
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Patient Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 font-bold text-xl">
              {patient?.fullName ? patient.fullName.slice(0, 2).toUpperCase() : 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {patient?.fullName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {patient?.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>{patient?.email}</span>
                {patient?.phone && <span>• {patient?.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/patient/timeline">
              <Button variant="primary" size="md" icon={HeartPulse}>
                View Medical Timeline
              </Button>
            </Link>
            <Link to="/patient/appointments">
              <Button variant="secondary" size="md" icon={Calendar}>
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Row: Next Appointment Card (Prominent & Beautiful) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card glow className="h-full flex flex-col justify-between">
            <CardHeader
              title="Next Scheduled Consultation"
              subtitle="Confirmed physician appointment"
              action={<Calendar className="w-5 h-5 text-cyan-400" />}
            />

            {upcomingAppointment ? (
              <div className="space-y-5 my-2">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Attending Specialist</span>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      {upcomingAppointment.doctorId?.fullName || 'Assigned Physician'}
                    </h4>
                    <p className="text-xs text-slate-400">{upcomingAppointment.doctorId?.specialization || 'Clinical Medicine'}</p>
                  </div>
                  <Badge status={upcomingAppointment.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Date</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {new Date(upcomingAppointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Slot Time</span>
                    <p className="text-sm font-semibold text-cyan-300 mt-0.5 font-mono">
                      {upcomingAppointment.startTime} - {upcomingAppointment.endTime}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Queue Slot</span>
                    <p className="text-sm font-semibold text-teal-300 mt-0.5 font-mono">
                      #{upcomingAppointment.queueNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                {upcomingAppointment.reason && (
                  <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-400">Chief Reason: </span>
                    {upcomingAppointment.reason}
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Consultations"
                description="You currently have no scheduled appointments. Book your next consultation whenever needed."
                actionLabel="Schedule Now"
                onAction={() => (window.location.href = '/patient/appointments')}
              />
            )}

            <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">Status: Live EHR sync</span>
              <Link to="/patient/appointments" className="text-cyan-400 hover:underline flex items-center gap-1 font-medium">
                View all appointments <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Quick Health Summary Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Prescriptions Counter */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase text-slate-400">Prescriptions</span>
            </div>
            <div className="my-4">
              <div className="text-3xl font-bold font-mono text-white">{recentPrescriptions.length}</div>
              <p className="text-xs text-slate-400 mt-1">Recent active e-Rx regimens</p>
            </div>
            <Link to="/patient/prescriptions" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View medicines <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Diagnostic Results Counter */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
                <TestTubes className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase text-slate-400">Lab Results</span>
            </div>
            <div className="my-4">
              <div className="text-3xl font-bold font-mono text-white">{recentLabResults.length}</div>
              <p className="text-xs text-slate-400 mt-1">Verified diagnostic panels</p>
            </div>
            <Link to="/patient/timeline" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
              View lab panels <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Pending Invoices Counter */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase text-slate-400">Invoices</span>
            </div>
            <div className="my-4">
              <div className="text-3xl font-bold font-mono text-amber-300">
                {pendingInvoices.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Pending clinic settlement</p>
            </div>
            <Link to="/patient/invoices" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              Review invoices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Follow-up Consultations Counter */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase text-slate-400">Follow-ups</span>
            </div>
            <div className="my-4">
              <div className="text-3xl font-bold font-mono text-white">{followUps.length}</div>
              <p className="text-xs text-slate-400 mt-1">Doctor check-ins recommended</p>
            </div>
            <Link to="/patient/timeline" className="text-xs text-rose-400 hover:underline flex items-center gap-1">
              View dates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Secondary Row: Recent Prescriptions & Lab Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <Card>
          <CardHeader
            title="Recent Medication Prescriptions"
            subtitle="Digital prescriptions with AI-assisted dosing guidance"
            action={
              <Link to="/patient/prescriptions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          />
          {recentPrescriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No prescriptions found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-500/30">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {rx.medicines?.map((m) => m.medicineName).join(', ') || 'Medication'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Prescribed by {rx.doctorId?.fullName || 'Physician'} •{' '}
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link to="/patient/prescriptions">
                    <Button variant="outline" size="sm" icon={Sparkles}>
                      AI Explain
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Verified Lab Results */}
        <Card>
          <CardHeader
            title="Verified Diagnostic Results"
            subtitle="Completed specimen testing and findings"
            action={
              <Link to="/patient/timeline">
                <Button variant="ghost" size="sm">
                  Full History
                </Button>
              </Link>
            }
          />
          {recentLabResults.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No completed laboratory results found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentLabResults.map((lr) => (
                <div
                  key={lr._id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-500/30">
                      <TestTubes className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lr.results?.map((r) => r.testName).join(', ') || 'Diagnostic Panel'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Verified {new Date(lr.verifiedAt || lr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge status="verified" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
