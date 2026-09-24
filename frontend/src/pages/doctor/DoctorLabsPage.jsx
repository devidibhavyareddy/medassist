import React, { useState, useEffect } from 'react';
import { labApi } from '../../api/labApi';
import { searchApi } from '../../api/searchApi';
import { TestTubes, FileCheck, Eye, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorLabsPage = () => {
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [fetchingResult, setFetchingResult] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      const res = await labApi.getAllLabOrders();
      setLabOrders(res.data.labOrders || res.data || []);
    } catch (err) {
      console.error('Failed to load lab orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const handleViewResult = async (orderId) => {
    setFetchingResult(true);
    try {
      const res = await labApi.getLabResultByOrder(orderId);
      setSelectedResult(res.data.labResult || res.data);
      setResultModalOpen(true);
    } catch (err) {
      console.error('No result yet', err);
    } finally {
      setFetchingResult(false);
    }
  };

  if (loading) {
    return <Loading text="Retrieving clinical lab diagnostics..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Laboratory Diagnostic Orders
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {labOrders.length} Orders
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track diagnostic order progression from specimen collection to verified pathologist telemetry.
          </p>
        </div>
      </div>

      {labOrders.length === 0 ? (
        <EmptyState
          icon={TestTubes}
          title="No Lab Orders Active"
          description="Request lab tests during patient consultations to track progress here."
        />
      ) : (
        <Table headers={['Order ID', 'Patient', 'Priority', 'Requested Tests', 'Status', 'Actions']}>
          {labOrders.map((ord) => (
            <TableRow key={ord._id}>
              <TableCell>
                <span className="font-mono text-xs font-bold text-cyan-400">#{ord.orderId}</span>
                <span className="block text-[10px] text-slate-400">
                  {new Date(ord.orderedAt || ord.createdAt).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell>
                <div className="font-semibold text-white">{ord.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{ord.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <Badge status={ord.priority} />
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {ord.tests?.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded mr-1 text-slate-200"
                    >
                      {t.testName}
                    </span>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <Badge status={ord.status} />
              </TableCell>

              <TableCell>
                {['completed', 'verified', 'released'].includes(ord.status) ? (
                  <Button
                    onClick={() => handleViewResult(ord._id)}
                    variant="primary"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={FileCheck}
                  >
                    View Results
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> In-Flight
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Lab Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Diagnostic Laboratory Findings"
        subtitle={selectedResult ? `Verified Specimen Results • Status: ${selectedResult.verificationStatus}` : ''}
      >
        {selectedResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Verification</span>
              <Badge status={selectedResult.verificationStatus} />
            </div>

            <div className="space-y-2">
              {selectedResult.results?.map((res, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">{res.testName}</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">
                      {res.value} <span className="text-xs text-slate-400 font-normal">{res.unit}</span>
                    </span>
                  </div>
                  {res.referenceRange && (
                    <p className="text-xs text-slate-400 font-mono">Reference Range: {res.referenceRange}</p>
                  )}
                  {res.observation && (
                    <p className="text-xs text-slate-300 italic">{res.observation}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedResult.technicianNotes && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">Pathologist Remarks</span>
                {selectedResult.technicianNotes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorLabsPage;
