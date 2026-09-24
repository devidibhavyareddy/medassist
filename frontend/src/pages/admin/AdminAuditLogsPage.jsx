import React, { useState, useEffect } from 'react';
import { auditApi } from '../../api/auditApi';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Activity,
  Layers,
  FileCode,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const { showToast } = useToast();

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getAll();
      setLogs(res.data.logs || res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      showToast('Error loading security audit events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openLogDetails = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  // Distinct entity types
  const entityTypes = [
    'all',
    ...Array.from(new Set(logs.map((l) => l.entityType).filter(Boolean))),
  ];

  const filteredLogs = logs.filter((l) => {
    const matchesEntity =
      selectedEntity === 'all' || l.entityType === selectedEntity;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      l.action?.toLowerCase().includes(q) ||
      l.userId?.name?.toLowerCase().includes(q) ||
      l.userId?.email?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.entityId?.toLowerCase().includes(q);
    return matchesEntity && matchesSearch;
  });

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'success';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'info';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'danger';
    if (action.includes('VERIFY') || action.includes('APPROVE')) return 'warning';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
            System Security & HIPAA Audit Trail
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable transaction records tracking clinical data modifications and user authorization events.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Audit Stream
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {entityTypes.map((et) => (
            <button
              key={et}
              onClick={() => setSelectedEntity(et)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedEntity === et
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-slate-800'
              }`}
            >
              {et === 'all' ? 'All Entities' : et}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, user, or entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <Loading text="Loading security audit records..." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No audit events found"
          description="Actions performed across the clinic will automatically generate compliance log entries."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Event / Action</th>
                  <th className="py-4 px-6">Actor / User</th>
                  <th className="py-4 px-6">Target Entity</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-slate-300">
                        {new Date(log.timestamp || log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs text-slate-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-200">
                            {log.userId?.name || 'System / Automated'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.userId?.role || 'Service'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-cyan-300">
                          {log.entityType || 'General'}
                        </span>
                        {log.entityId && (
                          <span className="text-xs font-mono text-slate-500">
                            #{log.entityId.toString().slice(-6)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openLogDetails(log)}
                        className="text-xs text-slate-300 hover:text-white gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Log Details */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Audit Transaction Metadata"
        size="md"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Event Action:</span>
                <span className="font-semibold text-rose-300 font-mono">
                  {selectedLog.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedLog.timestamp || selectedLog.createdAt).toISOString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Actor:</span>
                <span className="text-slate-200">
                  {selectedLog.userId?.name} ({selectedLog.userId?.email || 'N/A'}) - {selectedLog.userId?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entity Affected:</span>
                <span className="font-mono text-cyan-300">
                  {selectedLog.entityType} ({selectedLog.entityId || 'N/A'})
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Raw Payload Metadata
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;
