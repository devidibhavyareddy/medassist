import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../api/prescriptionApi';
import { Pill, User, Calendar, Plus, Eye } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await prescriptionApi.getDoctorPrescriptions();
        setPrescriptions(res.data.prescriptions || res.data || []);
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) {
    return <Loading text="Fetching physician e-Prescriptions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Physician e-Prescriptions
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {prescriptions.length} Issued
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review active and historical pharmacological regimens authorized for your patients.
          </p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Issued"
          description="Formulate prescriptions during active consultations from the appointment queue."
        />
      ) : (
        <Table headers={['Patient', 'Date Issued', 'Medications', 'Status', 'Actions']}>
          {prescriptions.map((rx) => (
            <TableRow key={rx._id}>
              <TableCell>
                <div className="font-semibold text-white">{rx.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{rx.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-200">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {rx.medicines?.map((m, i) => (
                    <span
                      key={i}
                      className="inline-block text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded mr-1.5 text-cyan-300 font-mono"
                    >
                      {m.medicineName} ({m.dosage})
                    </span>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <Badge status={rx.status} />
              </TableCell>

              <TableCell>
                <Button
                  onClick={() => setSelectedRx(rx)}
                  variant="ghost"
                  size="sm"
                  className="text-xs py-1 px-2.5"
                  icon={Eye}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Prescription Detail Modal */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Physician Prescription Order"
        subtitle={selectedRx ? `Patient: ${selectedRx.patientId?.fullName} • Date: ${new Date(selectedRx.createdAt).toLocaleDateString()}` : ''}
      >
        {selectedRx && (
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">Authorized Medications</h4>
            <div className="space-y-2">
              {selectedRx.medicines?.map((m, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{m.medicineName}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">{m.dosage}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                    <span>Frequency: {m.frequency}</span>
                    <span>Duration: {m.duration}</span>
                    {m.route && <span>Route: {m.route}</span>}
                    {m.timing && <span>Timing: {m.timing}</span>}
                  </div>
                  {m.instructions && (
                    <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800">
                      Instruction: {m.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {selectedRx.generalInstructions && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">General Instructions</span>
                <p className="text-xs text-slate-200">{selectedRx.generalInstructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPrescriptionsPage;
