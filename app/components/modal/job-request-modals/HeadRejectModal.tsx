"use client";

import Modal from "@/app/components/modal/modal";
import { JobRequest } from "@/app/types/JobRequest";

interface Props {
  rejectTarget: JobRequest | null;
  rejectReason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const HeadRejectModal = ({
  rejectTarget,
  rejectReason,
  onReasonChange,
  onClose,
  onConfirm,
}: Props) => (
  <Modal
    isOpen={Boolean(rejectTarget)}
    onClose={onClose}
    title="Reject Job Request"
    subtitle={`Job Request #${rejectTarget?.id} • ${rejectTarget?.unit?.unit_name}`}
    maxWidth="md"
  >
    <div className="space-y-6">

      {/* Warning Banner */}
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3">
        <div className="text-rose-500 shrink-0">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[12px] text-rose-800 leading-relaxed font-medium">
          This will reject the request as Unit Head. The request will stay on hold and the reason below is recorded in the system.
        </p>
      </div>

      {/* Reason Input */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
          Reason for Rejection <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Briefly describe why this request is being rejected..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!rejectReason.trim()}
          className="flex-2 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-[0.98]"
        >
          Confirm Rejection
        </button>
      </div>

    </div>
  </Modal>
);
