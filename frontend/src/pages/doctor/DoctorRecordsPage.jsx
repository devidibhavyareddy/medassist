import React, { useState, useEffect } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { useNavigate } from 'react-router-dom';
import { FolderHeart, Sparkles, Calendar, User, Search, Eye } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await medicalRecordApi.getDoctorMedicalRecords();
      setRecords(res.data.records || res.data || []);
    } catch (err) {
      console.error('Failed to load medical records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) {
    return <Loading text="Fetching physician clinical records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Clinical Records Ledger
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {records.length} Documents
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse documented patient encounters, clinical notes, and physician-supervised AI summaries.
          </p>
        </div>

        <Button
          onClick={() => navigate('/doctor/ai')}
          variant="ai"
          size="sm"
          icon={Sparkles}
        >
          Open AI Clinical Studio
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title="No Medical Records"
          description="You have not created any electronic medical records yet."
        />
      ) : (
        <Table headers={['Patient', 'Encounter Date', 'Diagnosis', 'Chief Complaint', 'AI Status', 'Actions']}>
          {records.map((rec) => (
            <TableRow key={rec._id}>
              <TableCell>
                <div className="font-semibold text-white">{rec.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{rec.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-200">
                  {new Date(rec.visitDate || rec.createdAt).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-sm font-semibold text-cyan-300">{rec.diagnosis || 'Clinical Visit'}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300 line-clamp-1">{rec.chiefComplaint || '-'}</span>
              </TableCell>

              <TableCell>
                {rec.aiSummaryReviewed ? (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Verified
                  </span>
                ) : rec.aiSummary ? (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                    Pending Review
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">None</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedRecord(rec)}
                    variant="ghost"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={Eye}
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => navigate('/doctor/ai')}
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={Sparkles}
                  >
                    AI
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Record View Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Electronic Clinical Encounter Record"
        subtitle={selectedRecord ? `Patient: ${selectedRecord.patientId?.fullName} • Date: ${new Date(selectedRecord.visitDate || selectedRecord.createdAt).toLocaleDateString()}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Diagnosis</span>
              <p className="text-base font-bold text-cyan-300 mt-1">{selectedRecord.diagnosis}</p>
            </div>

            {selectedRecord.chiefComplaint && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Chief Complaint</span>
                <p className="text-sm text-slate-200 mt-1">{selectedRecord.chiefComplaint}</p>
              </div>
            )}

            {selectedRecord.examinationFindings && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Examination Findings</span>
                <p className="text-sm text-slate-200 mt-1">{selectedRecord.examinationFindings}</p>
              </div>
            )}

            {selectedRecord.clinicalNotes && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Clinical Notes</span>
                <p className="text-sm text-slate-200 mt-1 whitespace-pre-line leading-relaxed">{selectedRecord.clinicalNotes}</p>
              </div>
            )}

            {selectedRecord.treatmentPlan && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase">Treatment Plan</span>
                <p className="text-sm text-slate-200 mt-1">{selectedRecord.treatmentPlan}</p>
              </div>
            )}

            {selectedRecord.aiSummary && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Clinical Summary
                </span>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed whitespace-pre-line">{selectedRecord.aiSummary}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorRecordsPage;
