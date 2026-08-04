"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API } from "@/app/utils/api/api";
import Modal from "@/app/components/modal/modal";
import ConfirmDialog from "@/app/components/confirm/Confirm";
import { useToast } from "@/app/context/ToastContext";
import { getErrorMessage } from "@/app/utils/errors";

const FIELDS = [
  "Welding",
  "Painting",
  "Carpentry/Masonry",
  "Brush Cutter",
  "Electrical",
  "Plumbing",
  "Art & Sign",
  "Refrigeration & Air-Conditioning",
  "Landscaping",
  "Utility",
] as const;

const STATUS_TABS = ["All", "Active", "Inactive"] as const;

interface Personnel {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  field: string;
  status: "Active" | "Inactive";
}

interface PersonnelFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  field: string;
  status: "Active" | "Inactive";
}

interface HistoryJobOrder {
  id: number;
  assigned_date: string;
  status: string;
  job_order?: {
    id: number;
    status: string;
    job_request?: {
      specific_work: string;
      field_work: string;
      unit?: { unit_name: string; unit_acronym: string } | null;
    } | null;
  } | null;
}

interface HistoryInspection {
  id: number;
  assigned_date: string;
  inspection?: {
    id: number;
    inspection_date: string;
    status: string;
    job_request?: {
      specific_work: string;
      field_work: string;
      unit?: { unit_name: string; unit_acronym: string } | null;
    } | null;
  } | null;
}

interface PersonnelHistory {
  jobOrders: HistoryJobOrder[];
  inspections: HistoryInspection[];
}

const emptyForm: PersonnelFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  field: "Electrical",
  status: "Active",
};

