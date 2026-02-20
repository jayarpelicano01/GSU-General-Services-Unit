"use client";
import React, { useState } from 'react';

const Sidebar = () => {
  const [step, setStep] = useState(0); // 0 = Preview, 1 = Print, 2 = Done
  const steps = ["Preview", "Print", "Done"];

  const handlePrint = () => {
  // Move to step 1 (Print) as soon as the dialog opens
  setStep(1);

  // Define a function to handle the transition to Step 2 (Done)
  const handleAfterPrint = () => {
    setStep(2);
    
    window.removeEventListener('onafterprint', handleAfterPrint);
  };

  window.addEventListener('onafterprint', handleAfterPrint);

  // Open the print dialog
  window.print();
};

  return (
    <div className="no-print min-w-90 h-screen bg-[#f8f9ff] p-6 fixed left-0 border-r border-slate-200 flex flex-col">
      <h2 className="font-bold text-slate-800 mb-8 text-xl leading-tight">
        Print Job Request <br /> 
        <span className="text-indigo-600">& Job Order</span>
      </h2>

      {/* Functional Step Indicator */}
      <div className="flex flex-col items-start mb-auto mt-10 text-lg pl-2">
        {steps.map((label, index) => (
          <div key={label} className="w-full">
            <div className="flex items-center gap-4">
              {/* Circle Indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${index <= step 
                  ? "bg-indigo-600 border-indigo-600 shadow-sm" 
                  : "bg-white border-slate-300"}`}
              >
                {/* Checkmark for Completed Steps */}
                {index < step ? (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  // White dot for Active Step
                  index === step && <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              {/* Text Labels */}
              <div className="flex flex-col">
                <span className={`text-[13px] font-bold uppercase tracking-wider transition-colors
                  ${index <= step ? "text-indigo-600" : "text-slate-400"}`}>
                  Step {index + 1}
                </span>
                <span className={`text-sm font-semibold transition-colors
                  ${index <= step ? "text-slate-700" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`ml-2.25 w-0.5 h-10 transition-colors duration-300
                ${index < step ? "bg-indigo-600" : "bg-slate-200"}`} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mt-10">
        {step === 1 ? (
            /* Confirmation Buttons after the print dialog closes */
            <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-500 text-center font-medium mb-1">
                Did the document print successfully?
            </p>
            <div className="flex gap-2">
                <button 
                onClick={() => setStep(2)}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-[11px] font-bold uppercase"
                >
                Yes
                </button>
                <button 
                onClick={() => setStep(0)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-[11px] font-bold uppercase"
                >
                No / Retry
                </button>
            </div>
            </div>
        ) : (
            /* Standard Print Button */
            <button 
            onClick={handlePrint}
            disabled={step === 2}
            className={`w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2
                ${step === 2 
                ? "bg-emerald-500 text-white shadow-emerald-100" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"}`}
            >
            {step === 2 ? "Order Completed" : "Print Documents"}
            </button>
        )}
        
        {step !== 1 && (
            <button 
            onClick={() => window.history.back()}
            className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-[12px] font-bold uppercase hover:bg-slate-50"
            >
            Back to Dashboard
            </button>
        )}
        </div>
    </div>
  );
};

export default Sidebar;