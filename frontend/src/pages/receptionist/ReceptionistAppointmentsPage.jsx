import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { adminApi } from '../../api/adminApi';
import { searchApi } from '../../api/searchApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  User,
  Plus,
  XCircle,
  Search,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const ReceptionistAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Forms
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    reason: '',
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptsRes, docsRes, patsRes] = await Promise.all([
        appointmentApi.getAllAppointments(),
        adminApi.getDoctors().catch(() => ({ data: { doctors: [] } })),
        searchApi.searchPatients('').catch(() => ({ data: { patients: [] } })),
      ]);
      setAppointments(apptsRes.data.appointments || apptsRes.data || []);
      setDoctors(docsRes.data.doctors || []);
      setPatients(patsRes.data.patients || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
      showToast('Error loading appointments ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentApi.createAppointment(bookingForm);
      showToast('Appointment successfully scheduled and queued!', 'success');
      setBookingModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Booking failed', err);
      showToast(err.response?.data?.message || 'Failed to schedule appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await appointmentApi.updateAppointmentStatus(id, 'checkedIn');
      showToast('Patient marked as Checked In!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    setRescheduleForm({
      date: new Date(appt.date).toISOString().split('T')[0],
      startTime: appt.startTime,
      endTime: appt.endTime,
    });
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentApi.rescheduleAppointment(selectedAppt._id, rescheduleForm);
      showToast('Appointment successfully rescheduled!', 'success');
      setRescheduleModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentApi.cancelAppointment(id);
      showToast('Appointment cancelled', 'info');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  if (loading) {
    return <Loading text="Syncing clinic queue and appointments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Clinic Queue & Appointments
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {appointments.length} Scheduled
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time queue distribution, physician check-in control, and schedule modifications.
          </p>
        </div>

        <Button onClick={() => setBookingModalOpen(true)} variant="primary" size="sm" icon={Plus}>
          Schedule Appointment
        </Button>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="Schedule a patient appointment to initialize the daily queue."
          actionLabel="Schedule Now"
          onAction={() => setBookingModalOpen(true)}
        />
      ) : (
        <Table headers={['Queue', 'Patient', 'Physician', 'Date & Time', 'Status', 'Actions']}>
          {appointments.map((appt) => (
            <TableRow key={appt._id}>
              <TableCell>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-teal-300 font-bold">
                  #{appt.queueNumber || '-'}
                </span>
              </TableCell>

              <TableCell>
                <div className="font-semibold text-white">{appt.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{appt.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <div className="text-slate-200">{appt.doctorId?.fullName || 'Physician'}</div>
                <div className="text-xs text-cyan-400">{appt.doctorId?.specialization}</div>
              </TableCell>

              <TableCell>
                <div className="text-slate-200 text-xs font-medium">
                  {new Date(appt.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-cyan-300 font-mono">
                  {appt.startTime} - {appt.endTime}
                </div>
              </TableCell>

              <TableCell>
                <Badge status={appt.status} />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {(appt.status === 'scheduled' || appt.status === 'requested') && (
                    <Button
                      onClick={() => handleCheckIn(appt._id)}
                      variant="primary"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                    >
                      Check-In
                    </Button>
                  )}

                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <>
                      <Button
                        onClick={() => handleOpenReschedule(appt)}
                        variant="secondary"
                        size="sm"
                        className="text-xs py-1 px-2.5"
                      >
                        Reschedule
                      </Button>
                      <Button
                        onClick={() => handleCancel(appt._id)}
                        variant="danger"
                        size="sm"
                        className="text-xs py-1 px-2"
                        icon={XCircle}
                      />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Clinic Appointment"
        subtitle="Assign patient to physician queue"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select Patient</label>
            <select
              required
              value={bookingForm.patientId}
              onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName} ({p.patientId}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select Attending Physician</label>
            <select
              required
              value={bookingForm.doctorId}
              onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose Physician --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Date</label>
            <input
              type="date"
              required
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Start Time</label>
              <input
                type="time"
                required
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">End Time</label>
              <input
                type="time"
                required
                value={bookingForm.endTime}
                onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Reason</label>
            <input
              type="text"
              placeholder="e.g. Follow-up consultation"
              value={bookingForm.reason}
              onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setBookingModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary" size="sm">
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        subtitle={`Patient: ${selectedAppt?.patientId?.fullName || ''}`}
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">New Date</label>
            <input
              type="date"
              required
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">New Start Time</label>
              <input
                type="time"
                required
                value={rescheduleForm.startTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">New End Time</label>
              <input
                type="time"
                required
                value={rescheduleForm.endTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setRescheduleModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary" size="sm">
              Save Reschedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistAppointmentsPage;
