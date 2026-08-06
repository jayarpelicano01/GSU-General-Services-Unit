"use client";

import { useMemo } from "react";
import { JobOrderFormData, JobOrderModalRequest } from "@/app/types/JobOrder";
import { Personnel } from "@/app/types/JobRequest";

interface Props {
  request: JobOrderModalRequest;
  personnelList: Personnel[];
  form: JobOrderFormData;
  onChange: (form: JobOrderFormData) => void;
}

export const CreateJobOrderFields = ({ request, personnelList, form, onChange }: Props) => {
  const filteredPersonnel = useMemo(
    () => personnelList.filter((p) => p.field === request.field_work),
    [personnelList, request.field_work]
  );

  const assistPersonnel = useMemo(
    () =>
      personnelList.filter(
        (p) => form.personnels.includes(String(p.id)) && !filteredPersonnel.some((fp) => fp.id === p.id)
      ),
    [personnelList, filteredPersonnel, form.personnels]
  );

  const displayPersonnel = [...filteredPersonnel, ...assistPersonnel];

  const togglePersonnel = (id: number) => {
    onChange({
      ...form,
      personnels: form.personnels.includes(String(id))
        ? form.personnels.filter((p) => p !== String(id))
        : [...form.personnels, String(id)],
    });
  };

  const addAssist = (id: string) => {
    if (!id || form.personnels.includes(id)) return;
    onChange({ ...form, personnels: [...form.personnels, id] });
  };

  return (
    <div className="space-y-6">
      {/* Order Number */}
      <div>
        <label htmlFor="jobOrderNo" className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
          Order No. <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          id="jobOrderNo"
          name="jobOrderNo"
          value={form.jobOrderNo ?? ""}
          onChange={(e) => onChange({ ...form, jobOrderNo: e.target.value === "" ? null : Number(e.target.value) })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold text-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          placeholder="0000"
          required
        />
      </div>

      {/* Personnel */}
      <div className="space-y-4">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 dark:text-slate-500">
          Personnel <span className="text-red-400">*</span>
        </label>

        <div className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-700">
          {displayPersonnel.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No personnel available for <span className="font-semibold">{request.field_work}</span>
            </div>
          ) : (
            displayPersonnel.map((person, index) => {
              const isSelected = form.personnels.includes(String(person.id));
              const isAssist = assistPersonnel.some((p) => p.id === person.id);
              const fullName = `${person.first_name} ${person.middle_name || ""} ${person.last_name} ${person.suffix || ""}`.trim();

              return (
                <div
                  key={person.id}
                  onClick={() => togglePersonnel(person.id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all
                    ${index !== 0 ? "border-t border-slate-100 dark:border-slate-800" : ""}
                    ${isSelected ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"}`}>
                      {person.first_name[0]}{person.last_name[0]}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{fullName}</span>
                      {isAssist && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full dark:bg-amber-500/15 dark:text-amber-300">
                          Assist
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"}`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {form.personnels.length > 0 && (
          <p className="text-xs text-indigo-500 font-medium">{form.personnels.length} personnel selected</p>
        )}

        {/* Add person to assist */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 dark:text-slate-500">
            Add Person to Assist
          </label>
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                addAssist(e.target.value);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
            >
              <option value="">Select a person to assist...</option>
              {personnelList
                .filter(
                  (p) =>
                    !form.personnels.includes(String(p.id)) &&
                    !filteredPersonnel.some((fp) => fp.id === p.id)
                )
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.first_name} {person.middle_name || ""} {person.last_name} {person.suffix || ""}
                  </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">▼</div>
          </div>
        </div>
      </div>

      {/* Specific Work */}
      <div>
        <label htmlFor="specificWorkOrder" className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 dark:text-slate-500">
          Specific Work to be Done <span className="text-red-400">*</span>
        </label>
        <textarea
          id="specificWorkOrder"
          name="specificWorkOrder"
          value={form.specificWorkOrder}
          onChange={(e) => onChange({ ...form, specificWorkOrder: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          placeholder="Detailed instructions for the personnel..."
          required
        />
      </div>
    </div>
  );
};
