import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const { showToast } = useToast();

  // Role Edit Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  // Status toggle in progress
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
      showToast('Error loading user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setTogglingId(user._id);
    try {
      const res = await adminApi.toggleUserStatus(user._id);
      showToast(res.data.message || `User status updated`, 'success');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;

    setSavingRole(true);
    try {
      await adminApi.updateUserRole(selectedUser._id, newRole);
      showToast(`Role updated to ${newRole} for ${selectedUser.name}`, 'success');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, role: newRole } : u
        )
      );
      setRoleModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'labTechnician', label: 'Lab Tech' },
    { value: 'patient', label: 'Patient' },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'doctor':
        return 'success';
      case 'labTechnician':
        return 'warning';
      case 'receptionist':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            User Access & Identity Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage system roles, account lifecycles, and authenticate portal access.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchUsers} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedRole === r.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <Loading text="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match your criteria"
          description="Adjust your search query or role filter to display registered users."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">User / Identity</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-xs">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>

                    <td className="py-4 px-6">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                          <XCircle className="w-4 h-4" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleModal(user)}
                          className="gap-1 text-xs text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Change Role
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          loading={togglingId === user._id}
                          onClick={() => handleToggleStatus(user)}
                          className={`gap-1 text-xs ${
                            user.isActive
                              ? 'text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-950/20'
                              : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/20'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Activate
                            </>
                          )}
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

      {/* Role Edit Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Modify Role for ${selectedUser?.name}`}
        size="sm"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Email: {selectedUser?.email}</div>
            <div className="text-slate-400">
              Current Role:{' '}
              <span className="font-semibold text-cyan-300">
                {selectedUser?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select New Assigned Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="admin">Administrator</option>
              <option value="doctor">Medical Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="labTechnician">Lab Technician</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={savingRole}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
