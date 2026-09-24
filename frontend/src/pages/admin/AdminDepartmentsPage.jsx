import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDepartments();
      setDepartments(res.data.departments || res.data || []);
    } catch (err) {
      console.error('Failed to load departments', err);
      showToast('Error loading department units', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Department name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDept) {
        await adminApi.updateDepartment(editingDept._id, formData);
        showToast('Department updated successfully', 'success');
      } else {
        await adminApi.createDepartment(formData);
        showToast('Department created successfully', 'success');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (dept) => {
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteDepartment(deptToDelete._id);
      showToast('Department removed successfully', 'success');
      setDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete department', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Clinical Departments & Divisions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize medical faculties, hospital wings, and clinical operational units.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchDepartments} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            New Department
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredDepts.length} units listed
        </span>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <Loading text="Loading departments..." />
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first clinical department to start structuring doctors and services."
          actionLabel="Create Department"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <Card
              key={dept._id}
              className="flex flex-col justify-between hover:border-purple-500/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {dept._id.slice(-6)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100">{dept.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {dept.description || 'No description specified for this department unit.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(dept.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(dept)}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(dept)}
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

      {/* Modal: Create / Edit Department */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Modify Department Details' : 'Establish New Department'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cardiology, Neurology, Pediatrics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Description & Specialization Focus
            </label>
            <textarea
              rows={4}
              placeholder="Outline clinical focus, ward details, or patient scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Department Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-rose-300">
              Are you sure you want to delete <strong className="text-white">{deptToDelete?.name}</strong>?
              This action cannot be undone.
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
              Delete Department
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDepartmentsPage;
