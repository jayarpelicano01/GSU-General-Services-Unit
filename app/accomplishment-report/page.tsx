'use client';
import { useEffect, useState } from "react";
import AccomplishmentReport from "../components/printouts/compilations/AccomplishmentReport";
import { API } from "../utils/api/api";
import { useSearchParams } from "next/navigation";

const FIELD_WORK_OPTIONS = [
  "All",
  "Carpentry/Masonry",
  "Welding", 
  "Painting",
  "Brush Cutter",
  "Electrical",
  "Plumbing",
  "Art & Sign",
  "Refrigeration & Air-Conditioning",
  "Landscaping",
  "Utility",
];

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
}

interface Unit {
    unit_name: string;
    unit_acronym: string;
}

interface JobRequest {
    id: number;
    unit: Unit;
    field_work: string;
}

interface JobOrder {
    id: number;
    jo_number: number;
    specific_work: string;
    date_started: string | Date;
    date_accomplished: string | Date;
    status: string;
    job_request: JobRequest; 
    personnels: Personnel[];
}

const AccomplishmentReportPage = () => {
    const [selectedField, setSelectedField] = useState("All");
    const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
    const searchParams = useSearchParams();
    const month = searchParams.get('month');
    const year = searchParams.get('year');

        useEffect(() => {
    
            const fetchJobOrders = async () => {
                const response = await API.get('/job-orders/completed/');
                const data = response.data.data;
                setJobOrders(data);
            }
    
            fetchJobOrders();
        }, [])
  

        const monthFilteredOrders = jobOrders.filter(order => {
          if (month) {
              return new Date(order.date_started).toISOString().slice(0, 7) === month;
          }
          if (year) {
              return new Date(order.date_started).getFullYear().toString() === year;
          }
          return true;
      });

        const filteredOrders = selectedField === "All"
            ? monthFilteredOrders
            : monthFilteredOrders.filter(order => order.job_request?.field_work === selectedField);

        const fieldCounts = FIELD_WORK_OPTIONS.reduce((acc, field) => {
            if (field === "All") {
                acc[field] = monthFilteredOrders.length;
            } else {
                acc[field] = monthFilteredOrders.filter(o => o.job_request?.field_work === field).length;
            }
            return acc;
        }, {} as Record<string, number>);


    return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar - hidden on print */}
      <div className="no-print fixed left-0 top-0 h-screen w-64 bg-slate-100 p-4 border-r border-slate-200 overflow-y-auto">
        <h2 className="font-bold text-slate-700 mb-1">Filter by Field</h2>
        <p className="text-xs text-slate-400 mb-4">Only selected field will appear in the report.</p>

        <div className="space-y-1">
          {FIELD_WORK_OPTIONS.map((field) => {
            const count = fieldCounts[field] ?? 0;
            const hasRecords = count > 0;

            return (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between
                  ${selectedField === field
                    ? 'bg-indigo-600 text-white'
                    : hasRecords
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-300 hover:bg-slate-200'
                  }`}
              >
                <span>{field}</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center
                  ${selectedField === field
                    ? 'bg-white/20 text-white'
                    : hasRecords
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
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
        <AccomplishmentReport selectedField={selectedField} JobOrders={filteredOrders} />
      </div>

      <style jsx global>{
        `
          @media print {
            .no-print { display: none !important; }
            .ml-64 { margin-left: 0 !important; }
          }
        `
      }</style>
    </div>
  );
}

export default AccomplishmentReportPage;