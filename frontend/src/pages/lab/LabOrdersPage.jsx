import React, { useState, useEffect } from 'react';
import { labApi } from '../../api/labApi';
import { useToast } from '../../context/ToastContext';
import {
  TestTubes,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const LabOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const stages = [
    { key: 'ordered', label: 'Ordered', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
    { key: 'samplePending', label: 'Sample Pending', color: 'border-amber-500/30 bg-amber-950/20 text-amber-300' },
    { key: 'sampleCollected', label: 'Sample Collected', color: 'border-blue-500/30 bg-blue-950/20 text-blue-300' },
    { key: 'processing', label: 'Processing', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' },
    { key: 'completed', label: 'Completed', color: 'border-teal-500/30 bg-teal-950/20 text-teal-300' },
    { key: 'verified', label: 'Verified', color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300' },
    { key: 'released', label: 'Released', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await labApi.getAllLabOrders();
      setOrders(res.data.labOrders || res.data || []);
    } catch (err) {
      console.error('Failed to load lab orders', err);
      showToast('Error loading lab orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvanceStage = async (order, nextStage) => {
    try {
      await labApi.updateLabOrderStatus(order._id, nextStage);
      showToast(`Order #${order.orderId} advanced to ${nextStage}!`, 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to advance stage', 'error');
    }
  };

  const getNextStage = (current) => {
    const sequence = [
      'ordered',
      'samplePending',
      'sampleCollected',
      'processing',
      'completed',
      'verified',
      'released',
    ];
    const idx = sequence.indexOf(current);
    if (idx !== -1 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    return null;
  };

  if (loading) {
    return <Loading text="Constructing laboratory workflow matrix..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Laboratory Kanban Workflow
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {orders.length} Specimens in Flow
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual stage-by-stage specimen chain of custody and assay analytics tracking.
          </p>
        </div>

        <Button onClick={fetchOrders} variant="secondary" size="sm" icon={RefreshCw}>
          Refresh Board
        </Button>
      </div>

      {/* 7-Stage Visual Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1400px]">
          {stages.map((stage) => {
            const stageOrders = orders.filter((o) => o.status === stage.key);

            return (
              <div
                key={stage.key}
                className="w-72 rounded-2xl glass-panel border border-slate-800 p-4 flex flex-col shrink-0 max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-cyan-300">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Cards List in Stage */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageOrders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono">
                      No specimens
                    </div>
                  ) : (
                    stageOrders.map((ord) => {
                      const next = getNextStage(ord.status);
                      return (
                        <div
                          key={ord._id}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              #{ord.orderId}
                            </span>
                            <Badge status={ord.priority} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white truncate">
                              {ord.patientId?.fullName || 'Patient'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              ID: {ord.patientId?.patientId || '-'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            {ord.tests?.map((t, i) => (
                              <div
                                key={i}
                                className="text-[11px] bg-slate-950 p-1.5 rounded text-slate-300 font-mono truncate"
                              >
                                • {t.testName}
                              </div>
                            ))}
                          </div>

                          {ord.clinicalNote && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-1">
                              Note: {ord.clinicalNote}
                            </p>
                          )}

                          {next && (
                            <div className="pt-2 border-t border-slate-800 flex justify-end">
                              <Button
                                onClick={() => handleAdvanceStage(ord, next)}
                                variant="primary"
                                size="sm"
                                className="w-full text-xs py-1"
                                icon={ChevronRight}
                              >
                                Advance: {next}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LabOrdersPage;
