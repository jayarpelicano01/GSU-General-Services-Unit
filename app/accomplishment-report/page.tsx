'use client';
import { useEffect, useState, Suspense } from "react";
import AccomplishmentReport from "../components/printouts/compilations/AccomplishmentReport";
import { API } from "../utils/api/api";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";

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

// Inner component that uses useSearchParams - must be wrapped in Suspense
const AccomplishmentReportInner = () => {
  const { user } = useAuth();
  const canPrint = user?.role === "GSU_STAFF";
  const [selectedField, setSelectedField] = useState("All");
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  useEffect(() => {
    const fetchJobOrders = async () => {
      const response = await API.get("/job-orders/completed/");
      const data = response.data.data;
      setJobOrders(data);
    };
    fetchJobOrders();
  }, []);

  const monthFilteredOrders = jobOrders.filter((order) => {
    if (month) {
      return new Date(order.date_started).toISOString().slice(0, 7) === month;
    }
    if (year) {
      return new Date(order.date_started).getFullYear().toString() === year;
    }
    return true;
  });

  const filteredOrders =
    selectedField === "All"
      ? monthFilteredOrders
      : monthFilteredOrders.filter(
          (order) => order.job_request?.field_work === selectedField
        );

  const fieldCounts = FIELD_WORK_OPTIONS.reduce((acc, field) => {
    if (field === "All") {
      acc[field] = monthFilteredOrders.length;
    } else {
      acc[field] = monthFilteredOrders.filter(
        (o) => o.job_request?.field_work === field
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Filter toolbar */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Filter by Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            >
              {FIELD_WORK_OPTIONS.map((field) => {
                const count = fieldCounts[field] ?? 0;
                return (
                  <option key={field} value={field}>
                    {field} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {month ? `Filtering by month: ${month}` : year ? `Filtering by year: ${year}` : "Showing all completed job orders"}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="overflow-x-auto pb-20">
        <AccomplishmentReport
          selectedField={selectedField}
          JobOrders={filteredOrders}
        />
      </div>

      {/* Floating Print Button */}
      {canPrint && (
        <button
          onClick={() => window.print()}
          className="no-print fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 text-sm font-bold transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print Report
        </button>
      )}
    </div>
  );
};

// Skeleton for Suspense fallback
const AccomplishmentReportSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
      <div className="h-10 w-56 animate-pulse bg-slate-200 rounded-lg" />
      <div className="h-10 w-32 animate-pulse bg-slate-200 rounded-lg" />
    </div>
    <div className="p-8 animate-pulse space-y-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="h-8 w-1/3 bg-slate-200 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const AccomplishmentReportPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <Suspense fallback={<AccomplishmentReportSkeleton />}>
          <AccomplishmentReportInner />
        </Suspense>
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default AccomplishmentReportPage;