"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import InspectionReport from "@/app/components/printouts/inspection/InspectionReport";
import Link from "next/link";

const InspectionPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <div className="space-y-4 print:space-y-0">
          {/* Breadcrumb */}
          <nav className="no-print flex flex-wrap items-center gap-2 text-sm">
            <Link href="/job-request-list" className="text-slate-400 hover:text-indigo-600 font-medium transition-colors">
              Job Requests
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold">Print Inspection Report</span>
          </nav>

          {/* Printable report */}
          <div className="print-area bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-200 overflow-x-auto print:border-0 print:shadow-none print:overflow-visible">
            <InspectionReport />
          </div>

          {/* Floating print button */}
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

          <style jsx global>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; margin: 0 !important; }
              main, #main-content { margin-left: 0 !important; padding: 0 !important; }
              .print-area { border: none !important; box-shadow: none !important; overflow: visible !important; }
            }
          `}</style>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default InspectionPage;