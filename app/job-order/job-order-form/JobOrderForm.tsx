"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// MOCK DATA
const AVAILABLE_PERSONNEL = [
  "Alex De Guzman",
  "Benjie Cortez",
  "Charlie Magne",
  "Danilo Santos",
  "Eddie Garcia",
  "Francis Tolentino",
  "George Estregan",
  "Harry Roque",
  "Isko Moreno",
  "Jose Mari Chan"
];

interface JobRequestData {
  requestingUnit: string;
  fieldWork: string;
  specificWork: string; 
}

const JobOrderForm = () => {
  const router = useRouter();
  const [requestData, setRequestData] = useState<JobRequestData | null>(null);

  const [orderData, setOrderData] = useState({
    jobOrderNo: "JO-2026-001",
    dateIssued: new Date().toISOString().split('T')[0],
    personnel1: "", 
    personnel2: "", 
    personnel3: "", 
    specificWorkOrder: "",
    remarks: "",
  });

  useEffect(() => {
    const storedRequest = localStorage.getItem("selectedRequest");
    if (storedRequest) {
      try {
        setRequestData(JSON.parse(storedRequest));
      } catch (error) {
        console.error("Failed to parse selected request", error);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  if (!requestData) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Job Order Form</h1>
            <p className="text-sm text-slate-400 mt-1">Maintenance & Fulfillment Section</p>
          </div>
          <div className="text-right">
             <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Order No.</span>
             <span className="text-lg font-mono font-bold text-indigo-600">{orderData.jobOrderNo}</span>
          </div>
        </div>

        <form className="p-8 space-y-8">
          
          {/* SECTION 1: REQUEST REFERENCE */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Request Reference
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requesting Unit</label>
                    <div className="text-sm font-medium text-slate-700">{requestData.requestingUnit || "N/A"}</div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Work Type</label>
                    <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold inline-block border border-indigo-100">
                        {requestData.fieldWork || "General"}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Original Description</label>
                    <div className="text-sm text-slate-600 italic bg-white p-3 rounded border border-slate-200">
                        "{requestData.specificWork}"
                    </div>
                </div>
            </div>
          </div>

          {/* SECTION 2: JOB EXECUTION DETAILS */}
          <div className="space-y-6">
            
            {/* 2. UPDATED UI: Stacked Vertical Personnel List */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Assigned Personnel
                </label>
                
                {/* Changed Grid to Space-y (Stack) */}
                <div className="space-y-4">
                    
                    {/* Row 1 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel1"
                                value={orderData.personnel1}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Select Personnel 1...</option>
                                {AVAILABLE_PERSONNEL.map(person => (
                                    <option key={person} value={person}>{person}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        {/* Placeholder for future status column */}
                    </div>

                    {/* Row 2 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel2"
                                value={orderData.personnel2}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select Personnel 2...</option>
                                {AVAILABLE_PERSONNEL.map(person => (
                                    <option key={person} value={person}>{person}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel3"
                                value={orderData.personnel3}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select Personnel 3...</option>
                                {AVAILABLE_PERSONNEL.map(person => (
                                    <option key={person} value={person}>{person}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-6">
                <div>
                    <label htmlFor="specificWorkOrder" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Specific Work to be Done <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        id="specificWorkOrder"
                        name="specificWorkOrder"
                        value={orderData.specificWorkOrder}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Detailed instructions for the personnel..."
                        required
                    />
                </div>

                <div>
                    <label htmlFor="remarks" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Remarks
                    </label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={orderData.remarks}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Any additional notes or constraints..."
                    />
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <button
                type="button"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors flex items-center gap-2"
            >
                ← Back to Request List
            </button>

            <div className="flex gap-3">
                <button
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                Print Preview
                </button>
                <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                Process Order
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobOrderForm;