'use client';
import { useEffect, useState, useMemo } from "react";
import AccomplishmentReport from "../components/printouts/compilations/AccomplishmentReport";
import JobRequestReport from "../components/printouts/compilations/JobRequestReport";
import { API } from "../utils/api/api";
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

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type ReportType = "job-order" | "job-request";

interface Personnel {
  id: number;
  first_name: string;
  last_name: string;
}

interface Unit {
  unit_name: string;
  unit_acronym: string;
}

interface JobRequestRef {
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
  job_request: JobRequestRef;
  personnels: Personnel[];
}

interface JobRequest {
  id: number;
  request_date?: string | Date;
  unit: Unit;
  field_work: string;
  specific_work: string;
  estimated_duration_value?: number;
  estimated_duration_unit?: string;
  status: string;
}

const AccomplishmentReportInner = () => {
  const { user } = useAuth();
  const canPrint = user?.role === "GSU_STAFF";

  const [reportType, setReportType] = useState<ReportType>("job-order");
  const [selectedField, setSelectedField] = useState("All");
  const [filterMonth, setFilterMonth] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "">(new Date().getFullYear());
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, requestsRes] = await Promise.all([
          API.get("/job-orders/completed/"),
          API.get("/job-requests"),
        ]);
        setJobOrders(ordersRes.data.data ?? []);
        setJobRequests(
          (requestsRes.data.data ?? []).filter(
            (r: JobRequest) => r.status === "Approved"
          )
        );
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    jobOrders.forEach((o) => years.add(new Date(o.date_started).getFullYear()));
    jobRequests.forEach((r) => {
      if (r.request_date) years.add(new Date(r.request_date).getFullYear());
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [jobOrders, jobRequests]);

  const matchesMonthYear = (date: string | Date | undefined) => {
    if (!date) return true;
    const dt = new Date(date);
    if (filterYear && dt.getFullYear() !== filterYear) return false;
    if (filterMonth && dt.getMonth() + 1 !== filterMonth) return false;
    return true;
  };

  const monthYearFilteredOrders = jobOrders.filter((o) =>
    matchesMonthYear(o.date_started)
  );
  const monthYearFilteredRequests = jobRequests.filter((r) =>
    matchesMonthYear(r.request_date)
  );

  const filteredOrders =
    selectedField === "All"
      ? monthYearFilteredOrders
      : monthYearFilteredOrders.filter(
          (order) => order.job_request?.field_work === selectedField
        );

  const filteredRequests =
    selectedField === "All"
      ? monthYearFilteredRequests
      : monthYearFilteredRequests.filter(
          (r) => r.field_work === selectedField
        );

  const fieldCounts = FIELD_WORK_OPTIONS.reduce((acc, field) => {
    if (field === "All") {
      acc[field] =
        reportType === "job-order"
          ? monthYearFilteredOrders.length
          : monthYearFilteredRequests.length;
    } else if (reportType === "job-order") {
      acc[field] = monthYearFilteredOrders.filter(
        (o) => o.job_request?.field_work === field
      ).length;
    } else {
      acc[field] = monthYearFilteredRequests.filter(
        (r) => r.field_work === field
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeDataCount =
    reportType === "job-order" ? filteredOrders.length : filteredRequests.length;

  return (
    <div className="space-y-4 print:space-y-0">
      {/* Filter toolbar */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end justify-between gap-3 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-end gap-4">
          {/* Report type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-slate-500">
              Report Type
            </label>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              {(
                [
                  { value: "job-order", label: "Job Order" },
                  { value: "job-request", label: "Job Request" },
                ] as { value: ReportType; label: string }[]
              ).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    reportType === type.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field of work */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-slate-500">
              Field of Work
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
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

          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-slate-500">
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) =>
                setFilterMonth(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-slate-500">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) =>
                setFilterYear(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium pb-2 dark:text-slate-500">
          {reportType === "job-order"
            ? `${activeDataCount} completed job order(s)`
            : `${activeDataCount} job request(s)`}
        </div>
      </div>

      {/* Report Content */}
      <div className="overflow-x-auto pb-20 print:overflow-visible print:p-0">
        {loading ? (
          <div className="p-8 animate-pulse space-y-6 bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="h-8 w-1/3 bg-slate-200 rounded dark:bg-slate-800" />
            <div className="h-64 bg-slate-200 rounded-xl dark:bg-slate-800" />
          </div>
        ) : activeDataCount === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-700 font-bold text-sm dark:text-slate-200">
              No {reportType === "job-order" ? "job orders" : "job requests"} found
            </p>
            <p className="text-slate-400 text-xs mt-1 dark:text-slate-500">
              Try adjusting the field of work, month, or year filters.
            </p>
          </div>
        ) : reportType === "job-order" ? (
          <AccomplishmentReport
            selectedField={selectedField}
            JobOrders={filteredOrders}
            month={filterMonth}
            year={filterYear}
          />
        ) : (
          <JobRequestReport
            selectedField={selectedField}
            JobRequests={filteredRequests}
            month={filterMonth}
            year={filterYear}
          />
        )}
      </div>

      {/* Floating Print Button */}
      {canPrint && (
        <button
          onClick={() => window.print()}
          className="no-print fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 text-sm font-bold transition-all dark:shadow-none"
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

const AccomplishmentReportPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <AccomplishmentReportInner />
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default AccomplishmentReportPage;