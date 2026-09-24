import React, { useState, useEffect } from 'react';
import { followUpApi } from '../../api/followUpApi';
import { useToast } from '../../context/ToastContext';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorFollowUpsPage = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await followUpApi.getDoctorFollowUps();
      setFollowUps(res.data.followUps || res.data || []);
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleComplete = async (id) => {
    try {
      await followUpApi.updateFollowUp(id, { status: 'completed' });
      showToast('Follow-up marked as completed!', 'success');
      fetchFollowUps();
    } catch (err) {
      showToast('Failed to update follow-up', 'error');
    }
  };

  if (loading) {
    return <Loading text="Retrieving patient follow-up schedules..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Patient Follow-Up Consultations
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {followUps.length} Consultations
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor post-consultation recovery, treatment efficacy, and scheduled check-ins.
          </p>
        </div>
      </div>

      {followUps.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Pending Follow-ups"
          description="There are currently no patients flagged for follow-up evaluation."
        />
      ) : (
        <Table headers={['Patient', 'Follow-up Date', 'Clinical Indication / Reason', 'Status', 'Actions']}>
          {followUps.map((f) => (
            <TableRow key={f._id}>
              <TableCell>
                <div className="font-semibold text-white">{f.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{f.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono font-semibold text-rose-300">
                  {new Date(f.followUpDate).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-200">{f.reason || 'General recovery check'}</span>
              </TableCell>

              <TableCell>
                <Badge status={f.status} />
              </TableCell>

              <TableCell>
                {f.status !== 'completed' && (
                  <Button
                    onClick={() => handleComplete(f._id)}
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={CheckCircle2}
                  >
                    Mark Done
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
};

export default DoctorFollowUpsPage;
