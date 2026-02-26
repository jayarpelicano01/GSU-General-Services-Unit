"use client";

import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "primary",
  onConfirm,
  onCancel,
  onClose
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Dialog Box */}
      <div 
        className={`
          relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 
          p-6 overflow-hidden custom-confirm-bounce
        `}
      >
        {/* X Button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
        >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
          <div className="flex flex-col items-center text-center">
          {/* Icon Section */}
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center mb-4
            ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}
          `}>
            {isDanger ? (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white rounded-xl shadow-lg transition-all active:scale-95
              ${isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-confirm-bounce {
          animation: confirmBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes confirmBounce {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}