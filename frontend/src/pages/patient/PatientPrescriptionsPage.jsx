import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../api/prescriptionApi';
import { aiApi } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import {
  Pill,
  Sparkles,
  ShieldAlert,
  Calendar,
  Clock,
  User,
  AlertCircle,
  FileText,
  Info,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [explainingId, setExplainingId] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionApi.getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || res.data || []);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
      showToast('Could not load your prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleExplainWithAI = async (rx) => {
    setSelectedRx(rx);
    setExplainingId(rx._id);
    try {
      const res = await aiApi.getPrescriptionExplanation(rx._id);
      setAiExplanation(res.data.explanation);
      setExplanationModalOpen(true);
      showToast('AI explanation generated successfully!', 'success');
    } catch (err) {
      console.error('AI explanation failed', err);
      showToast(err.response?.data?.message || 'Failed to explain prescription with AI', 'error');
    } finally {
      setExplainingId(null);
    }
  };

  if (loading) {
    return <Loading text="Retrieving digital prescriptions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            My Prescriptions
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              e-Rx Portal
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access active pharmacological regimens and generate AI-guided educational medication summaries.
          </p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Issued"
          description="You do not have any active or past prescriptions on file yet."
        />
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <Card key={rx._id} glow={rx.status === 'active'}>
              {/* Prescription Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Prescribed by {rx.doctorId?.fullName || 'Physician'}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
                      {rx.doctorId?.specialization && <span>• {rx.doctorId.specialization}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={rx.status} />
                  <Button
                    onClick={() => handleExplainWithAI(rx)}
                    isLoading={explainingId === rx._id}
                    variant="ai"
                    size="sm"
                    icon={Sparkles}
                  >
                    Explain with AI
                  </Button>
                </div>
              </div>

              {/* Medicines Cards Grid */}
              <div className="my-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Medications & Dosing Instructions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {rx.medicines?.map((med, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-sm text-cyan-300 tracking-tight">
                          {med.medicineName}
                        </span>
                        <span className="text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                          {med.dosage}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300 font-mono">
                        <div>
                          <span className="text-slate-500">Frequency: </span>
                          {med.frequency}
                        </div>
                        <div>
                          <span className="text-slate-500">Duration: </span>
                          {med.duration}
                        </div>
                        {med.route && (
                          <div>
                            <span className="text-slate-500">Route: </span>
                            {med.route}
                          </div>
                        )}
                        {med.timing && (
                          <div>
                            <span className="text-slate-500">Timing: </span>
                            {med.timing}
                          </div>
                        )}
                      </div>

                      {med.instructions && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 italic">
                          "{med.instructions}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Directions */}
              {(rx.generalInstructions || rx.followUpInstructions) && (
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {rx.generalInstructions && (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="font-semibold text-slate-400 block mb-1">General Instructions</span>
                      <p className="text-slate-200">{rx.generalInstructions}</p>
                    </div>
                  )}
                  {rx.followUpInstructions && (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="font-semibold text-slate-400 block mb-1">Follow-up Advice</span>
                      <p className="text-slate-200">{rx.followUpInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* AI Explanation Modal */}
      <Modal
        isOpen={explanationModalOpen}
        onClose={() => setExplanationModalOpen(false)}
        title="MedAssist AI Prescription Guide"
        subtitle="Plain-language educational synthesis of prescribed medicines"
      >
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 leading-relaxed text-sm text-slate-200 whitespace-pre-line">
            {aiExplanation}
          </div>

          {/* Mandatory AI Medical Disclaimer per prompt requirement 17 */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Important Notice:</strong> This AI explanation is for educational purposes only.
              Follow your doctor's prescription and contact your doctor if you have questions.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setExplanationModalOpen(false)} variant="primary" size="sm">
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientPrescriptionsPage;
