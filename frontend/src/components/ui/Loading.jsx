import React from 'react';

export const Loading = ({ text = 'Loading MedAssist data...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12">
        {/* Outer glowing medical ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        {/* Inner reverse spinner */}
        <div
          className="absolute inset-2 rounded-full border-2 border-teal-200 border-b-teal-600 animate-spin"
          style={{ animationDirection: 'reverse' }}
        />
        {/* Center node */}
        <div className="absolute inset-4 rounded-full bg-blue-600 animate-pulse shadow-sm shadow-blue-500/50" />
      </div>
      {text && (
        <p className="mt-4 text-xs font-medium tracking-wide text-slate-600 uppercase">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
