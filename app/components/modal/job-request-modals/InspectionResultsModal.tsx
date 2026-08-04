"use client";

import Modal from "@/app/components/modal/modal";
import { InspectionResultFormData } from "@/app/types/JobRequest";

export interface InspectionResultTarget {
  id: number;
  field_work: string;
  unit?: {
    unit_name: string;
  } | null;
}

interface Props {
  inspectionResultTarget: InspectionResultTarget | null;
  inspectionResultForm: InspectionResultFormData;
  isSubmitting: boolean;
  onClose: () => void;
  onFormChange: (form: InspectionResultFormData) => void;
  onCreateJobOrder: () => void;
  onCreatePurchaseRequest: () => void;
  onCreateRequisitionSlip: () => void;
}

export const InspectionResultsModal = ({
  inspectionResultTarget, inspectionResultForm, isSubmitting,
  onClose, onFormChange, onCreateJobOrder, onCreatePurchaseRequest, onCreateRequisitionSlip,
}: Props) => (
  <Modal
    isOpen={Boolean(inspectionResultTarget)}
    title="Submit Inspection Results"
    subtitle={`${inspectionResultTarget?.field_work} • ${inspectionResultTarget?.unit?.unit_name}`}
    onClose={onClose}
    maxWidth="md"
  >
    <div className="space-y-6">

      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
          Results of Assessment / Evaluation <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={inspectionResultForm.assessment_results}
          onChange={(e) => onFormChange({ ...inspectionResultForm, assessment_results: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
          placeholder="Describe the findings from the inspection..."
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
          Estimated Duration
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min={0}
            value={inspectionResultForm.estimated_duration_value}
            onChange={(e) => onFormChange({ ...inspectionResultForm, estimated_duration_value: Number(e.target.value) })}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            placeholder="0"
          />
          <div className="relative">
            <select
              value={inspectionResultForm.estimated_duration_unit}
              onChange={(e) => onFormChange({ ...inspectionResultForm, estimated_duration_unit: e.target.value as 'Hours' | 'Days' })}
              className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
          Status of Materials <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onFormChange({ ...inspectionResultForm, status_of_materials: 'Available' })}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${
              inspectionResultForm.status_of_materials === 'Available'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            ✓ Available
          </button>
          <button
            type="button"
            onClick={() => onFormChange({ ...inspectionResultForm, status_of_materials: 'Not Available' })}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${
              inspectionResultForm.status_of_materials === 'Not Available'
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            ✕ Not Available
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
        <button
          onClick={onCreateJobOrder}
          disabled={
            isSubmitting ||
            !inspectionResultForm.assessment_results.trim() ||
            inspectionResultForm.status_of_materials !== 'Available'
          }
          className="w-full px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Create Job Order
        </button>

        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Materials not available — select document type
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCreatePurchaseRequest}
            disabled={
              isSubmitting ||
              !inspectionResultForm.assessment_results.trim() ||
              inspectionResultForm.status_of_materials !== 'Not Available'
            }
            className="flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Purchase Request
          </button>
          <button
            onClick={onCreateRequisitionSlip}
            disabled={
              isSubmitting ||
              !inspectionResultForm.assessment_results.trim() ||
              inspectionResultForm.status_of_materials !== 'Not Available'
            }
            className="flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M3 10h18M7 15h2m4 0h4M5 6h14a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
            </svg>
            Requisition & Issue Slip
          </button>
        </div>
      </div>

    </div>
  </Modal>
);