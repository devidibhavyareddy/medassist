import React from 'react';

export const Loading = ({ text = 'Loading MedAssist data...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-14 h-14">
        {/* Outer glowing medical ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        {/* Inner reverse spinner */}
        <div
          className="absolute inset-2.5 rounded-full border-2 border-teal-500/20 border-b-teal-400 animate-spin"
          style={{ animationDirection: 'reverse' }}
        />
        {/* Center node */}
        <div className="absolute inset-5 rounded-full bg-cyan-400/80 animate-pulse shadow-lg shadow-cyan-400/50" />
      </div>
      {text && (
        <p className="mt-4 text-xs font-mono tracking-widest text-cyan-400 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060913]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
