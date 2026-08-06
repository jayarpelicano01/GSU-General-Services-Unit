"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/app/utils/api/api";
import { useRouter } from "next/navigation";
import { InspectionResultsModal } from "@/app/components/modal/job-request-modals/InspectionResultsModal";
import { InspectionResultFormData, Personnel } from "@/app/types/JobRequest";
import { JobOrderFormData } from "@/app/types/JobOrder";
import { createJobOrder } from "@/app/utils/jobOrder";
import { useToast } from "@/app/context/ToastContext";
import { getErrorMessage } from "@/app/utils/errors";
import { Pagination } from "@/components/ui/pagination";

interface InspectionUnit {
  unit_name: string;
  unit_acronym: string;
  location?: { location_name: string } | null;
}

interface InspectionRequest {
  id: number;
  specific_work: string;
  field_work: string;
  status: string;
  assessment_results?: string | null;
  estimated_duration_value?: number | null;
  estimated_duration_unit?: string | null;
  status_of_materials?: string | null;
  unit?: InspectionUnit | null;
}

interface Inspection {
  id: number;
  inspection_date: string | Date;
  remarks: string | null;
  recommedation: string | null;
  recommendation: string | null;
  status: string;
  job_request?: InspectionRequest | null;
  personnels?: Personnel[];
}

