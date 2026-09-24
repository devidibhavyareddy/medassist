import React, { useState, useEffect } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { aiApi } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  FolderHeart,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AIProcessing from '../../components/ai/AIProcessing';
import AISummaryCard from '../../components/ai/AISummaryCard';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const DoctorAIPage = () => {
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { showToast } = useToast();

  const fetchDoctorRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await medicalRecordApi.getDoctorMedicalRecords();
      const list = res.data.records || res.data || [];
      setRecords(list);
      if (list.length > 0) {
        handleSelectRecord(list[0]);
      }
    } catch (err) {
      console.error('Failed to load doctor records', err);
      showToast('Could not load clinical records', 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchDoctorRecords();
  }, []);

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setGeneratedSummary(record.aiSummary || '');
    setIsApproved(record.aiSummaryReviewed || false);
    setIsProcessing(false);
  };

  const handleGenerateSummary = async () => {
    if (!selectedRecord) return;
    setIsProcessing(true);
    try {
      const res = await aiApi.generateClinicalSummary(selectedRecord._id);
      setGeneratedSummary(res.data.aiSummary);
      setIsApproved(false);
      showToast('AI clinical summary synthesized! Please review.', 'success');
    } catch (err) {
      console.error('AI summary error', err);
      showToast(err.response?.data?.message || 'Failed to generate AI summary', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveSummary = async (reviewedSummary) => {
    if (!selectedRecord) return;
    setIsApproving(true);
    try {
      await aiApi.approveClinicalSummary(selectedRecord._id, reviewedSummary);
      setIsApproved(true);
      setGeneratedSummary(reviewedSummary);
      showToast('Summary approved and appended to patient health record!', 'success');
      // Update local record status
      setRecords((prev) =>
        prev.map((r) =>
          r._id === selectedRecord._id
            ? { ...r, aiSummary: reviewedSummary, aiSummaryReviewed: true }
            : r
        )
      );
    } catch (err) {
      console.error('Approve error', err);
      showToast(err.response?.data?.message || 'Failed to approve AI summary', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  if (loadingRecords) {
    return <Loading text="Loading clinical record archives..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Clinical Summary Studio
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  Physician Supervised
                </span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Automated synthesis of documented findings into high-fidelity clinical summaries.
                Requires mandatory physician review prior to permanent electronic health record commitment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title="No Medical Records Available"
          description="Create a medical record during patient consultation first to synthesize AI summaries."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Selectable Medical Records List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Patient Encounters ({records.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {records.map((rec) => {
                const isSelected = selectedRecord?._id === rec._id;
                return (
                  <div
                    key={rec._id}
                    onClick={() => handleSelectRecord(rec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {rec.patientId?.fullName || 'Patient'}
                      </h4>
                      <time className="text-[10px] font-mono text-cyan-400 shrink-0">
                        {new Date(rec.visitDate || rec.createdAt).toLocaleDateString()}
                      </time>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1">
                      Dx: {rec.diagnosis || 'Clinical visit'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-500 font-mono">
                        ID: {rec.patientId?.patientId || '-'}
                      </span>
                      {rec.aiSummaryReviewed ? (
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : rec.aiSummary ? (
                        <span className="text-amber-300 font-mono">Review Pending</span>
                      ) : (
                        <span className="text-slate-500 font-mono">Not Generated</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Processing & Review Canvas */}
          <div className="lg:col-span-8 space-y-6">
            {selectedRecord && (
              <>
                {/* Clinical Notes Context Card */}
                <Card>
                  <CardHeader
                    title={`Encounter Context: ${selectedRecord.patientId?.fullName || 'Patient'}`}
                    subtitle={`Encounter ID: ${selectedRecord._id}`}
                    action={
                      <Button
                        onClick={handleGenerateSummary}
                        isLoading={isProcessing}
                        variant="ai"
                        size="sm"
                        icon={Sparkles}
                      >
                        {generatedSummary ? 'Regenerate Summary' : 'Generate AI Summary'}
                      </Button>
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 font-mono block">Chief Complaint:</span>
                      <p className="text-slate-200 mt-0.5">{selectedRecord.chiefComplaint || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono block">Diagnosis:</span>
                      <p className="text-cyan-300 font-semibold mt-0.5">{selectedRecord.diagnosis || 'None recorded'}</p>
                    </div>
                    {selectedRecord.examinationFindings && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-mono block">Examination Findings:</span>
                        <p className="text-slate-300 mt-0.5">{selectedRecord.examinationFindings}</p>
                      </div>
                    )}
                    {selectedRecord.clinicalNotes && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-mono block">Clinical Notes:</span>
                        <p className="text-slate-300 mt-0.5">{selectedRecord.clinicalNotes}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* AI Processing State or Results */}
                {isProcessing ? (
                  <AIProcessing
                    steps={[
                      'Analyzing clinical notes & chief complaints...',
                      'Categorizing vitals & examination observations...',
                      'Evaluating therapeutic intervention protocols...',
                      'Synthesizing physician summary draft...',
                    ]}
                  />
                ) : generatedSummary ? (
                  <AISummaryCard
                    summary={generatedSummary}
                    isApproved={isApproved}
                    onApprove={handleApproveSummary}
                    isApproving={isApproving}
                    editable={true}
                  />
                ) : (
                  <EmptyState
                    icon={Brain}
                    title="No AI Summary Generated"
                    description="Click 'Generate AI Summary' above to synthesize this encounter's documented findings into a structured summary."
                    actionLabel="Generate AI Summary"
                    onAction={handleGenerateSummary}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAIPage;
