import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Award,
  Check,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [candidateUsers, setCandidateUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    doctorId: '',
    fullName: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, usersRes, deptsRes] = await Promise.allSettled([
        adminApi.getDoctors(),
        adminApi.getUsers(),
        adminApi.getDepartments(),
      ]);

      let docsList = [];
      if (docsRes.status === 'fulfilled') {
        docsList = docsRes.value.data.doctors || docsRes.value.data || [];
        setDoctors(docsList);
      }

      if (usersRes.status === 'fulfilled') {
        const allUsers = usersRes.value.data.users || usersRes.value.data || [];
        // Candidate users must have role 'doctor' and not already have a doctor profile
        const existingUserIds = new Set(docsList.map((d) => d.userId?._id || d.userId));
        const availableDoctorUsers = allUsers.filter(
          (u) => u.role === 'doctor' && !existingUserIds.has(u._id)
        );
        setCandidateUsers(availableDoctorUsers);
      }

      if (deptsRes.status === 'fulfilled') {
        setDepartments(deptsRes.value.data.departments || deptsRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load doctors data', err);
      showToast('Error loading physician directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      userId: candidateUsers[0]?._id || '',
      doctorId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      specialization: '',
      department: departments[0]?._id || '',
      qualification: 'MBBS, MD',
      experience: '5',
      consultationFee: '100',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      userId: doc.userId?._id || doc.userId || '',
      doctorId: doc.doctorId || '',
      fullName: doc.fullName || '',
      specialization: doc.specialization || '',
      department: doc.department?._id || doc.department || '',
      qualification: doc.qualification || '',
      experience: doc.experience ?? '',
      consultationFee: doc.consultationFee ?? '',
      availableDays: doc.availableDays || ['Monday', 'Wednesday', 'Friday'],
      workingHoursStart: doc.workingHours?.start || '09:00',
      workingHoursEnd: doc.workingHours?.end || '17:00',
      status: doc.status || 'active',
    });
    setModalOpen(true);
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.availableDays.includes(day);
      const updated = exists
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.specialization.trim() || !formData.department) {
      showToast('Full name, specialization, and department are mandatory', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName,
        specialization: formData.specialization,
        department: formData.department,
        qualification: formData.qualification,
        experience: Number(formData.experience) || 0,
        consultationFee: Number(formData.consultationFee) || 0,
        availableDays: formData.availableDays,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
        },
        status: formData.status,
      };

      if (editingDoctor) {
        await adminApi.updateDoctor(editingDoctor._id, payload);
        showToast('Doctor profile updated successfully', 'success');
      } else {
        if (!formData.userId) {
          showToast('Please select a registered user with doctor role', 'warning');
          setSubmitting(false);
          return;
        }
        await adminApi.createDoctor({
          ...payload,
          userId: formData.userId,
          doctorId: formData.doctorId,
        });
        showToast('Doctor profile established successfully', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (doc) => {
    setDoctorToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteDoctor(doctorToDelete._id);
      showToast('Doctor profile removed', 'success');
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to remove doctor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.fullName?.toLowerCase().includes(q) ||
      d.doctorId?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.department?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Physicians & Clinical Specialists
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage practicing doctor credentials, assigned departments, schedules, and fees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Register Doctor
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search doctor, ID, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredDoctors.length} physicians registered
        </span>
      </div>

      {/* Doctors Cards Grid */}
      {loading ? (
        <Loading text="Loading doctor profiles..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="Register certified physicians into departments to accept patient consultations."
          actionLabel="Register Doctor"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <Card
              key={doc._id}
              className="flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-base">
                      {doc.fullName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'active' ? 'success' : 'neutral'}>
                    {doc.status || 'active'}
                  </Badge>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      Department:
                    </span>
                    <span className="text-slate-200 font-medium">
                      {doc.department?.name || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Credentials:
                    </span>
                    <span className="text-slate-200 font-medium">
                      {doc.qualification || 'N/A'} • {doc.experience || 0} yrs
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Consultation Fee:
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${doc.consultationFee?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Hours:
                    </span>
                    <span className="font-mono text-slate-300">
                      {doc.workingHours?.start || '09:00'} - {doc.workingHours?.end || '17:00'}
                    </span>
                  </div>
                </div>

                {doc.availableDays && doc.availableDays.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Clinic Days
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {doc.availableDays.map((d, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  ID: #{doc.doctorId}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(doc)}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(doc)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Doctor */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoctor ? `Edit Profile: ${editingDoctor.fullName}` : 'Register New Medical Doctor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingDoctor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Link Registered Doctor Account *
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select User with Doctor Role</option>
                  {candidateUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {candidateUsers.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    No unassigned users with "doctor" role found. Update a user's role in User Access Control first.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Doctor ID / License Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DOC-101"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Professional Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Alexander Wright, MD"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Medical Specialization *
              </label>
              <input
                type="text"
                required
                placeholder="Cardiology / Internal Medicine"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Fee ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Qualifications & Credentials
              </label>
              <input
                type="text"
                placeholder="MBBS, MD (Cardiology), FACC"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Shift Start
                </label>
                <input
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Shift End
                </label>
                <input
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Available Days of Week
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = formData.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {editingDoctor && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Practice Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Active (Taking Appointments)</option>
                <option value="inactive">Inactive / On Leave</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingDoctor ? 'Update Profile' : 'Register Physician'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Doctor Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-rose-300">
              Are you sure you want to remove <strong className="text-white">{doctorToDelete?.fullName}</strong>?
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Doctor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDoctorsPage;
