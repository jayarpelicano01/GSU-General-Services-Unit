"use client";

import React, { useEffect } from "react";

type AlertType = "success" | "info" | "warning" | "error";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoClose?: number; 
}

export default function Alert({ type, message, onClose, autoClose = 1500 }: AlertProps) {
  
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const styles = {
    success: {
      bg: "bg-indigo-50/95 border-indigo-200 shadow-indigo-100",
      text: "text-indigo-900",
      accent: "bg-indigo-500",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: "bg-rose-50/95 border-rose-200 shadow-rose-100",
      text: "text-rose-900",
      accent: "bg-rose-500",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: { bg: "bg-blue-50/90 border-blue-200 shadow-blue-100", text: "text-blue-900", accent: "bg-blue-500", icon: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    warning: { bg: "bg-amber-50/90 border-amber-200 shadow-amber-100", text: "text-amber-900", accent: "bg-amber-500", icon: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>) },
  };

  const s = styles[type];

  return (
    <div 
      className={`
        relative overflow-hidden flex items-center gap-4 p-4 pr-12 border rounded-2xl 
        backdrop-blur-md shadow-xl custom-slide-in
        ${s.bg} ${s.text}
      `}
    >
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm ${s.accent} text-white`}>
        {s.icon}
      </div>

      <div className="flex-1">
        <p className="text-[13px] font-bold leading-tight">
          {type === 'success' ? 'Success' : type.toUpperCase()}
        </p>
        <p className="text-[12px] font-medium opacity-80 mt-0.5">
          {message}
        </p>
      </div>

      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
        <div 
          className={`h-full ${s.accent}`}
          style={{ animation: `shrinkWidth ${autoClose}ms linear forwards` }}
        />
      </div>

      <style jsx>{`
        .custom-slide-in {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}