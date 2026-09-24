import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedBackground
 * Premium futuristic healthcare & AI living background in Neutral Light Theme.
 * Soft ambient pastel gradients, subtle grid lines, micro data nodes, and optional ECG wave.
 * Respects prefers-reduced-motion.
 */
const AnimatedBackground = ({ showEcg = false, density = 'normal' }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Generate deterministic particles
  const particles = useMemo(() => {
    const count = density === 'high' ? 24 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (i * 7.1) % 100,
      y: (i * 11.3) % 100,
      size: (i % 3) + 2, // 2-4px
      duration: 18 + (i % 10) * 2, // 18s - 38s slow motion
      delay: (i % 5) * 1.5,
      opacity: 0.2 + (i % 4) * 0.08,
      color: i % 3 === 0 ? 'bg-sky-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-teal-600',
    }));
  }, [density]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-slate-50 to-slate-100/50" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50 overflow-hidden select-none">
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-blue-50/30 to-sky-50/20" />

      {/* Cybernetic grid overlay in light neutral */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft Moving Ambient Pastel Orbs */}
      <motion.div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-sky-200/35 blur-[130px]"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-blue-200/25 blur-[140px]"
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-[20%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-teal-100/40 blur-[120px]"
        animate={{
          x: [0, 35, 0],
          y: [0, -25, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Medical AI Data Points */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: '0 0 8px rgba(14, 165, 233, 0.4)',
          }}
          animate={{
            y: [`0%`, `-35%`, `0%`],
            x: [`0%`, `${p.id % 2 === 0 ? 15 : -15}%`, `0%`],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Optional Heartbeat ECG Line in light mode */}
      {showEcg && (
        <div className="absolute bottom-10 left-0 right-0 h-16 opacity-[0.08] overflow-hidden flex items-center">
          <svg
            className="w-full h-12 text-sky-600 stroke-current fill-none stroke-[1.5]"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
          >
            <path d="M0,30 L300,30 L320,10 L335,50 L350,20 L365,38 L375,30 L700,30 L720,10 L735,50 L750,20 L765,38 L775,30 L1200,30" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AnimatedBackground;
