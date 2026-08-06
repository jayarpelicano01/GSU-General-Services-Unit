"use client";

import Modal from "@/app/components/modal/modal";
import { JobRequest } from "@/app/types/JobRequest";

interface Props {
  viewingRequest: JobRequest | null;
  onClose: () => void;
}

export const RequestDetailsModal = ({ viewingRequest, onClose }: Props) => (
  <Modal
    isOpen={Boolean(viewingRequest)}
    onClose={onClose}
    title="Request Details"
    subtitle={`Job Request #${viewingRequest?.id}`}
    maxWidth="md"
  >
    {viewingRequest && (
      <div className="space-y-5">

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Status</span>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block ${
            viewingRequest.status === 'Pending' && !viewingRequest.head_approved ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30' :
            viewingRequest.status === 'Approved'           ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' :
            viewingRequest.status === 'Pending'            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
            viewingRequest.status === 'Under Inspection'   ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' :
            viewingRequest.status === 'Awaiting Materials' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300' :
            viewingRequest.status === 'Disapproved'        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300' :
            viewingRequest.status === 'Cancelled'          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {viewingRequest.status === 'Pending' && !viewingRequest.head_approved
              ? 'AWAITING HEAD APPROVAL'
              : viewingRequest.status.toUpperCase()}
          </span>
        </div>

        {/* Unit Head Approval */}
        {viewingRequest.status === 'Pending' && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Unit Head Approval</p>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              viewingRequest.head_approved
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-100 dark:border-emerald-500/30'
                : 'bg-red-50 dark:bg-red-500/15 border-red-100 dark:border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  viewingRequest.head_approved
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400'
                }`}>
                  {viewingRequest.head_approved ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    viewingRequest.head_approved ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {viewingRequest.head_approved ? 'Approved by Unit Head' : 'Awaiting Unit Head Approval'}
                  </p>
                  {viewingRequest.head_approved_at && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {new Date(viewingRequest.head_approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requesting Unit */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Requesting Unit</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-800 dark:text-slate-100 font-bold text-sm">{viewingRequest.unit?.unit_name}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
              {viewingRequest.unit?.unit_acronym} • {viewingRequest.unit?.location?.location_name}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-2 font-medium">
              Head: {viewingRequest.unit?.head?.first_name} {viewingRequest.unit?.head?.last_name}
            </p>
          </div>
        </div>

        {/* Field of Work */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Field of Work</p>
          <span className="text-slate-600 dark:text-slate-300 text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {viewingRequest.field_work}
          </span>
        </div>

        {/* Work Description */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Work Description</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{viewingRequest.specific_work}</p>
          </div>
        </div>

        {/* Estimated Duration */}
        {viewingRequest.estimated_duration_value ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Estimated Duration</p>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {viewingRequest.estimated_duration_value} {viewingRequest.estimated_duration_unit}
            </p>
          </div>
        ) : null}

        {/* Material Status */}
        {viewingRequest.status_of_materials ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Material Status</p>
            <span className={`text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded border ${
              viewingRequest.status_of_materials.toLowerCase() === 'available'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/15'
                : 'text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/15'
            }`}>
              {viewingRequest.status_of_materials}
            </span>
          </div>
        ) : null}

        {/* Reason for Disapproval */}
        {viewingRequest.status === 'Disapproved' && viewingRequest.reason_for_disapproval && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Reason for Disapproval</p>
            <div className="p-4 bg-rose-50 dark:bg-rose-500/15 rounded-xl border border-rose-100 dark:border-rose-500/30">
              <p className="text-rose-700 dark:text-rose-300 text-sm leading-relaxed">{viewingRequest.reason_for_disapproval}</p>
            </div>
          </div>
        )}

        {/* Close */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    )}
  </Modal>
);