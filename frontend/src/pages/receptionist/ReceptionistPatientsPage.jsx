import React, { useState, useEffect } from 'react';
import { searchApi } from '../../api/searchApi';
import { patientApi } from '../../api/patientApi';
import { useToast } from '../../context/ToastContext';
import { Users, UserPlus, Search, Phone, Mail, CheckCircle2, AlertTriangle, HeartPulse } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const ReceptionistPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fast registration form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Spouse',
  });

  const { showToast } = useToast();

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await searchApi.searchPatients(query);
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await patientApi.createByStaff({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRelationship,
        },
      });

      showToast(`Patient ${formData.fullName} enrolled successfully!`, 'success');
      setModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        bloodGroup: 'O+',
        allergies: '',
        address: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelationship: 'Spouse',
      });
      fetchPatients();
    } catch (err) {
      console.error('Fast registration failed', err);
      showToast(err.response?.data?.message || 'Failed to enroll patient', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Patient Intake & Registration
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {patients.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rapid walk-in patient enrollment, electronic health records generation, and directory lookup.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchPatients(e.target.value);
              }}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <Button onClick={() => setModalOpen(true)} variant="primary" size="sm" icon={UserPlus}>
            Fast Enrollment
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading text="Searching patient index..." />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description={search ? `No results for "${search}"` : 'Enroll a patient to populate the clinic directory.'}
          actionLabel="Enroll Patient"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Table headers={['Patient Name', 'Patient ID', 'Contact Phone', 'Gender & DOB', 'Blood Group', 'Actions']}>
          {patients.map((pat) => (
            <TableRow key={pat._id}>
              <TableCell>
                <div className="font-semibold text-white">{pat.fullName}</div>
                <div className="text-xs text-slate-400">{pat.email}</div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-teal-950/80 border border-teal-500/30 text-teal-300 font-bold">
                  {pat.patientId}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-200">{pat.phone || 'N/A'}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300">
                  {pat.gender || 'Patient'}
                  {pat.dateOfBirth && ` • ${new Date(pat.dateOfBirth).toLocaleDateString()}`}
                </span>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs font-bold text-rose-400">{pat.bloodGroup || 'N/A'}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-500">
                  Enrolled {new Date(pat.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Fast Registration Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Fast Patient Intake Registration"
        subtitle="Immediately generates unique Patient ID and electronic health record ledger"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="Priya Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                placeholder="priya@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Allergies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Sulfa drugs, Latex"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Address</label>
            <input
              type="text"
              placeholder="Residential address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold block">
              Emergency Contact (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary" size="sm">
              Enroll Patient & Generate ID
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistPatientsPage;
