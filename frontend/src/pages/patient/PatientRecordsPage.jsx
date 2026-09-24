import React, { useState, useEffect } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { HeartPulse, User, Calendar, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const PatientRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await medicalRecordApi.getMyMedicalRecords();
        setRecords(res.data.records || res.data || []);
      } catch (err) {
        console.error('Failed to load medical records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) {
    return <Loading text="Retrieving medical record history..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            My Clinical Records
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {records.length} Encounters
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access physician diagnostic assessments, clinical notes, and AI synthesized consultation summaries.
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No Medical Records"
          description="You do not have any recorded doctor visits in your electronic medical chart yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((rec) => (
            <Card
              key={rec._id}
              onClick={() => setSelectedRecord(rec)}
              className="cursor-pointer space-y-4"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-base">
                    Dx: {rec.diagnosis || 'Clinical Consultation'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attending: {rec.doctorId?.fullName || 'Physician'}
                  </p>
                </div>
                <time className="text-xs font-mono text-cyan-400">
                  {new Date(rec.visitDate || rec.createdAt).toLocaleDateString()}
                </time>
              </div>

              {rec.chiefComplaint && (
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Chief Complaint</span>
                  <p className="mt-0.5">{rec.chiefComplaint}</p>
                </div>
              )}

              {rec.treatmentPlan && (
                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-teal-400 font-semibold uppercase text-[10px] block">Treatment Plan</span>
                  <p className="mt-0.5">{rec.treatmentPlan}</p>
                </div>
              )}

              {rec.aiSummary && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Clinical Summary Available
                  </span>
                  {rec.aiSummaryReviewed && (
                    <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Doctor Verified
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Electronic Health Record Encounter"
        subtitle={selectedRecord ? `Encounter Date: ${new Date(selectedRecord.visitDate || selectedRecord.createdAt).toLocaleDateString()}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attending Physician</span>
              <p className="text-base font-bold text-white mt-0.5">{selectedRecord.doctorId?.fullName}</p>
              <p className="text-xs text-cyan-400">{selectedRecord.doctorId?.specialization}</p>
            </div>

            {selectedRecord.chiefComplaint && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chief Complaint</span>
                <p className="text-sm text-slate-200 mt-1">{selectedRecord.chiefComplaint}</p>
              </div>
            )}

            {selectedRecord.diagnosis && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                <p className="text-base font-semibold text-cyan-300 mt-1">{selectedRecord.diagnosis}</p>
              </div>
            )}

            {selectedRecord.clinicalNotes && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Notes</span>
                <p className="text-sm text-slate-200 mt-1 whitespace-pre-line leading-relaxed">{selectedRecord.clinicalNotes}</p>
              </div>
            )}

            {selectedRecord.treatmentPlan && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Treatment Plan</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{selectedRecord.treatmentPlan}</p>
              </div>
            )}

            {selectedRecord.aiSummary && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Clinical Summary
                </span>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed whitespace-pre-line">
                  {selectedRecord.aiSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientRecordsPage;