const fullName = (p: Personnel) =>
  `${p.first_name} ${p.middle_name || ""} ${p.last_name}${p.suffix ? ` ${p.suffix}` : ""}`.replace(/\s+/g, " ").trim();

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = new Date(date + (typeof date === "string" && !date.includes("T") ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const PersonnelTable = () => {
  const { success, error } = useToast();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<PersonnelFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<Personnel | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Personnel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // History data
  const [history, setHistory] = useState<PersonnelHistory>({ jobOrders: [], inspections: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPersonnel = async () => {
    try {
      const response = await API.get("/personnels");
      setPersonnel(response.data.data ?? []);
    } catch (err) {
      console.error("Error fetching personnel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return personnel.filter((p) => {
      if (activeTab !== "All" && p.status !== activeTab) return false;
      if (!query) return true;
      return fullName(p).toLowerCase().includes(query) || p.field.toLowerCase().includes(query);
    });
  }, [personnel, activeTab, searchQuery]);

  // Add
  const handleOpenAdd = () => {
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      error("First name and last name are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await API.post("/personnels", {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        suffix: formData.suffix.trim() || null,
        field: formData.field,
        status: formData.status,
      });
      success("Personnel added successfully.");
      setShowAddModal(false);
      fetchPersonnel();
    } catch (err) {
      error(getErrorMessage(err, "Failed to add personnel."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const handleOpenEdit = (p: Personnel) => {
    setEditTarget(p);
    setFormData({
      first_name: p.first_name,
      middle_name: p.middle_name ?? "",
      last_name: p.last_name,
      suffix: p.suffix ?? "",
      field: p.field,
      status: p.status,
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      error("First name and last name are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await API.patch(`/personnels/${editTarget.id}`, {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        suffix: formData.suffix.trim() || null,
        field: formData.field,
        status: formData.status,
      });
      success("Personnel updated successfully.");
      setShowEditModal(false);
      setEditTarget(null);
      fetchPersonnel();
    } catch (err) {
      error(getErrorMessage(err, "Failed to update personnel."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleOpenDelete = (p: Personnel) => {
    setDeleteTarget(p);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await API.delete(`/personnels/${deleteTarget.id}`);
      success("Personnel deleted successfully.");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchPersonnel();
    } catch (err) {
      error(getErrorMessage(err, "Failed to delete personnel."));
    } finally {
      setIsDeleting(false);
    }
  };

  // History
  const handleOpenHistory = async (p: Personnel) => {
    setHistoryTarget(p);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const response = await API.get(`/personnels/${p.id}/history`);
      setHistory(response.data.data ?? { jobOrders: [], inspections: [] });
    } catch (err) {
      console.error("Error fetching history:", err);
      error("Failed to load personnel history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Field badge color
  const fieldBadge = (field: string) => {
    const colors: Record<string, string> = {
      Welding: "bg-rose-50 text-rose-700 border-rose-200",
      Painting: "bg-purple-50 text-purple-700 border-purple-200",
      "Carpentry/Masonry": "bg-amber-50 text-amber-700 border-amber-200",
      "Brush Cutter": "bg-orange-50 text-orange-700 border-orange-200",
      Electrical: "bg-sky-50 text-sky-700 border-sky-200",
      Plumbing: "bg-blue-50 text-blue-700 border-blue-200",
      "Art & Sign": "bg-pink-50 text-pink-700 border-pink-200",
      "Refrigeration & Air-Conditioning": "bg-cyan-50 text-cyan-700 border-cyan-200",
      Landscaping: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Utility: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${colors[field] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
        {field}
      </span>
    );
  };

  const statusPill = (status: string) => {
    const classes: Record<string, string> = {
      Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Inactive: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border ${classes[status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Personnel</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage maintenance personnel and their assignments</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status tabs */}
          <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {STATUS_TABS.map((tab) => {
              const count =
                tab === "All"
                  ? personnel.length
                  : personnel.filter((p) => p.status === tab).length;
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

          {/* Add button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Personnel
          </button>
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
            placeholder="Search by name or field of work..."
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
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400 animate-pulse">Loading personnel...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-500">No personnel found</p>
                    <p className="text-xs text-slate-400 mt-1">Personnel records will appear here once added.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-medium">{p.id}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{fullName(p)}</td>
                    <td className="px-4 py-3.5">{fieldBadge(p.field)}</td>
                    <td className="px-4 py-3.5">{statusPill(p.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenHistory(p)}
                          title="View History"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(p)}
                          title="Delete"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); setEditTarget(null); }}
        title={showEditModal ? "Edit Personnel" : "Add Personnel"}
        subtitle="PERSONNEL INFORMATION"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name *</label>
              <input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Middle Name</label>
              <input
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="Middle name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name *</label>
              <input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Suffix</label>
              <input
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="Jr., Sr., III, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Field of Work *</label>
            <select
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            >
              {FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditTarget(null); }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30"
            >
              Cancel
            </button>
            <button
              onClick={showEditModal ? handleEdit : handleAdd}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : showEditModal ? "Save Changes" : "Add Personnel"}
            </button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => { setShowHistoryModal(false); setHistoryTarget(null); }}
        title={historyTarget ? `${fullName(historyTarget)} — History` : "Personnel History"}
        subtitle="PERFORMANCE HISTORY"
        maxWidth="3xl"
      >
        {historyLoading ? (
          <div className="py-12 text-center text-sm text-slate-400 animate-pulse">Loading history...</div>
        ) : (
          <div className="space-y-6">
            {/* Job Orders */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                Job Orders ({history.jobOrders.length})
              </h3>
              {history.jobOrders.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No job order assignments yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.jobOrders.map((jo) => {
                        const unit = jo.job_order?.job_request?.unit;
                        return (
                          <tr key={jo.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{formatDate(jo.assigned_date)}</td>
                            <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{unit ? `${unit.unit_name} (${unit.unit_acronym})` : "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{jo.job_order?.job_request?.specific_work || "—"}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                jo.job_order?.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                jo.job_order?.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {jo.job_order?.status || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Inspections */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Inspections ({history.inspections.length})
              </h3>
              {history.inspections.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No inspection assignments yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.inspections.map((insp) => {
                        const unit = insp.inspection?.job_request?.unit;
                        return (
                          <tr key={insp.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{formatDate(insp.inspection?.inspection_date)}</td>
                            <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{unit ? `${unit.unit_name} (${unit.unit_acronym})` : "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{insp.inspection?.job_request?.specific_work || "—"}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                insp.inspection?.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {insp.inspection?.status || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Personnel"
        message={`Are you sure you want to delete ${deleteTarget ? fullName(deleteTarget) : ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
      />
    </div>
  );
};

export default PersonnelTable;