import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

const AIProcessing = ({ steps = [
  'Analyzing clinical observations...',
  'Extracting symptoms & medical findings...',
  'Synthesizing diagnostic impressions...',
  'Compiling executive clinical summary...',
] }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden relative">
      {/* Background ambient AI pulses */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/10 to-indigo-500/5 pointer-events-none" />

      {/* Futuristic Medical AI Orb */}
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-teal-400/20 blur-xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <div
          className="absolute inset-2 rounded-full border border-teal-400/30 border-b-teal-300 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '4s' }}
        />
        <div className="absolute inset-4 rounded-full bg-[#0a1426] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
          <Brain className="w-8 h-8 text-cyan-300 animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
          MedAssist Clinical Intelligence Engine
        </span>
      </div>

      {/* Step Transition */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium text-slate-200 tracking-wide"
          >
            {steps[currentStep]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-400 max-w-sm mt-3">
        Processing protected health information through backend AI pipeline.
      </p>
    </div>
  );
};

export default AIProcessing;
