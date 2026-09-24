import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Pill,
  TestTubes,
  FileCheck,
  Receipt,
  Clock,
  ChevronRight,
  User,
  HeartPulse,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

const PatientTimeline = ({ timeline = [], patient = null }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getEventConfig = (type) => {
    switch (type) {
      case 'appointment':
        return {
          label: 'Clinical Consultation',
          icon: Calendar,
          color: 'text-blue-400',
          bg: 'bg-blue-950/70 border-blue-500/40',
          glow: 'shadow-blue-500/20',
        };
      case 'medicalRecord':
        return {
          label: 'Medical Assessment & Diagnosis',
          icon: HeartPulse,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/70 border-emerald-500/40',
          glow: 'shadow-emerald-500/20',
        };
      case 'prescription':
        return {
          label: 'Prescription Issued',
          icon: Pill,
          color: 'text-purple-400',
          bg: 'bg-purple-950/70 border-purple-500/40',
          glow: 'shadow-purple-500/20',
        };
      case 'labOrder':
        return {
          label: 'Laboratory Order',
          icon: TestTubes,
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/70 border-cyan-500/40',
          glow: 'shadow-cyan-500/20',
        };
      case 'labResult':
        return {
          label: 'Diagnostic Lab Results',
          icon: FileCheck,
          color: 'text-teal-400',
          bg: 'bg-teal-950/70 border-teal-500/40',
          glow: 'shadow-teal-500/20',
        };
      case 'invoice':
        return {
          label: 'Billing & Invoice',
          icon: Receipt,
          color: 'text-amber-400',
          bg: 'bg-amber-950/70 border-amber-500/40',
          glow: 'shadow-amber-500/20',
        };
      case 'followUp':
        return {
          label: 'Scheduled Follow-Up',
          icon: Clock,
          color: 'text-rose-400',
          bg: 'bg-rose-950/70 border-rose-500/40',
          glow: 'shadow-rose-500/20',
        };
      default:
        return {
          label: 'Clinical Event',
          icon: FileText,
          color: 'text-slate-400',
          bg: 'bg-slate-900 border-slate-700',
          glow: 'shadow-slate-500/10',
        };
    }
  };

  const renderEventDetails = (event) => {
    if (!event) return null;
    const { type, data } = event;

    switch (type) {
      case 'appointment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Doctor</span>
                <p className="font-semibold text-white">{data.doctorId?.fullName || 'Assigned Physician'}</p>
                <p className="text-xs text-cyan-400">{data.doctorId?.specialization}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Status</span>
                <div className="mt-1"><Badge status={data.status} /></div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Schedule</span>
              <p className="text-sm text-slate-200">
                {new Date(data.date).toLocaleDateString()} at {data.startTime} - {data.endTime}
              </p>
              {data.queueNumber && (
                <p className="text-xs text-slate-400 font-mono mt-1">Queue Number: #{data.queueNumber}</p>
              )}
            </div>
            {data.reason && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Reason for Visit</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.reason}</p>
              </div>
            )}
          </div>
        );

      case 'medicalRecord':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Attending Doctor</span>
              <p className="font-semibold text-white">{data.doctorId?.fullName}</p>
            </div>
            {data.chiefComplaint && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Chief Complaint</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.chiefComplaint}</p>
              </div>
            )}
            {data.diagnosis && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Diagnosis</span>
                <p className="text-sm font-medium text-cyan-300 mt-0.5">{data.diagnosis}</p>
              </div>
            )}
            {data.clinicalNotes && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Clinical Notes</span>
                <p className="text-sm text-slate-200 whitespace-pre-line mt-0.5">{data.clinicalNotes}</p>
              </div>
            )}
            {data.treatmentPlan && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Treatment Plan</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.treatmentPlan}</p>
              </div>
            )}
            {data.aiSummary && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold">AI Clinical Summary</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{data.aiSummary}</p>
              </div>
            )}
          </div>
        );

      case 'prescription':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400">Prescribed By</span>
                <p className="font-semibold text-white">{data.doctorId?.fullName}</p>
              </div>
              <Badge status={data.status} />
            </div>
            <div>
              <span className="text-xs text-slate-400 mb-2 block font-semibold uppercase tracking-wider">
                Medications
              </span>
              <div className="space-y-2">
                {data.medicines?.map((med, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-cyan-300">{med.medicineName}</p>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-400 font-mono">
                      <span>Freq: {med.frequency}</span>
                      <span>Duration: {med.duration}</span>
                      {med.route && <span>Route: {med.route}</span>}
                      {med.timing && <span>Timing: {med.timing}</span>}
                    </div>
                    {med.instructions && (
                      <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/40 p-2 rounded">
                        Note: {med.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {data.generalInstructions && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">General Instructions</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.generalInstructions}</p>
              </div>
            )}
          </div>
        );

      case 'labOrder':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Order ID</span>
                <p className="font-mono text-sm text-cyan-400 font-bold">{data.orderId}</p>
              </div>
              <div className="flex gap-2">
                <Badge status={data.priority} />
                <Badge status={data.status} />
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 mb-2 block font-semibold uppercase tracking-wider">
                Requested Tests
              </span>
              <div className="space-y-2">
                {data.tests?.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{t.testName}</p>
                      {t.instructions && <p className="text-xs text-slate-400 mt-0.5">{t.instructions}</p>}
                    </div>
                    {t.testCode && <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{t.testCode}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'labResult':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Verification</span>
              <Badge status={data.verificationStatus} />
            </div>
            <div className="space-y-2">
              {data.results?.map((res, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200 text-sm">{res.testName}</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">
                      {res.value} <span className="text-xs text-slate-400 font-normal">{res.unit}</span>
                    </span>
                  </div>
                  {res.referenceRange && (
                    <p className="text-xs text-slate-400 font-mono mt-1">Ref Range: {res.referenceRange}</p>
                  )}
                  {res.observation && (
                    <p className="text-xs text-slate-300 mt-1 italic">{res.observation}</p>
                  )}
                </div>
              ))}
            </div>
            {data.technicianNotes && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Technician Remarks</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.technicianNotes}</p>
              </div>
            )}
          </div>
        );

      case 'invoice':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Invoice ID</span>
                <p className="font-mono text-sm font-bold text-cyan-400">{data.invoiceId}</p>
              </div>
              <Badge status={data.paymentStatus} />
            </div>
            <div className="space-y-1 divide-y divide-slate-800">
              {data.items?.map((item, idx) => (
                <div key={idx} className="pt-2 flex justify-between text-sm">
                  <span className="text-slate-300">{item.description} (x{item.quantity})</span>
                  <span className="font-mono text-slate-100">₹{item.total}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-right space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>₹{data.subtotal}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Discount</span>
                  <span>-₹{data.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-cyan-300">₹{data.total}</span>
              </div>
            </div>
          </div>
        );

      case 'followUp':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Attending Doctor</span>
                <p className="font-semibold text-white">{data.doctorId?.fullName}</p>
              </div>
              <Badge status={data.status} />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Follow-up Date</span>
              <p className="text-base font-semibold text-rose-300 mt-0.5">
                {new Date(data.followUpDate).toLocaleDateString()}
              </p>
            </div>
            {data.reason && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Reason</span>
                <p className="text-sm text-slate-200 mt-0.5">{data.reason}</p>
              </div>
            )}
          </div>
        );

      default:
        return <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div className="relative">
      {/* Patient Profile Header if provided */}
      {patient && (
        <div className="mb-10 p-6 rounded-2xl glass-panel border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{patient.fullName}</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {patient.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {patient.gender || 'Patient'} • Blood Group: <span className="text-rose-400 font-semibold">{patient.bloodGroup || 'N/A'}</span>
                {patient.phone ? ` • ${patient.phone}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <span>Total Encounters:</span>
            <span className="text-cyan-400 font-bold">{timeline.length}</span>
          </div>
        </div>
      )}

      {/* Timeline items container */}
      <div className="relative pl-6 sm:pl-10">
        {/* Continuous Central Glowing Vertical Line */}
        <div className="absolute left-[15px] sm:left-[23px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500 to-slate-800" />

        <div className="space-y-8">
          {timeline.map((event, idx) => {
            const config = getEventConfig(event.type);
            const Icon = config.icon;
            const eventDate = new Date(event.date);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                className="relative flex items-start gap-4 sm:gap-6 group"
              >
                {/* Glowing Node Button */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] mt-1 w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg ${config.bg} ${config.color} ${config.glow} transition-transform group-hover:scale-110 z-10`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Event Card */}
                <div
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 rounded-2xl glass-card border border-slate-800 p-5 cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono tracking-wider uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                      {config.label}
                    </span>
                    <time className="text-xs font-mono text-slate-400">
                      {eventDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between">
                    <div>
                      {event.type === 'appointment' && (
                        <p className="text-sm font-semibold text-slate-200">
                          {event.data.reason || 'Consultation'} with {event.data.doctorId?.fullName || 'Physician'}
                        </p>
                      )}
                      {event.type === 'medicalRecord' && (
                        <p className="text-sm font-semibold text-slate-200">
                          Dx: {event.data.diagnosis || 'Clinical Assessment'}
                        </p>
                      )}
                      {event.type === 'prescription' && (
                        <p className="text-sm font-semibold text-slate-200">
                          {event.data.medicines?.length || 0} medications prescribed
                        </p>
                      )}
                      {event.type === 'labOrder' && (
                        <p className="text-sm font-semibold text-slate-200">
                          Order #{event.data.orderId} • {event.data.tests?.length || 0} tests
                        </p>
                      )}
                      {event.type === 'labResult' && (
                        <p className="text-sm font-semibold text-slate-200">
                          Verified Diagnostic Results Available
                        </p>
                      )}
                      {event.type === 'invoice' && (
                        <p className="text-sm font-semibold text-slate-200">
                          Invoice #{event.data.invoiceId} • ₹{event.data.total}
                        </p>
                      )}
                      {event.type === 'followUp' && (
                        <p className="text-sm font-semibold text-slate-200">
                          Due: {new Date(event.data.followUpDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent ? getEventConfig(selectedEvent.type).label : ''}
        subtitle={
          selectedEvent
            ? new Date(selectedEvent.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''
        }
      >
        {renderEventDetails(selectedEvent)}
      </Modal>
    </div>
  );
};

export default PatientTimeline;
