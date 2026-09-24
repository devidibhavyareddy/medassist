import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { labApi } from '../../api/labApi';
import { followUpApi } from '../../api/followUpApi';
import { useToast } from '../../context/ToastContext';
import {
  User,
  HeartPulse,
  Pill,
  TestTubes,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Activity,
  FileText,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

const DoctorConsultationPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Clinical Consultation State
  const [clinicalData, setClinicalData] = useState({
    chiefComplaint: '',
    symptoms: '',
    examinationFindings: '',
    diagnosis: '',
    clinicalNotes: '',
    treatmentPlan: '',
  });

  // Prescription Medicines State
  const [medicines, setMedicines] = useState([
    {
      medicineName: '',
      dosage: '',
      frequency: 'Once Daily',
      duration: '5 days',
      route: 'Oral',
      timing: 'After Meals',
      instructions: '',
    },
  ]);
  const [generalRxInstructions, setGeneralRxInstructions] = useState('');

  // Lab Orders State
  const [labTests, setLabTests] = useState([
    { testName: '', testCode: '', instructions: '' },
  ]);
  const [labPriority, setLabPriority] = useState('normal');
  const [labClinicalNote, setLabClinicalNote] = useState('');

  // Follow-up State
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');

  const steps = [
    { title: 'Clinical Notes & Findings', icon: HeartPulse },
    { title: 'Diagnosis & Treatment', icon: Stethoscope },
    { title: 'Prescription', icon: Pill },
    { title: 'Laboratory Diagnostics', icon: TestTubes },
    { title: 'Follow-Up & Finalize', icon: Clock },
  ];

  useEffect(() => {
    const fetchAppt = async () => {
      setLoading(true);
      try {
        const res = await appointmentApi.getAppointmentById(appointmentId);
        const appt = res.data.appointment;
        setAppointment(appt);
        if (appt.reason) {
          setClinicalData((prev) => ({ ...prev, chiefComplaint: appt.reason }));
        }
      } catch (err) {
        console.error('Failed to load consultation appointment', err);
        showToast('Could not load appointment details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) fetchAppt();
  }, [appointmentId]);

  // Dynamic Medicine handlers
  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicineName: '',
        dosage: '',
        frequency: 'Twice Daily',
        duration: '5 days',
        route: 'Oral',
        timing: 'After Meals',
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Dynamic Lab handlers
  const handleAddLabTest = () => {
    setLabTests([...labTests, { testName: '', testCode: '', instructions: '' }]);
  };

  const handleRemoveLabTest = (index) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const handleLabChange = (index, field, value) => {
    const updated = [...labTests];
    updated[index][field] = value;
    setLabTests(updated);
  };

  // Finalize and Save Consultation
  const handleFinalizeConsultation = async () => {
    if (!clinicalData.diagnosis.trim()) {
      showToast('Please record at least a tentative diagnosis', 'warning');
      setActiveStep(1);
      return;
    }

    setSaving(true);
    const patientId = appointment.patientId?._id || appointment.patientId;

    try {
      // 1. Create Medical Record
      await medicalRecordApi.createMedicalRecord({
        patientId,
        appointmentId,
        chiefComplaint: clinicalData.chiefComplaint,
        symptoms: clinicalData.symptoms ? clinicalData.symptoms.split(',').map((s) => s.trim()) : [],
        examinationFindings: clinicalData.examinationFindings,
        diagnosis: clinicalData.diagnosis,
        clinicalNotes: clinicalData.clinicalNotes,
        treatmentPlan: clinicalData.treatmentPlan,
        followUpDate: followUpDate || undefined,
      });

      // 2. Create Prescription if any medicines entered
      const validMeds = medicines.filter((m) => m.medicineName.trim());
      if (validMeds.length > 0) {
        await prescriptionApi.createPrescription({
          patientId,
          appointmentId,
          medicines: validMeds,
          generalInstructions: generalRxInstructions,
          followUpInstructions: followUpReason,
        });
      }

      // 3. Create Lab Order if any tests entered
      const validTests = labTests.filter((t) => t.testName.trim());
      if (validTests.length > 0) {
        await labApi.createLabOrder({
          patientId,
          appointmentId,
          tests: validTests,
          priority: labPriority,
          clinicalNote: labClinicalNote,
        });
      }

      // 4. Create Follow-up if date selected
      if (followUpDate) {
        await followUpApi.createFollowUp({
          patientId,
          appointmentId,
          followUpDate,
          reason: followUpReason || 'Routine clinical progress check',
        });
      }

      // 5. Update appointment status to completed
      await appointmentApi.updateAppointmentStatus(appointmentId, 'completed');

      showToast('Consultation finalized & medical record committed!', 'success');
      navigate('/doctor/dashboard');
    } catch (err) {
      console.error('Finalize error', err);
      showToast(err.response?.data?.message || 'Error finalizing consultation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Initializing physician consultation suite..." />;
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center text-slate-400">
        Appointment not found or already closed.
      </div>
    );
  }

  const patient = appointment.patientId;

  return (
    <div className="space-y-6">
      {/* Compact Medical Profile Header per Section 10 */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
            {patient?.fullName ? patient.fullName.slice(0, 2).toUpperCase() : 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {patient?.fullName || 'Assigned Patient'}
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {patient?.patientId || 'ID-TBD'}
              </span>
              <Badge status={appointment.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>DOB / Age: {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Recorded'}</span>
              <span>• Blood Group: <strong className="text-rose-400">{patient?.bloodGroup || 'N/A'}</strong></span>
              <span>• Allergies: <strong className="text-amber-300">{patient?.allergies?.join(', ') || 'None documented'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
            <span className="text-slate-400">Queue #{appointment.queueNumber || '-'}</span>
            <p className="text-cyan-300 font-bold">{appointment.startTime} - {appointment.endTime}</p>
          </div>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeStep === idx;
          const isDone = activeStep > idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : isDone
                  ? 'bg-slate-900/80 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  isCurrent
                    ? 'bg-cyan-500 text-black font-bold'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step 1: Clinical Notes & Findings */}
      {activeStep === 0 && (
        <Card className="space-y-5">
          <CardHeader
            title="Clinical History & Physical Examination"
            subtitle="Document presenting complaints and vital observations"
          />

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Chief Complaint</label>
              <input
                type="text"
                value={clinicalData.chiefComplaint}
                onChange={(e) => setClinicalData({ ...clinicalData, chiefComplaint: e.target.value })}
                placeholder="e.g. Persistent dry cough and intermittent low-grade fever for 4 days"
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reported Symptoms (comma separated)</label>
              <input
                type="text"
                value={clinicalData.symptoms}
                onChange={(e) => setClinicalData({ ...clinicalData, symptoms: e.target.value })}
                placeholder="Cough, Dyspnea, Fatigue, Headache"
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Examination Findings & Vitals</label>
              <textarea
                rows={4}
                value={clinicalData.examinationFindings}
                onChange={(e) => setClinicalData({ ...clinicalData, examinationFindings: e.target.value })}
                placeholder="BP: 120/80 mmHg, HR: 74 bpm, SpO2: 98%, Temp: 98.6 F. Bilateral chest clear to auscultation."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Detailed Clinical Assessment Notes</label>
              <textarea
                rows={3}
                value={clinicalData.clinicalNotes}
                onChange={(e) => setClinicalData({ ...clinicalData, clinicalNotes: e.target.value })}
                placeholder="Patient responds well to questions. No acute respiratory distress noted."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button onClick={() => setActiveStep(1)} variant="primary" size="md" icon={ArrowRight}>
              Proceed to Diagnosis
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Diagnosis & Treatment */}
      {activeStep === 1 && (
        <Card className="space-y-5">
          <CardHeader
            title="Diagnosis & Clinical Treatment Plan"
            subtitle="Establish ICD-standard diagnostic impression and therapeutic strategy"
          />

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Primary Diagnosis *</label>
              <input
                type="text"
                required
                value={clinicalData.diagnosis}
                onChange={(e) => setClinicalData({ ...clinicalData, diagnosis: e.target.value })}
                placeholder="e.g. Acute Viral Upper Respiratory Tract Infection"
                className="w-full rounded-xl bg-slate-900/90 border border-cyan-500/40 px-4 py-2.5 text-sm text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Treatment Plan</label>
              <textarea
                rows={4}
                value={clinicalData.treatmentPlan}
                onChange={(e) => setClinicalData({ ...clinicalData, treatmentPlan: e.target.value })}
                placeholder="Hydration therapy, symptomatic antipyretics, vocal rest, monitor peak expiratory flow."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <Button onClick={() => setActiveStep(0)} variant="secondary" size="md" icon={ArrowLeft}>
              Back
            </Button>
            <Button onClick={() => setActiveStep(2)} variant="primary" size="md" icon={ArrowRight}>
              Formulate Prescription
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Prescription */}
      {activeStep === 2 && (
        <Card className="space-y-5">
          <CardHeader
            title="Digital e-Prescription (e-Rx)"
            subtitle="Specify medicine, dosage strength, frequency, and administration instructions"
            action={
              <Button onClick={handleAddMedicine} variant="outline" size="sm" icon={Plus}>
                Add Medication
              </Button>
            }
          />

          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    Medication #{index + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol"
                      value={med.medicineName}
                      onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500 mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Frequency</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    >
                      <option value="Once Daily">Once Daily (OD)</option>
                      <option value="Twice Daily">Twice Daily (BD)</option>
                      <option value="Thrice Daily">Thrice Daily (TDS)</option>
                      <option value="Four Times Daily">Four Times Daily (QID)</option>
                      <option value="As Needed">As Needed (PRN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Route & Timing</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <select
                        value={med.route}
                        onChange={(e) => handleMedicineChange(index, 'route', e.target.value)}
                        className="rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Topical">Topical</option>
                        <option value="Sublingual">Sublingual</option>
                        <option value="Intramuscular">Intramuscular</option>
                      </select>
                      <select
                        value={med.timing}
                        onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                        className="rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="After Meals">After Meals</option>
                        <option value="Before Meals">Before Meals</option>
                        <option value="With Food">With Food</option>
                        <option value="At Bedtime">At Bedtime</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Special Instructions</label>
                    <input
                      type="text"
                      placeholder="Take with warm water, avoid dairy"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">General Patient Instructions</label>
              <textarea
                rows={2}
                value={generalRxInstructions}
                onChange={(e) => setGeneralRxInstructions(e.target.value)}
                placeholder="Complete full antibiotic cycle. Avoid strenuous exertion."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <Button onClick={() => setActiveStep(1)} variant="secondary" size="md" icon={ArrowLeft}>
              Back
            </Button>
            <Button onClick={() => setActiveStep(3)} variant="primary" size="md" icon={ArrowRight}>
              Order Lab Diagnostics
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Lab Orders */}
      {activeStep === 3 && (
        <Card className="space-y-5">
          <CardHeader
            title="Laboratory Diagnostic Orders"
            subtitle="Request lab analyses, specify clinical notes, and designate urgent priorities"
            action={
              <Button onClick={handleAddLabTest} variant="outline" size="sm" icon={Plus}>
                Add Lab Test
              </Button>
            }
          />

          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                Order Priority:
              </label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="normal"
                    checked={labPriority === 'normal'}
                    onChange={() => setLabPriority('normal')}
                  />
                  <span>Normal Routine</span>
                </label>
                <label className="flex items-center gap-1.5 text-rose-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={labPriority === 'urgent'}
                    onChange={() => setLabPriority('urgent')}
                  />
                  <span>Urgent Stat</span>
                </label>
              </div>
            </div>

            {labTests.map((t, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="text-[11px] text-slate-400">Test Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={t.testName}
                    onChange={(e) => handleLabChange(index, 'testName', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Test Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CBC-01"
                    value={t.testCode}
                    onChange={(e) => handleLabChange(index, 'testCode', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400">Special Instructions</label>
                    <input
                      type="text"
                      placeholder="Fasting sample required"
                      value={t.instructions}
                      onChange={(e) => handleLabChange(index, 'instructions', e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                    />
                  </div>
                  {labTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLabTest(index)}
                      className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Clinical Indication for Pathologist</label>
              <input
                type="text"
                value={labClinicalNote}
                onChange={(e) => setLabClinicalNote(e.target.value)}
                placeholder="Rule out bacterial superinfection or acute inflammatory markers"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <Button onClick={() => setActiveStep(2)} variant="secondary" size="md" icon={ArrowLeft}>
              Back
            </Button>
            <Button onClick={() => setActiveStep(4)} variant="primary" size="md" icon={ArrowRight}>
              Schedule Follow-up
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Follow-Up & Finalize */}
      {activeStep === 4 && (
        <Card glow className="space-y-6">
          <CardHeader
            title="Follow-Up Schedule & Final Commitment"
            subtitle="Review final encounter summary before appending to electronic health records"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Follow-up Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Follow-up Instructions / Reason</label>
              <input
                type="text"
                placeholder="Review blood count & fever resolution"
                value={followUpReason}
                onChange={(e) => setFollowUpReason(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Quick Summary Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-mono text-cyan-400 uppercase text-[11px] font-bold">Encounter Summary:</h4>
            <p className="text-slate-300">
              <strong className="text-white">Diagnosis:</strong> {clinicalData.diagnosis || 'None entered'}
            </p>
            <p className="text-slate-300">
              <strong className="text-white">Prescriptions:</strong>{' '}
              {medicines.filter((m) => m.medicineName).length} medication(s) formulated
            </p>
            <p className="text-slate-300">
              <strong className="text-white">Lab Orders:</strong>{' '}
              {labTests.filter((t) => t.testName).length} test(s) requested ({labPriority})
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button onClick={() => setActiveStep(3)} variant="secondary" size="md" icon={ArrowLeft}>
              Back
            </Button>
            <Button
              onClick={handleFinalizeConsultation}
              isLoading={saving}
              variant="ai"
              size="lg"
              icon={CheckCircle2}
            >
              Sign & Complete Consultation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DoctorConsultationPage;
