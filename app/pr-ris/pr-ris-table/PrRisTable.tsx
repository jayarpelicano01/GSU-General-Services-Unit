"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/app/utils/api/api";
import { useRouter } from "next/navigation";

interface PrRisUnit {
  unit_name: string;
  unit_acronym: string;
  location?: { location_name: string } | null;
}

interface PrRisJobRequest {
  id: number;
  field_work: string;
  specific_work: string;
  status: string;
  unit?: PrRisUnit | null;
}

interface PrRisItem {
  id: number;
  stock: string | null;
  unit: string | null;
  description: string;
  qty: number | null;
  remarks: string | null;
  cost: number | null;
  amount: number | null;
}

interface PrRisDocument {
  id: number;
  document_type: "PR" | "RIS";
  doc_no: string | null;
  office: string | null;
  division: string | null;
  date: string | Date;
  purpose: string | null;
  status: string;
  total: number | null;
  items: PrRisItem[];
  job_request?: PrRisJobRequest | null;
}

const STATUS_TABS = ["All", "Awaiting Materials", "Materials Received"] as const;

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const statusPill = (status: string | null) => {
  const value = status ?? "Awaiting Materials";
  const classes: Record<string, string> = {
    "Awaiting Materials": "bg-amber-50 text-amber-700 border-amber-200",
    "Materials Received": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border ${classes[value] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {value}
    </span>
  );
};

const PrRisTable = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<PrRisDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const hasSetDefaultTab = React.useRef(false);

  const fetchDocuments = async (isInitial = false) => {
    try {
      const response = await API.get("/purchase-requests");
      const data: PrRisDocument[] = response.data.data ?? [];
      setDocuments(data);
      if (isInitial && !hasSetDefaultTab.current) {
        hasSetDefaultTab.current = true;
        const hasAwaiting = data.some((d) => d.status === "Awaiting Materials");
        setActiveTab(hasAwaiting ? "Awaiting Materials" : "All");
      }
    } catch (error) {
      console.error("Error fetching PR/RIS documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(true);
  }, []);

  const handlePrint = (doc: PrRisDocument) => {
    localStorage.setItem("pr-ris-document", JSON.stringify(doc));
    localStorage.setItem("pr-ris-origin", "tab");
    router.push("/pr-ris/print");
  };

  const handleCreateJobOrder = (doc: PrRisDocument) => {
    if (!doc.job_request) return;
    localStorage.setItem("selectedRequestId", String(doc.job_request.id));
    localStorage.setItem("selectedPrRisId", String(doc.id));
    localStorage.setItem("job-order-origin", "pr-ris");
    router.push("/job-order");
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      if (activeTab !== "All" && doc.status !== activeTab) return false;
      if (!query) return true;
      const unit = doc.job_request?.unit?.unit_name ?? "";
      const field = doc.job_request?.field_work ?? "";
      const work = doc.job_request?.specific_work ?? "";
      const type = doc.document_type ?? "";
      return [unit, field, work, type].join(" ").toLowerCase().includes(query);
    });
  }, [documents, activeTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">PR / RIS</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor purchase documents and confirm materials received
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? documents.length
                : documents.filter((d) => d.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by unit, field of work, specific work, or document type..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section / Unit</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field of Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specific Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type of Document</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400 animate-pulse">Loading documents...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-500">No documents found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Purchase requests and requisition slips will appear here once inspection marks materials as not available.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const unit = doc.job_request?.unit;
                  const unitName = unit ? `${unit.unit_name}${unit.unit_acronym ? ` (${unit.unit_acronym})` : ""}` : "—";
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatDate(doc.date)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{unitName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{doc.job_request?.field_work || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px]">
                        <span className="line-clamp-2">{doc.job_request?.specific_work || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border ${
                          doc.document_type === "PR"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {doc.document_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{statusPill(doc.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === 'Awaiting Materials' && (
                            <button
                              type="button"
                              onClick={() => handleCreateJobOrder(doc)}
                              title="Materials arrived - create job order"
                              className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                            >
                              Create Job Order
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePrint(doc)}
                            title="Print document"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
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
      </div>
    </div>
  );
};

export default PrRisTable;
