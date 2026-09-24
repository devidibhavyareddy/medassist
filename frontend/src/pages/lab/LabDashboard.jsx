import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { labApi } from '../../api/labApi';
import { useToast } from '../../context/ToastContext';
import {
  TestTubes,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  FlaskConical,
  Play,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const LabDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getLabDashboard();
      setData(res.data.dashboard);
    } catch (err) {
      console.error('Failed to load lab dashboard', err);
      showToast('Error loading laboratory telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await labApi.updateLabOrderStatus(orderId, newStatus);
      showToast(`Specimen moved to ${newStatus}`, 'success');
      fetchDashboard();
    } catch (err) {
      showToast('Failed to update specimen status', 'error');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const {
    pendingOrders = [],
    urgentOrders = 0,
    processingOrders = 0,
    completedOrders = 0,
    myResults = 0,
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Pathology & Laboratory Operations
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/30 text-amber-300">
                  Diagnostic Center
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Specimen intake, analytical instrument processing, and pathologist telemetry verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/lab/orders">
              <Button variant="primary" size="md" icon={TestTubes}>
                Kanban Workflow
              </Button>
            </Link>
            <Link to="/lab/results">
              <Button variant="secondary" size="md" icon={FileCheck}>
                Result Entry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgent Orders Stat */}
        <Card glow={urgentOrders > 0} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-rose-400 font-bold">Urgent Stat</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-rose-300">{urgentOrders}</div>
            <p className="text-xs text-slate-400 mt-1">High-priority specimen tests</p>
          </div>
          <Link to="/lab/orders" className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-medium">
            Prioritize tests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Processing Orders */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Processing</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-cyan-300">{processingOrders}</div>
            <p className="text-xs text-slate-400 mt-1">Samples on analyzers</p>
          </div>
          <Link to="/lab/orders" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            Track analyzer runs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Completed Orders */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Completed</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-teal-300">{completedOrders}</div>
            <p className="text-xs text-slate-400 mt-1">Assays concluded & released</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Diagnostic telemetry</span>
        </Card>

        {/* Verified Results Count */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">My Reports</span>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold font-mono text-indigo-300">{myResults}</div>
            <p className="text-xs text-slate-400 mt-1">Assigned results finalized</p>
          </div>
          <Link to="/lab/results" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            Input new findings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* Active Work Queue */}
      <Card glow>
        <CardHeader
          title="Active Laboratory Orders Requiring Processing"
          subtitle="Real-time intake queue from outpatient & physician clinics"
          action={
            <Link to="/lab/orders">
              <Button variant="outline" size="sm">
                Open Kanban Flow
              </Button>
            </Link>
          }
        />

        {pendingOrders.length === 0 ? (
          <EmptyState
            icon={TestTubes}
            title="All Specimen Queues Clear"
            description="There are currently no pending lab orders awaiting specimen processing."
          />
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((ord) => (
              <div
                key={ord._id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                    #{ord.orderId?.slice(-4) || 'LAB'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {ord.patientId?.fullName || 'Patient'}
                      </h4>
                      <Badge status={ord.priority} />
                      <Badge status={ord.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tests: <strong className="text-slate-200">{ord.tests?.map((t) => t.testName).join(', ')}</strong> • Dr: {ord.doctorId?.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ord.status === 'ordered' && (
                    <Button
                      onClick={() => handleUpdateStatus(ord._id, 'sampleCollected')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Collect Sample
                    </Button>
                  )}
                  {ord.status === 'sampleCollected' && (
                    <Button
                      onClick={() => handleUpdateStatus(ord._id, 'processing')}
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      icon={Play}
                    >
                      Start Run
                    </Button>
                  )}
                  {ord.status === 'processing' && (
                    <Button
                      onClick={() => navigate(`/lab/results?orderId=${ord._id}`)}
                      variant="ai"
                      size="sm"
                      className="text-xs"
                      icon={FileCheck}
                    >
                      Enter Results
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LabDashboard;