const STATUS_TABS = ["All", "Under Review", "Completed"] as const;

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = new Date(date + (date instanceof Date ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const toDateInput = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fullName = (p: Personnel) =>
  `${p.first_name} ${p.middle_name || ""} ${p.last_name}${p.suffix ? ` ${p.suffix}` : ""}`.replace(/\s+/g, " ").trim();

const statusPill = (status: string | null) => {
  const value = status ?? "Under Review";
  const classes: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border ${classes[value] ?? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}>
      {value}
    </span>
  );
};

const InspectionsTable = () => {
  const router = useRouter();
  const { success, error } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [resultTarget, setResultTarget] = useState<Inspection | null>(null);
  const [resultForm, setResultForm] = useState<InspectionResultFormData>({
    assessment_results: '',
    estimated_duration_value: 0,
    estimated_duration_unit: 'Hours',
    status_of_materials: null,
    recommendation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const hasSetDefaultTab = React.useRef(false);

  const fetchPersonnel = async () => {
    try {
      const response = await API.get("/personnels");
      setPersonnelList(response.data.data);
    } catch (err) {
      console.error("Error fetching personnel:", err);
    }
  };

  const fetchInspections = async (isInitial = false) => {
    try {
      const response = await API.get("/inspections");
      const data: Inspection[] = response.data.data ?? [];
      setInspections(data);
      if (isInitial && !hasSetDefaultTab.current) {
        hasSetDefaultTab.current = true;
        const hasUnderReview = data.some(
          (i) => (i.status ?? "Under Review") === "Under Review"
        );
        setActiveTab(hasUnderReview ? "Under Review" : "All");
      }
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections(true);
    fetchPersonnel();
  }, []);

  const handlePrint = (insp: Inspection) => {
    localStorage.setItem("inspection-schedule", JSON.stringify({
      id: insp.id,
      request: insp.job_request,
      scheduledDate: toDateInput(insp.inspection_date),
      personnels: insp.personnels ?? [],
      recommendation: insp.recommendation ?? '',
    }));
    router.push("/inspection");
  };

  const handleOpenResults = (insp: Inspection) => {
    const jr = insp.job_request;
    setResultTarget(insp);
    setResultForm({
      assessment_results: jr?.assessment_results ?? '',
      estimated_duration_value: jr?.estimated_duration_value ?? 0,
      estimated_duration_unit: (jr?.estimated_duration_unit as 'Hours' | 'Days') ?? 'Hours',
      status_of_materials: (jr?.status_of_materials as 'Available' | 'Not Available' | null) ?? null,
      recommendation: insp.recommendation ?? '',
    });
  };

  const handleSubmitResults = async (action: 'purchase' | 'requisition') => {
    if (!resultTarget?.job_request) return;
    setIsSubmitting(true);
    try {
      const materials = resultForm.status_of_materials;
      await API.patch(`/job-requests/${resultTarget.job_request.id}`, {
        assessment_results: resultForm.assessment_results,
        estimated_duration_value: resultForm.estimated_duration_value,
        estimated_duration_unit: resultForm.estimated_duration_unit,
        status_of_materials: materials,
        status: 'Awaiting Materials',
      });
      await API.patch(`/inspections/${resultTarget.id}`, {
        status: 'Completed',
        recommedation: 'Disapproved',
        recommendation: resultForm.recommendation,
      });
      success('Inspection results submitted successfully.');
      setResultTarget(null);
      fetchInspections();
      localStorage.setItem('selectedRequestId', String(resultTarget.job_request.id));
      router.push(action === 'purchase' ? '/pr-ris/form?type=PR' : '/pr-ris/form?type=RIS');
    } catch (err) {
      console.error('Failed to submit inspection results:', err);
      error(getErrorMessage(err, 'Failed to submit inspection results. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInspectionWithJobOrder = async (jobOrderForm: JobOrderFormData) => {
    if (!resultTarget?.job_request) return;
    setIsSubmitting(true);
    try {
      const materials = resultForm.status_of_materials;
      await API.patch(`/job-requests/${resultTarget.job_request.id}`, {
        assessment_results: resultForm.assessment_results,
        estimated_duration_value: resultForm.estimated_duration_value,
        estimated_duration_unit: resultForm.estimated_duration_unit,
        status_of_materials: materials,
        status: 'Approved',
      });
      await API.patch(`/inspections/${resultTarget.id}`, {
        status: 'Completed',
        recommedation: 'Approved',
        recommendation: resultForm.recommendation,
      });
      await createJobOrder({
        request: resultTarget.job_request,
        form: jobOrderForm,
        personnelList,
      });
      success("Inspection results submitted and job order created.");
      setResultTarget(null);
      fetchInspections();
      setTimeout(() => {
        router.push("/job-order/print-job-order");
      }, 1200);
    } catch (err) {
      console.error('Failed to submit inspection results and create job order:', err);
      error(getErrorMessage(err, 'Failed to submit inspection results and create job order. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return inspections.filter((insp) => {
      const status = insp.status ?? "Under Review";
      if (activeTab !== "All" && status !== activeTab) return false;
      if (!query) return true;

      const unit = insp.job_request?.unit?.unit_name ?? "";
      const field = insp.job_request?.field_work ?? "";
      const work = insp.job_request?.specific_work ?? "";
      const inspectors = (insp.personnels ?? []).map(fullName).join(" ");
      return [unit, field, work, inspectors].join(" ").toLowerCase().includes(query);
    });
  }, [inspections, activeTab, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inspections</h1>
          <p className="text-sm text-slate-400 mt-0.5 dark:text-slate-500">Monitor all inspections and their status</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 rounded-xl p-1 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? inspections.length
                : inspections.filter((i) => (i.status ?? "Under Review") === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by unit, field of work, specific work, or inspector..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Date Inspected</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Section / Unit</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Field of Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Specific Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Inspectors</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400 animate-pulse dark:text-slate-500">Loading inspections...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No inspections found</p>
                    <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">Assigned inspections will appear here once scheduled.</p>
                  </td>
                </tr>
              ) : (
                paged.map((insp) => {
                  const unit = insp.job_request?.unit;
                  const unitName = unit ? `${unit.unit_name}${unit.unit_acronym ? ` (${unit.unit_acronym})` : ""}` : "—";
                  const inspectors = insp.personnels ?? [];
                  return (
                    <tr key={insp.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap dark:text-slate-200">{formatDate(insp.inspection_date)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{unitName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300">{insp.job_request?.field_work || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px] dark:text-slate-300">
                        <span className="line-clamp-2">{insp.job_request?.specific_work || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {inspectors.length === 0 ? (
                          <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {inspectors.map((p) => (
                              <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold dark:bg-indigo-500/15 dark:text-indigo-300">
                                {fullName(p)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">{statusPill(insp.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {insp.status !== 'Completed' && insp.job_request && (
                            <button
                              type="button"
                              onClick={() => handleOpenResults(insp)}
                              className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-all whitespace-nowrap dark:text-indigo-300 dark:hover:text-indigo-200 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25"
                            >
                              Submit Results
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePrint(insp)}
                            title="Print inspection report"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 9V2h12v7" />
                              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <InspectionResultsModal
        inspectionResultTarget={resultTarget?.job_request ?? null}
        inspectionResultForm={resultForm}
        personnelList={personnelList}
        isSubmitting={isSubmitting}
        onClose={() => setResultTarget(null)}
        onFormChange={(form) => setResultForm(form)}
        onCreatePurchaseRequest={() => handleSubmitResults('purchase')}
        onCreateRequisitionSlip={() => handleSubmitResults('requisition')}
        onSubmitInspectionWithJobOrder={handleSubmitInspectionWithJobOrder}
      />
    </div>
  );
};

export default InspectionsTable;