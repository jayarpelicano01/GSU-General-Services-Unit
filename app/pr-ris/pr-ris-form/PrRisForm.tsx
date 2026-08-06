"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API } from "@/app/utils/api/api";
import ConfirmDialog from "@/app/components/confirm/Confirm";
import { useToast } from "@/app/context/ToastContext";
import { getErrorMessage } from "@/app/utils/errors";

interface JobRequestData {
  id: number;
  unit: {
    unit_name: string;
    unit_acronym: string;
    location?: { location_name: string } | null;
  };
  field_work: string;
  specific_work: string;
  assessment_results?: string | null;
  status_of_materials?: string | null;
}

interface PrRisItem {
  stock: string;
  unit: string;
  description: string;
  qty: number | null;
  cost: number | null;
}

interface PrRisFormData {
  division: string;
  office: string;
  doc_no: string;
  date: string;
  purpose: string;
  items: PrRisItem[];
}

const UNITS = ["Pcs", "Kgs", "Ltrs", "Sets", "Rolls", "Bags", "Bottles", "gal", "sqm", "linear meter"];

const emptyItem = (): PrRisItem => ({ stock: "", unit: "Pcs", description: "", qty: null, cost: null });

const todayISO = () => new Date().toISOString().split("T")[0];

const PrRisForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "RIS" ? "RIS" : "PR";
  const { success, error } = useToast();
  const [requestData, setRequestData] = useState<JobRequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<PrRisFormData>({
    division: "",
    office: "GENERAL SERVICES UNIT",
    doc_no: "",
    date: todayISO(),
    purpose: "",
    items: [emptyItem()],
  });

  useEffect(() => {
    const storedRequestId = localStorage.getItem("selectedRequestId");
    if (!storedRequestId) {
      setLoading(false);
      return;
    }
    const fetchRequest = async () => {
      try {
        const response = await API.get(`/job-requests/${storedRequestId}`);
        setRequestData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch request:", err);
        error(getErrorMessage(err, "Failed to load job request."));
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => form.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.cost) || 0), 0),
    [form.items]
  );

  const updateItem = (index: number, patch: Partial<PrRisItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (index: number) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? [emptyItem()] : prev.items.filter((_, i) => i !== index),
    }));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = form.items.some((i) => i.description.trim() && i.qty && i.qty > 0) && form.purpose.trim() !== "";

  const handleSubmit = async () => {
    if (!requestData) return;
    setIsSubmitting(true);
    try {
      const items = form.items
        .filter((i) => i.description.trim() && i.qty && i.qty > 0)
        .map((i) => ({
          stock: i.stock || null,
          unit: i.unit,
          description: i.description,
          qty: i.qty,
          cost: type === "PR" ? i.cost ?? null : null,
          amount: type === "PR" ? (Number(i.qty) || 0) * (Number(i.cost) || 0) : null,
          remarks: null,
        }));

      const response = await API.post("/purchase-requests", {
        document_type: type,
        doc_no: form.doc_no || null,
        office: form.office,
        division: form.division || null,
        date: form.date ? new Date(form.date) : new Date(),
        purpose: form.purpose,
        job_request_id: requestData.id,
        items,
      });

      if (response.data.status === "success") {
        localStorage.setItem("pr-ris-document", JSON.stringify(response.data.data));
        localStorage.setItem("pr-ris-origin", "inspection");
        success(type === "PR" ? "Purchase Request created successfully." : "Requisition and Issue Slip created successfully.");
        setShowConfirm(false);
        setTimeout(() => router.push("/pr-ris/print"), 1200);
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      error(getErrorMessage(err, "Failed to create document. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 dark:text-slate-500">Loading request...</div>;
  }

  if (!requestData) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center dark:bg-slate-900 dark:border-slate-700">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 dark:bg-indigo-500/15">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-indigo-500">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">No job request selected</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto dark:text-slate-400">
          PR/RIS documents are created after an inspection marks materials as not available. Select a request from the inspections tab to continue.
        </p>
        <button
          type="button"
          onClick={() => router.push("/schedule-inspection")}
          className="mt-6 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all dark:shadow-none"
        >
          Go to Inspections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <nav className="no-print flex flex-wrap items-center gap-2 text-sm">
        <Link href="/schedule-inspection" className="text-slate-400 hover:text-indigo-600 font-medium transition-colors dark:text-slate-500">
          Inspections
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-700 font-semibold dark:text-slate-200">{type}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-700">
        {/* Header */}
        <div className="flex justify-center items-center relative px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <Image
            src="/UEP-Logo.png"
            loading="eager"
            alt="UEP Logo"
            width={90}
            height={90}
            className="absolute left-8 top-1/2 -translate-y-1/2"
          />
          <div className="text-center text-[13px] leading-snug">
            <p>Republic of the Philippines</p>
            <p className="font-bold">UNIVERSITY OF EASTERN PHILIPPINES</p>
            <p className="italic">University Town, Northern Samar</p>
            <p className="text-[11px]">
              Website: <span style={{ color: '#0056b3' }}>http://uep.edu.ph</span>{' '}
              Email: <span style={{ color: '#0056b3' }}>uepnsofficial@gmail.com</span>
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Image src="/socotec.jpg" alt="Socotec Logo" width={70} height={70} />
            <Image src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" width={70} height={70} />
          </div>
        </div>

        {/* Blue divider */}
        <div style={{ backgroundColor: '#0056b3' }} className="h-1.75" />

        {/* Title */}
        <div className="text-center pt-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <p className="font-bold text-[13px] tracking-widest uppercase text-slate-700 dark:text-slate-200">General Services Unit</p>
          <h1 className="font-bold text-[22px] tracking-wide uppercase text-slate-800 mt-1 dark:text-slate-100">
            {type === "PR" ? "Purchase Request" : "Requisition and Issue Slip"}
          </h1>
          <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">
            {requestData ? `${requestData.unit?.unit_name} (${requestData.unit?.unit_acronym}) • ${requestData.field_work}` : "Select a job request first"}
          </p>
        </div>

        {/* Top section */}
        <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 dark:border-slate-800">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 dark:text-slate-500">Division</label>
              <input
                type="text"
                name="division"
                value={form.division}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 dark:text-slate-500">Office</label>
              <input
                type="text"
                value={form.office}
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 dark:text-slate-500">
                {type} No.
              </label>
              <input
                type="text"
                name="doc_no"
                value={form.doc_no}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                placeholder="e.g. 2026-001"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 dark:text-slate-500">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Requisition
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all dark:text-indigo-400 dark:hover:text-indigo-300 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/20"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">
                  <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-left w-16 dark:border-slate-700 dark:bg-slate-800">Stock</th>
                  <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-left w-24 dark:border-slate-700 dark:bg-slate-800">Unit</th>
                  <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800">Description</th>
                  <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-center w-20 dark:border-slate-700 dark:bg-slate-800">Qty</th>
                  {type === "PR" && (
                    <>
                      <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-right w-24 dark:border-slate-700 dark:bg-slate-800">Cost</th>
                      <th className="px-2 py-2 border border-slate-200 bg-slate-50 text-right w-28 dark:border-slate-700 dark:bg-slate-800">Amount</th>
                    </>
                  )}
                  <th className="px-2 py-2 border border-slate-200 bg-slate-50 w-10 dark:border-slate-700 dark:bg-slate-800" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-2 py-2 border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={item.stock}
                        onChange={(e) => updateItem(index, { stock: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                      />
                    </td>
                    <td className="px-2 py-2 border border-slate-200 dark:border-slate-700">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, { unit: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        placeholder="Item name / specs"
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                      />
                    </td>
                    <td className="px-2 py-2 border border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min={0}
                        value={item.qty ?? ""}
                        onChange={(e) => updateItem(index, { qty: e.target.value === "" ? null : Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                      />
                    </td>
                    {type === "PR" && (
                      <>
                        <td className="px-2 py-2 border border-slate-200 dark:border-slate-700">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.cost ?? ""}
                            onChange={(e) => updateItem(index, { cost: e.target.value === "" ? null : Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                          />
                        </td>
                        <td className="px-2 py-2 border border-slate-200 text-right text-sm font-semibold text-slate-700 tabular-nums dark:border-slate-700 dark:text-slate-200">
                          ₱ {((Number(item.qty) || 0) * (Number(item.cost) || 0)).toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="px-2 py-2 border border-slate-200 text-center dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors dark:text-slate-600"
                        title="Remove item"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {type === "PR" && (
                  <tr>
                    <td colSpan={5} className="px-2 py-2.5 border border-slate-200 bg-slate-50 text-right text-xs font-bold text-slate-500 uppercase tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      Total
                    </td>
                    <td className="px-2 py-2.5 border border-slate-200 bg-slate-50 text-right text-sm font-extrabold text-slate-800 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      ₱ {total.toFixed(2)}
                    </td>
                    <td className="px-2 py-2.5 border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purpose */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 dark:text-slate-500">
            Purpose <span className="text-red-400">*</span>
          </label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            placeholder="For repair of ..."
          />
        </div>

        {/* Signatories */}
        <div className="p-6 grid grid-cols-3 divide-x divide-slate-200 text-center dark:divide-slate-800">
          {[
            { role: "Vice President", name: "Nenita P. Baldado, PhD" },
            { role: "General Services Unit Head", name: "Arnold A. Sales, LPT, MAED-PE" },
            { role: "President", name: "Cherry I. Ultra, PhD" },
          ].map((sig) => (
            <div key={sig.role} className="px-2">
              <div className="h-8 flex items-end justify-center">
                <div className="border-b-2 border-slate-300 w-36 text-[13px] text-slate-700 font-medium whitespace-nowrap dark:border-slate-700 dark:text-slate-200">{sig.name}</div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1.5 dark:text-slate-500">{sig.role}</p>
            </div>
          ))}
        </div>

        {/* Footer table (the blue box) */}
        <div className="px-6 pb-6">
          <div style={{ borderWidth: '2px' }} className="border border-blue-400 grid grid-cols-3 tex text-[11px] font-bold uppercase overflow-hidden">
            <div className="p-2 border-r border-blue-400 text-[11px]">
              DOCUMENT NO: <br />
              <div className="flex justify-center text-center w-full">
                <span className="border-b border-black w-40">UEP-GSU-FM-010</span>
              </div>
            </div>
            <div style={{ borderWidth: '0 1px 0 1px' }} className="border-r p-2 border-blue-400 flex text-[11px] flex-col justify-center">
              REVISION NO: <br />
              <div className="flex justify-center text-center w-full">
                <span className="border-b border-black w-40">00</span>
              </div>
            </div>
            <div style={{ borderWidth: '0 0 0 1px ' }} className="p-2 border-blue-400 text-[11px]">
              EFFECTIVITY DATE: <br />
              <div className="flex justify-center text-center">
                <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.push("/schedule-inspection")}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!isValid || isSubmitting}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] dark:shadow-none"
          >
            {isSubmitting ? "Creating..." : `Create ${type === "PR" ? "PR" : "RIS"}`}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={`Create ${type === "PR" ? "Purchase Request" : "Requisition and Issue Slip"}?`}
        message={requestData
          ? `Create this ${type} document for ${requestData.unit?.unit_name} with ${form.items.filter((i) => i.description.trim() && i.qty && i.qty > 0).length} item(s)?`
          : "Create this document?"}
        confirmLabel={`Yes, Create ${type}`}
        cancelLabel="Go Back"
        isLoading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default PrRisForm;
