"use client";

import Modal from "@/app/components/modal/modal";
import { JobRequest } from "@/app/types/JobRequest";

interface Props {
  selectedRequest: JobRequest | null;
  onClose: () => void;
  onViewDetails: (req: JobRequest) => void;
  onCreateJobOrder: (req: JobRequest) => void;
  onScheduleInspection: (req: JobRequest) => void;
  onSeeInspection: (req: JobRequest) => void;
  onSeePrRis: (req: JobRequest) => void;
  onDisapprove: (req: JobRequest) => void;
}

export const RequestActionsModal = ({
  selectedRequest, onClose, onViewDetails,
  onCreateJobOrder, onScheduleInspection, onSeeInspection, onSeePrRis, onDisapprove,
}: Props) => (
  <Modal
    isOpen={Boolean(selectedRequest)}
    onClose={onClose}
    title="Request Actions"
    subtitle={`Job Request #${selectedRequest?.id} • ${selectedRequest?.unit?.unit_name}`}
    maxWidth="lg"
  >
    {selectedRequest && (
      <div className="flex flex-col gap-2">

        {/* Status + summary header */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Work Description</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{selectedRequest.specific_work}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{selectedRequest.field_work}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tight inline-block shrink-0 ${
            selectedRequest.status === 'For Approval'       ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30' :
            selectedRequest.status === 'Approved'           ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' :
            selectedRequest.status === 'Pending'            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
            selectedRequest.status === 'Under Inspection'   ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' :
            selectedRequest.status === 'Awaiting Materials' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300' :
            selectedRequest.status === 'Disapproved'        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300' :
            selectedRequest.status === 'Cancelled'          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {selectedRequest.status.toUpperCase()}
          </span>
        </div>

        {/* Head approval status */}
        {selectedRequest.status === 'Pending' && selectedRequest.head_approved && (
          <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/15 rounded-xl border border-emerald-100 dark:border-emerald-500/30 flex items-center gap-2">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-emerald-600 dark:text-emerald-400 shrink-0">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
              Approved by Unit Head{selectedRequest.head_approved_at ? ` on ${new Date(selectedRequest.head_approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : ''}
            </p>
          </div>
        )}

        <button
          className="group w-full text-left px-4 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all flex items-center justify-between"
          onClick={() => onViewDetails(selectedRequest)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">View Full Details</span>
          </div>
          <svg className="text-slate-300 dark:text-slate-500 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {selectedRequest.status === 'Pending' && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest px-4">Actions</span>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
            </div>
            <button
              className="group w-full text-left px-4 py-4 rounded-xl bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 border border-blue-100 dark:border-blue-500/30 hover:border-blue-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onScheduleInspection(selectedRequest)}
            >
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <span className="text-blue-900 dark:text-blue-300 font-bold text-sm block">Schedule Inspection</span>
                <span className="text-blue-600/70 dark:text-blue-400/70 text-[11px] font-medium block mt-0.5">Assign personnel to evaluate the request on site</span>
              </div>
            </button>
            <button
              className="group w-full text-left px-4 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 border border-emerald-100 dark:border-emerald-500/30 hover:border-emerald-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onCreateJobOrder(selectedRequest)}
            >
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <span className="text-emerald-900 dark:text-emerald-300 font-bold text-sm block">Create Job Order</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70 text-[11px] font-medium block mt-0.5">Dispatch work order to personnel</span>
              </div>
            </button>
          </>
        )}

        {selectedRequest.status === 'Under Inspection' && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Actions</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>
            <button
              className="group w-full text-left px-4 py-4 rounded-xl bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 border border-blue-100 dark:border-blue-500/30 hover:border-blue-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onSeeInspection(selectedRequest)}
            >
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <span className="text-blue-900 dark:text-blue-300 font-bold text-sm block">See Inspection</span>
                <span className="text-blue-600/70 dark:text-blue-400/70 text-[11px] font-medium block mt-0.5">View inspection schedule and results in the inspections tab</span>
              </div>
            </button>
          </>
        )}

        {selectedRequest.status === 'Awaiting Materials' && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Actions</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>
            <button
              className="group w-full text-left px-4 py-4 rounded-xl bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 border border-amber-100 dark:border-amber-500/30 hover:border-amber-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onSeePrRis(selectedRequest)}
            >
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="text-amber-900 dark:text-amber-300 font-bold text-sm block">See PR / RIS</span>
                <span className="text-amber-600/70 dark:text-amber-400/70 text-[11px] font-medium block mt-0.5">View the purchase request or requisition document in the PR / RIS tab</span>
              </div>
            </button>
          </>
        )}

        {selectedRequest &&
          !['Cancelled', 'Disapproved', 'Approved'].includes(selectedRequest.status) && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest px-4">Danger Zone</span>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
            </div>

            <button
              className="group w-full text-left px-4 py-4 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-transparent hover:border-rose-100 transition-all flex items-center gap-4"
              onClick={() => onDisapprove(selectedRequest)}
            >
              <div className="p-2.5 text-rose-400 group-hover:text-rose-600 group-hover:bg-rose-100 rounded-lg transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <span className="text-rose-600 dark:text-rose-400 font-bold text-sm block">Disapprove Request</span>
                <span className="text-rose-400 text-[11px] font-medium block mt-0.5">Mark this request as disapproved</span>
              </div>
            </button>
          </>
        )}

      </div>
    )}
  </Modal>
);