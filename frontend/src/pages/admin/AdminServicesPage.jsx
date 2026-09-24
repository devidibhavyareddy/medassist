import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Tag,
  Building2,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const { showToast } = useToast();

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    department: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, deptsRes] = await Promise.allSettled([
        adminApi.getServices(),
        adminApi.getDepartments(),
      ]);

      if (servicesRes.status === 'fulfilled') {
        setServices(servicesRes.value.data.services || servicesRes.value.data || []);
      }
      if (deptsRes.status === 'fulfilled') {
        setDepartments(deptsRes.value.data.departments || deptsRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load services data', err);
      showToast('Error loading services and department list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      department: departments[0]?._id || '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price ?? '',
      department: service.department?._id || service.department || '',
      status: service.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === '' || !formData.department) {
      showToast('Name, price and department are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        department: formData.department,
        status: formData.status,
      };

      if (editingService) {
        await adminApi.updateService(editingService._id, payload);
        showToast('Service procedure updated successfully', 'success');
      } else {
        await adminApi.createService(payload);
        showToast('Service procedure added to catalog', 'success');
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

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteService(serviceToDelete._id);
      showToast('Service removed from catalog', 'success');
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete service', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q);
    const deptId = s.department?._id || s.department;
    const matchesDept =
      selectedDeptFilter === 'all' || deptId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Clinical Catalog & Service Pricing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain consultation tiers, surgical procedures, diagnostic scans, and fee schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Clinical Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search service name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <Loading text="Loading clinical catalog..." />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No services found"
          description="Add diagnostic, consultation, or therapeutic services to your clinic catalog."
          actionLabel="Add Service"
          onAction={openCreateModal}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Service Name & Description</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Fee / Pricing</th>
                  <th className="py-4 px-6">Catalog Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredServices.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-200">
                        {service.name}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {service.description || 'General clinical consultation procedure'}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        {service.department?.name || 'General Department'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        ${service.price?.toFixed(2) || '0.00'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <Badge
                        variant={service.status === 'active' ? 'success' : 'neutral'}
                      >
                        {service.status || 'active'}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(service)}
                          className="text-xs text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(service)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Add / Edit Service */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Modify Service Procedure' : 'Add New Clinical Service'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Service / Procedure Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Comprehensive Cardiac Echo, Routine Consultation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Department Division *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
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
                Standard Fee (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="120.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-7 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Service Scope & Clinical Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline what is included, pre-procedure directions, or duration..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {editingService && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Service Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="active">Active (Available for Booking)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingService ? 'Save Service' : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Service Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-rose-300">
              Are you sure you want to remove <strong className="text-white">{serviceToDelete?.name}</strong> from the clinic catalog?
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
              Delete Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServicesPage;
