import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Brain,
  Stethoscope,
  User,
  FlaskConical,
  Pill,
  Receipt,
  Clock,
  ArrowRight,
  Lock,
  FileCheck2,
  HeartPulse,
} from 'lucide-react';
import AnimatedBackground from '../components/background/AnimatedBackground';
import Button from '../components/ui/Button';

const Landing = () => {
  const nodes = [
    { name: 'Patient', icon: User, color: 'text-blue-400', bg: 'bg-blue-950/70 border-blue-500/40', x: 20, y: 30 },
    { name: 'Doctor', icon: Stethoscope, color: 'text-cyan-400', bg: 'bg-cyan-950/70 border-cyan-500/40', x: 75, y: 20 },
    { name: 'AI Core', icon: Brain, color: 'text-teal-300', bg: 'bg-teal-950/70 border-teal-400/50', x: 50, y: 50, isCenter: true },
    { name: 'Laboratory', icon: FlaskConical, color: 'text-indigo-400', bg: 'bg-indigo-950/70 border-indigo-500/40', x: 80, y: 75 },
    { name: 'Prescription', icon: Pill, color: 'text-purple-400', bg: 'bg-purple-950/70 border-purple-500/40', x: 25, y: 75 },
    { name: 'Billing', icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-500/40', x: 50, y: 90 },
  ];

  const journeySteps = [
    { title: 'Registration', desc: 'Secure patient record creation', icon: User },
    { title: 'Appointment', desc: 'Smart queue scheduling', icon: Activity },
    { title: 'Consultation', desc: 'Physician diagnosis session', icon: Stethoscope },
    { title: 'Medical Record', desc: 'Structured electronic findings', icon: HeartPulse },
    { title: 'Prescription', desc: 'e-Rx with dosing precision', icon: Pill },
    { title: 'Laboratory', desc: 'Diagnostic testing workflow', icon: FlaskConical },
    { title: 'Results', desc: 'Verified clinical reports', icon: FileCheck2 },
    { title: 'Billing', desc: 'Transparent invoice handling', icon: Receipt },
    { title: 'Follow-up', desc: 'Continuous monitored care', icon: Clock },
  ];

  return (
    <div className="relative min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <AnimatedBackground showEcg density="high" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#060913]/70 backdrop-blur-xl border-b border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                MEDASSIST
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  PORTAL
                </span>
              </span>
              <p className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
                CLINICAL AI PLATFORM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Next-Generation Healthcare Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              MedAssist
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
                Intelligent Healthcare. Connected Care.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              One secure platform for appointments, medical records, prescriptions, laboratory workflows,
              billing, follow-ups and AI-assisted patient care.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign In to Portal
                </Button>
              </Link>
            </div>

            {/* Quick stats pills */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80">
              <div>
                <p className="text-2xl font-bold font-mono text-cyan-400">100%</p>
                <p className="text-xs text-slate-400">Role-Isolated Security</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-teal-300">Fast</p>
                <p className="text-xs text-slate-400">AI Clinical Summaries</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-blue-400">Integrated</p>
                <p className="text-xs text-slate-400">Unified Medical Records</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual: Futuristic Interconnected Healthcare Nodes */}
          <div className="lg:col-span-5 relative w-full h-[420px] sm:h-[480px] rounded-3xl glass-panel border border-cyan-500/25 p-4 flex items-center justify-center overflow-hidden shadow-2xl">
            {/* Ambient center blur */}
            <div className="absolute w-44 h-44 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            {/* Connecting Animated SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-500/20 stroke-[1.5]">
              {/* Lines from center (50%, 50%) to nodes */}
              <line x1="50%" y1="50%" x2="20%" y2="30%" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50%" y1="50%" x2="75%" y2="20%" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50%" y1="50%" x2="25%" y2="75%" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50%" y1="50%" x2="50%" y2="90%" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="20%" y1="30%" x2="75%" y2="20%" strokeDasharray="2 4" opacity="0.3" />
              <line x1="25%" y1="75%" x2="80%" y2="75%" strokeDasharray="2 4" opacity="0.3" />
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.name}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    y: ['-50%', '-54%', '-50%'],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border shadow-xl backdrop-blur-xl ${
                    node.bg
                  } ${node.isCenter ? 'scale-115 ring-2 ring-teal-400/40 shadow-teal-500/20' : ''}`}
                >
                  <div className={`p-2 rounded-xl bg-slate-900/80 ${node.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono tracking-wider font-semibold text-slate-200">
                    {node.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1: Intelligent Care */}
      <section className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              AI-Assisted Medicine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Intelligent Care
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Empowering clinical decisions and patient literacy without compromising safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Clinical Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Automatically synthesizes chief complaints, exam observations, and diagnostics into an
                executive summary with a mandatory physician review gate.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Patient-Friendly Explanations</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Transforms complex pharmaceutical schedules into plain-language educational instructions
                explaining why each medicine was prescribed and how to take it safely.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Complete Patient Timeline</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A chronological, interconnected journey of all consultations, lab tests, prescriptions,
                invoices, and follow-ups in a living visual record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Complete Clinic Operations */}
      <section className="py-20 px-6 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Comprehensive Operations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              End-to-End Clinic Management
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Integrated modules keeping reception, physicians, lab specialists, and patients in sync.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Appointments', icon: Activity, desc: 'Queue & scheduling' },
              { label: 'Medical Records', icon: HeartPulse, desc: 'Structured EHR' },
              { label: 'Prescriptions', icon: Pill, desc: 'Digital e-Prescriptions' },
              { label: 'Laboratory', icon: FlaskConical, desc: 'Sample tracking & results' },
              { label: 'Billing', icon: Receipt, desc: 'Automated invoices' },
              { label: 'Follow-ups', icon: Clock, desc: 'Continuous care reminders' },
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center text-center space-y-2 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-slate-900 text-cyan-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{mod.label}</h4>
                  <p className="text-xs text-slate-400">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Secure by Design */}
      <section className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Enterprise Defense
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Secure by Design
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Engineered with strict healthcare data confidentiality principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'JWT Authentication',
                desc: 'Cryptographically signed session tokens with secure expiration and safe header forwarding.',
                icon: Lock,
              },
              {
                title: 'Role-Based Access Control',
                desc: 'Strict server and client authorization enforcing permissions for Admin, Doctor, Receptionist, Lab Tech, and Patient.',
                icon: ShieldCheck,
              },
              {
                title: 'Immutable Audit Logs',
                desc: 'Comprehensive timestamped trails of logins, record modifications, AI generations, and document uploads.',
                icon: FileCheck2,
              },
              {
                title: 'Private Medical Documents',
                desc: 'Uploads are never exposed via public static directories; documents require authenticated API validation.',
                icon: Lock,
              },
              {
                title: 'Backend-Only AI API Keys',
                desc: 'AI provider secrets and keys never leave backend memory or reach the browser runtime.',
                icon: Brain,
              },
              {
                title: 'Defensive Input Sanitization',
                desc: 'Security headers, rate-limiting, and validation middleware preventing data injection.',
                icon: ShieldCheck,
              },
            ].map((sec, i) => {
              const Icon = sec.icon;
              return (
                <div key={i} className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">{sec.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Patient Journey Animated Flow */}
      <section className="py-20 px-6 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Clinical Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The Connected Patient Journey
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              From arrival to ongoing health monitoring, every stage is seamlessly connected.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-4">
              {journeySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-4 rounded-2xl glass-panel border border-slate-800/90 text-center flex flex-col items-center justify-between relative group hover:border-cyan-500/40 transition-colors"
                  >
                    <span className="text-[10px] font-mono text-cyan-400 font-bold mb-2">
                      0{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{step.title}</h5>
                      <p className="text-[10px] text-slate-400 mt-1">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-cyan-500/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Experience Intelligent Care?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Access your appointments, medical records, and diagnostic lab workflows in one secure,
            intuitive healthcare platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Create Patient Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Staff & Physician Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800/80 bg-[#04060c] text-center text-xs text-slate-400">
        <p>© 2026 MedAssist Healthcare Systems. Intelligent Healthcare. Connected Care.</p>
      </footer>
    </div>
  );
};

export default Landing;
