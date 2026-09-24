import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedBackground
 * Premium futuristic healthcare & AI living background.
 * Combines subtle gradient blobs, glowing medical nodes, grid lines, and ECG paths.
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

  // Generate deterministic particles to avoid hydration mismatches
  const particles = useMemo(() => {
    const count = density === 'high' ? 24 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (i * 7.1) % 100,
      y: (i * 11.3) % 100,
      size: (i % 3) + 2, // 2-4px
      duration: 18 + (i % 10) * 2, // 18s - 38s slow motion
      delay: (i % 5) * 1.5,
      opacity: 0.15 + (i % 4) * 0.08,
      color: i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-teal-300',
    }));
  }, [density]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#060913] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1226]/50 via-[#060913] to-[#04060c]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[#060913] overflow-hidden select-none">
      {/* Deep medical gradient base */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#04060d] via-[#070d1e] to-[#040711]" />

      {/* Cybernetic grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft Moving Ambient Orbs */}
      <motion.div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-cyan-600/10 blur-[130px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[140px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 50, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-[20%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-teal-500/8 blur-[120px]"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.06, 1],
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
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
          }}
          animate={{
            y: [`0%`, `-35%`, `0%`],
            x: [`0%`, `${p.id % 2 === 0 ? 15 : -15}%`, `0%`],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Optional Subtle Heartbeat ECG Line */}
      {showEcg && (
        <div className="absolute bottom-10 left-0 right-0 h-16 opacity-[0.06] overflow-hidden flex items-center">
          <svg
            className="w-full h-12 text-cyan-400 stroke-current fill-none stroke-[1.5]"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
          >
            <path d="M0,30 L300,30 L320,10 L335,50 L350,20 L365,38 L375,30 L700,30 L720,10 L735,50 L750,20 L765,38 L775,30 L1200,30" />
          </svg>
        </div>
      )}

      {/* Vignette edge for cinematic focus */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#04060d]/80 pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;
