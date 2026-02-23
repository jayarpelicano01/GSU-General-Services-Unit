'use client';
import { useState } from "react";
import AccomplishmentReport from "../components/printouts/compilations/AccomplishmentReport";

const FIELD_WORK_OPTIONS = [
  "All",
  "Carpentry/Masonry",
  "Welding", 
  "Painting",,
  "Grass Cutter",
  "Electrical",
  "Plumbing",
  "Art & Sign",
  "Refrigeration & Air-Conditioning",
  "Landscaping",
  "Utility",
];

const AccomplishmentReportPage = () => {
    const [selectedField, setSelectedField] = useState("All");

    return (
    <div className="flex">
      
      {/* Sidebar - hidden on print */}
      <div className="no-print fixed left-0 top-0 h-screen w-64 bg-slate-100 p-4 border-r border-slate-200 overflow-y-auto">
        <h2 className="font-bold text-slate-700 mb-1">Filter by Field</h2>
        <p className="text-xs text-slate-400 mb-4">Only selected field will appear in the report.</p>

        <div className="space-y-1">
          {FIELD_WORK_OPTIONS.map((field) => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedField === field
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              {field}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={() => window.print()}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Report Content - offset by sidebar width */}
      <div className="ml-64 flex-1">
        <AccomplishmentReport selectedField={selectedField} />
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .ml-64 { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default AccomplishmentReportPage;