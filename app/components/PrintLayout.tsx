"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  backPath: string;
}

const PrintLayout = ({ children, title, subtitle, backPath }: PrintLayoutProps) => {
  const [step, setStep] = useState(0); // 0 = Preview, 1 = Print, 2 = Done
  const steps = ["Preview Document", "Print Paper", "Finalize"];
  const router = useRouter();

  const handlePrint = () => {
    setStep(1);
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-slate-100/50">
      {/* --- REUSABLE SIDEBAR --- */}
      <aside className="no-print w-80 h-screen bg-white p-8 fixed left-0 border-r border-slate-200 flex flex-col z-20">
        <div className="mb-10">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2">Workflow</p>
          <h2 className="font-black text-slate-800 text-xl leading-tight">
            {title} <br /> 
            <span className="text-slate-400 font-medium text-base">{subtitle}</span>
          </h2>
        </div>

        {/* Stepper Logic */}
        <div className="flex flex-col mb-auto">
          {steps.map((label, index) => (
            <div key={label} className="relative">
              <div className="flex items-center gap-4 pb-10">
                <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                  ${index <= step ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}>
                  {index < step ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${index === step ? "bg-white" : "bg-slate-200"}`} />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${index <= step ? "text-indigo-600" : "text-slate-400"}`}>
                    Step 0{index + 1}
                  </span>
                  <span className={`text-sm font-bold ${index <= step ? "text-slate-700" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute left-3 top-6 w-0.5 h-full -translate-x-1/2 z-0
                  ${index < step ? "bg-indigo-600" : "bg-slate-100"}`} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {step === 1 ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[11px] text-slate-500 text-center font-bold uppercase mb-3">Printed Successfully?</p>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[11px] font-bold uppercase">Yes</button>
                <button onClick={() => setStep(0)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-[11px] font-bold uppercase">Retry</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={step === 2 ? () => router.push(backPath) : handlePrint}
            //   disabled={step === 2}
              className={`w-full py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg
                ${step === 2 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"}`}
            >
              {step === 2 ? "✓ Document Ready" : "Print Document"}
            </button>
          )}
          {/* <button onClick={() => router.push(backPath)} className="w-full text-slate-400 hover:text-slate-600 py-2 text-[11px] font-bold uppercase tracking-widest">
            ← Exit Preview
          </button> */}
        </div>
      </aside>

      {/* --- PRINTABLE AREA --- */}
      <main className="ml-80 flex-1 p-12 flex justify-center print:m-0 print:p-0 print:ml-0 overflow-y-auto">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] print:shadow-none transition-all duration-500">
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintLayout;