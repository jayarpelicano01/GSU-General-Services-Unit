"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/app/utils/api/api";
import { Pagination } from "@/components/ui/pagination";

interface AwaitingUnit {
  unit_name: string;
  unit_acronym: string;
  location?: { location_name: string } | null;
}

interface AwaitingRequest {
  id: number;
  request_date?: string;
  unit?: AwaitingUnit | null;
  field_work: string;
  specific_work: string;
  status: string;
  status_of_materials?: string | null;
}

const formatDate = (date: string | undefined) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const WaitingMaterialsTable = () => {
  const [requests, setRequests] = useState<AwaitingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/job-requests");
      const all = response.data.data ?? [];
      setRequests(all.filter((r: AwaitingRequest) => r.status === "Awaiting Materials"));
    } catch (error) {
      console.error("Error fetching job requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((r) =>
      [
        String(r.id),
        r.unit?.unit_name ?? "",
        r.unit?.unit_acronym ?? "",
        r.field_work,
        r.specific_work,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [requests, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Waiting for Materials</h1>
          <p className="text-sm text-slate-400 mt-0.5 dark:text-slate-500">
            Job requests awaiting materials — {filtered.length} pending
          </p>
        </div>

        <span className="bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-orange-100 whitespace-nowrap dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30">
          {filtered.length} Awaiting
        </span>
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
            placeholder="Search by ID, unit, field of work, or work description..."
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
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Request No.</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Section / Unit</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Field of Work</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Work Description</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Date Requested</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400 animate-pulse dark:text-slate-500">Loading requests...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No requests waiting for materials</p>
                    <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">Requests awaiting materials will appear here once the inspection marks them as such.</p>
                  </td>
                </tr>
              ) : (
                paged.map((req) => {
                  const unit = req.unit;
                  const unitName = unit ? `${unit.unit_name}${unit.unit_acronym ? ` (${unit.unit_acronym})` : ""}` : "—";
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-400 tabular-nums whitespace-nowrap dark:text-slate-500">#{req.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{unitName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 dark:text-slate-500">{unit?.location?.location_name}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-600 text-[12px] font-semibold bg-slate-100 px-2.5 py-1 rounded dark:text-slate-300 dark:bg-slate-800">
                          {req.field_work || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px] dark:text-slate-300">
                        <span className="line-clamp-2">{req.specific_work || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap dark:text-slate-300">{formatDate(req.request_date)}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30">
                          Awaiting Materials
                        </span>
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
    </div>
  );
};

export default WaitingMaterialsTable;