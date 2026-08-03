"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import Alert from "@/app/components/alert/Alert";

type ToastType = "success" | "info" | "warning" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  notify: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const success = useCallback((message: string) => notify(message, "success"), [notify]);
  const error = useCallback((message: string) => notify(message, "error"), [notify]);
  const info = useCallback((message: string) => notify(message, "info"), [notify]);
  const warning = useCallback((message: string) => notify(message, "warning"), [notify]);

  return (
    <ToastContext.Provider value={{ notify, success, error, info, warning }}>
      {children}

      {/* Global toast stack */}
      <div className="fixed top-6 right-6 z-[9999] w-full max-w-sm space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Alert
              type={toast.type}
              message={toast.message}
              onClose={() => dismiss(toast.id)}
              autoClose={toast.type === "error" ? 6000 : 3500}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
