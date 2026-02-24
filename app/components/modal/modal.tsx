"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string; // Added subtitle for better context
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl"; // Flexible sizing
}

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "md" }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Max width mapping
  const maxWidthClass = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    // Backdrop: Using your specific slate/40 and blur
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      {/* Modal Box: Refined rounded corners and shadow */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header: Matching your form/table headers */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
               <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content Area: Consistent padding with your sections */}
        <div className="p-6 text-slate-600">
          {children}
        </div>
        
        {/* Footer: Added a standard background for action buttons if needed */}
        {/* If your children don't include a footer, you can remove this padding/bg wrapper */}
      </div>
    </div>
  );
}