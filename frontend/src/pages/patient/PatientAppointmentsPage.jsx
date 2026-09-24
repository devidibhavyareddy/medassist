import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  XCircle,
  Filter,
  List,
  CalendarDays,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Booking Form
  const [formData, setFormData] = useState({
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    reason: '',
  });

  // Availability checking
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptsRes, docsRes] = await Promise.all([
        appointmentApi.getMyAppointments(),
        adminApi.getDoctors().catch(() => ({ data: { doctors: [] } })),
      ]);
      setAppointments(apptsRes.data.appointments || apptsRes.data || []);
      setDoctors(docsRes.data.doctors || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
      showToast('Error loading appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check doctor availability when doctor or date changes
  const checkAvailability = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setCheckingAvailability(true);
    setAvailabilityMessage(null);
    try {
      const res = await appointmentApi.checkDoctorAvailability(doctorId, date);
      if (res.data.isAvailable) {
        setAvailabilityMessage({
          type: 'success',
          text: `Doctor is available. ${res.data.bookedSlots?.length || 0} slots already booked.`,
        });
      } else {
        setAvailabilityMessage({
          type: 'error',
          text: res.data.message || 'Doctor not available on this day.',
        });
      }
    } catch (err) {
      console.error('Availability check failed', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      await appointmentApi.createAppointment(formData);
      showToast('Appointment requested successfully!', 'success');
      setBookingModalOpen(false);
      fetchData();
      setFormData({
        doctorId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        reason: '',
      });
      setAvailabilityMessage(null);
    } catch (err) {
      console.error('Booking failed', err);
      const errMsg = err.response?.data?.message || 'Could not schedule appointment. Slot may be unavailable.';
      setBookingError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentApi.cancelAppointment(id);
      showToast('Appointment cancelled successfully', 'info');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

  if (loading) {
    return <Loading text="Fetching appointment ledger..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            My Appointments
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {appointments.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Schedule consultations, check physician queue numbers, and manage cancellations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          <Button onClick={() => setBookingModalOpen(true)} variant="primary" size="sm" icon={Plus}>
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No Appointments Found"
          description="You haven't scheduled any consultations yet."
          actionLabel="Book First Appointment"
          onAction={() => setBookingModalOpen(true)}
        />
      ) : viewMode === 'list' ? (
        <Table
          headers={['Physician', 'Specialization', 'Date & Time', 'Queue #', 'Status', 'Actions']}
        >
          {appointments.map((appt) => (
            <TableRow key={appt._id}>
              <TableCell>
                <div className="font-semibold text-white">
                  {appt.doctorId?.fullName || 'Assigned Physician'}
                </div>
                {appt.reason && <div className="text-xs text-slate-400 line-clamp-1">{appt.reason}</div>}
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300">
                  {appt.doctorId?.specialization || 'Clinical'}
                </span>
              </TableCell>

              <TableCell>
                <div className="font-medium text-slate-200">
                  {new Date(appt.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-cyan-400 font-mono">
                  {appt.startTime} - {appt.endTime}
                </div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300">
                  #{appt.queueNumber || '-'}
                </span>
              </TableCell>

              <TableCell>
                <Badge status={appt.status} />
              </TableCell>

              <TableCell>
                {['requested', 'scheduled'].includes(appt.status) && (
                  <Button
                    onClick={() => handleCancel(appt._id)}
                    variant="danger"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={XCircle}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      ) : (
        /* Calendar / Card Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <Card key={appt._id} glow={appt.status === 'scheduled'}>
              <div className="flex justify-between items-start mb-3">
                <Badge status={appt.status} />
                <span className="font-mono text-xs text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                  Queue #{appt.queueNumber || '-'}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                {appt.doctorId?.fullName || 'Assigned Doctor'}
              </h4>
              <p className="text-xs text-cyan-400 mb-3">{appt.doctorId?.specialization}</p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{new Date(appt.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="text-cyan-400">{appt.startTime} - {appt.endTime}</span>
                </div>
              </div>

              {appt.reason && (
                <p className="text-xs text-slate-400 mt-3 italic line-clamp-2">
                  "{appt.reason}"
                </p>
              )}

              {['requested', 'scheduled'].includes(appt.status) && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  <Button
                    onClick={() => handleCancel(appt._id)}
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Physician Consultation"
        subtitle="Select a physician, date, and preferred time slot."
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select Doctor</label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) => {
                const docId = e.target.value;
                setFormData({ ...formData, doctorId: docId });
                checkAvailability(docId, formData.date);
              }}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose a Physician --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Date of Visit</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => {
                const d = e.target.value;
                setFormData({ ...formData, date: d });
                checkAvailability(formData.doctorId, d);
              }}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Availability Feedback Banner */}
          {availabilityMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono ${
                availabilityMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {availabilityMessage.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Reason for Visit / Symptoms</label>
            <textarea
              rows={3}
              placeholder="e.g. Mild chest tightness, routine follow-up"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setBookingModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={bookingLoading} variant="primary" size="sm">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientAppointmentsPage;
