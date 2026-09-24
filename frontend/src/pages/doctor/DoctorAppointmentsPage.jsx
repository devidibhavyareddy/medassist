import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  List,
  Check,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getDoctorAppointments();
      setAppointments(res.data.appointments || res.data || []);
    } catch (err) {
      console.error('Failed to load doctor appointments', err);
      showToast('Could not load appointment queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentApi.updateAppointmentStatus(id, newStatus);
      showToast(`Appointment status updated to ${newStatus}`, 'success');
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleLaunchConsultation = (id) => {
    navigate(`/doctor/consultation/${id}`);
  };

  const filtered = statusFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  if (loading) {
    return <Loading text="Loading physician appointment queue..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Physician Appointment Queue
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {filtered.length} Consultations
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage daily queues, transition consultation states, and initiate medical consultations.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {['all', 'scheduled', 'checkedIn', 'inConsultation', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="There are no appointments matching the selected status filter."
        />
      ) : (
        <Table headers={['Queue', 'Patient', 'Date & Time', 'Reason', 'Status', 'Actions']}>
          {filtered.map((appt) => (
            <TableRow key={appt._id}>
              <TableCell>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                  #{appt.queueNumber || '-'}
                </span>
              </TableCell>

              <TableCell>
                <div className="font-semibold text-white">
                  {appt.patientId?.fullName || 'Patient'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {appt.patientId?.patientId} • {appt.patientId?.phone || 'No phone'}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-slate-200 font-medium">
                  {new Date(appt.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-cyan-400 font-mono">
                  {appt.startTime} - {appt.endTime}
                </div>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300 line-clamp-1">{appt.reason || 'General'}</span>
              </TableCell>

              <TableCell>
                <Badge status={appt.status} />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {appt.status !== 'completed' && (
                    <Button
                      onClick={() => handleLaunchConsultation(appt._id)}
                      variant="primary"
                      size="sm"
                      className="text-xs py-1 px-3"
                      icon={Play}
                    >
                      Consult
                    </Button>
                  )}

                  {appt.status === 'scheduled' && (
                    <Button
                      onClick={() => handleUpdateStatus(appt._id, 'checkedIn')}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                    >
                      Check-In
                    </Button>
                  )}

                  {appt.status === 'inConsultation' && (
                    <Button
                      onClick={() => handleUpdateStatus(appt._id, 'completed')}
                      variant="secondary"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                      icon={Check}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
