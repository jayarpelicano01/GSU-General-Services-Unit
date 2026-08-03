"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/app/utils/api/api";
import { useRouter } from "next/navigation";

interface Personnel {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
}

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
  unit?: InspectionUnit | null;
}

interface Inspection {
  id: number;
  inspection_date: string | Date;
  remarks: string | null;
  recommedation: string | null;
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
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${classes[value] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {value}
    </span>
  );
};

const InspectionsTable = () => {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInspections = async () => {
    try {
      const response = await API.get("/inspections");
      setInspections(response.data.data ?? []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handlePrint = (insp: Inspection) => {
    localStorage.setItem("inspection-schedule", JSON.stringify({
      id: insp.id,
      request: insp.job_request,
      scheduledDate: toDateInput(insp.inspection_date),
      personnels: insp.personnels ?? [],
    }));
    router.push("/inspection");
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

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inspections</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor all inspections and their status</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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
            placeholder="Search by unit, field of work, specific work, or inspector..."
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
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Inspected</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section / Unit</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field of Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specific Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspectors</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400 animate-pulse">Loading inspections...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-500">No inspections found</p>
                    <p className="text-xs text-slate-400 mt-1">Assigned inspections will appear here once scheduled.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((insp) => {
                  const unit = insp.job_request?.unit;
                  const unitName = unit ? `${unit.unit_name}${unit.unit_acronym ? ` (${unit.unit_acronym})` : ""}` : "—";
                  const inspectors = insp.personnels ?? [];
                  return (
                    <tr key={insp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatDate(insp.inspection_date)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{unitName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{insp.job_request?.field_work || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px]">
                        <span className="line-clamp-2">{insp.job_request?.specific_work || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {inspectors.length === 0 ? (
                          <span className="text-sm text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {inspectors.map((p) => (
                              <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                                {fullName(p)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">{statusPill(insp.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handlePrint(insp)}
                          title="Print inspection report"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9V2h12v7" />
                            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                        </button>
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

export default InspectionsTable;