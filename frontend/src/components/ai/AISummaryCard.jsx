import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Edit3, Check } from 'lucide-react';
import Button from '../ui/Button';

const AISummaryCard = ({
  summary,
  isApproved = false,
  onApprove,
  isApproving = false,
  editable = true,
}) => {
  const [editedText, setEditedText] = useState(summary || '');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative rounded-2xl glass-panel border border-cyan-500/30 p-6 overflow-hidden shadow-2xl">
      {/* Subtle glowing ambient background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              AI Clinical Summary
              {isApproved ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Approved by Doctor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" /> Doctor Review Required
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Automated synthesis of documented findings</p>
          </div>
        </div>

        {editable && !isApproved && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Summary'}
          </button>
        )}
      </div>

      {/* Summary Content Body */}
      <div className="my-4">
        {isEditing ? (
          <textarea
            rows={6}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/40 p-4 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed font-sans"
            placeholder="Review and modify clinical summary..."
          />
        ) : (
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            {editedText || summary || 'No summary generated yet.'}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isApproved && onApprove && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-4 border-t border-slate-800">
          <p className="text-xs text-amber-300/80 flex items-center gap-1.5 max-w-md">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            Verify accuracy before signing and appending to the permanent health record.
          </p>
          <Button
            onClick={() => onApprove(editedText)}
            isLoading={isApproving}
            variant="ai"
            size="sm"
            icon={Check}
          >
            Approve Summary
          </Button>
        </div>
      )}

      {/* Strict Medical AI Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
        Disclaimer: MedAssist AI assists the attending physician by summarizing provided clinical
        information. It does not independently diagnose, prescribe, or replace professional medical judgment.
      </div>
    </div>
  );
};

export default AISummaryCard;
