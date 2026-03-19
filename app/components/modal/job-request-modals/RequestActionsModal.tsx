"use client";

import Modal from "@/app/components/modal/modal";
import { JobRequest } from "@/app/types/JobRequest";

interface Props {
  selectedRequest: JobRequest | null;
  onClose: () => void;
  onViewDetails: (req: JobRequest) => void;
  onScheduleInspection: (req: JobRequest) => void;
  onSubmitResults: (req: JobRequest) => void;
  onCreateJobOrder: (req: JobRequest) => void;
  onDisapprove: (req: JobRequest) => void;
}

export const RequestActionsModal = ({
  selectedRequest, onClose, onViewDetails,
  onScheduleInspection, onSubmitResults, onCreateJobOrder,
  onDisapprove,
}: Props) => (
  <Modal
    isOpen={Boolean(selectedRequest)}
    onClose={onClose}
    title="Request Actions"
    subtitle={`Job Request #${selectedRequest?.id} • ${selectedRequest?.unit?.unit_name}`}
    maxWidth="md"
  >
    {selectedRequest && (
      <div className="flex flex-col gap-2">

        <button
          className="group w-full text-left px-4 py-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-between"
          onClick={() => onViewDetails(selectedRequest)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-slate-700 font-bold text-sm">View Full Details</span>
          </div>
          <svg className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {selectedRequest.status === 'Pending' && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Actions</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>
            <button
              className="group w-full text-left px-4 py-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onScheduleInspection(selectedRequest)}
            >
              <div className="p-2.5 bg-white rounded-lg text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-indigo-900 font-extrabold text-sm block">Schedule Inspection</span>
                <span className="text-indigo-600/70 text-[11px] font-medium block mt-0.5">Assign personnel and set inspection date</span>
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
              className="group w-full text-left px-4 py-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onSubmitResults(selectedRequest)}
            >
              <div className="p-2.5 bg-white rounded-lg text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="text-amber-900 font-extrabold text-sm block">Submit Inspection Results</span>
                <span className="text-amber-600/70 text-[11px] font-medium block mt-0.5">Fill in assessment and material status</span>
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
              className="group w-full text-left px-4 py-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 transition-all flex items-center gap-4 shadow-sm"
              onClick={() => onCreateJobOrder(selectedRequest)}
            >
              <div className="p-2.5 bg-white rounded-lg text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <span className="text-emerald-900 font-extrabold text-sm block">Create Job Order</span>
                <span className="text-emerald-600/70 text-[11px] font-medium block mt-0.5">Dispatch work order to personnel</span>
              </div>
            </button>
          </>
        )}

        {selectedRequest &&
          !['Cancelled', 'Disapproved', 'Approved'].includes(selectedRequest.status) && (
          <>
            <div className="flex items-center my-3 px-2">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Danger Zone</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            <button
              className="group w-full text-left px-4 py-4 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all flex items-center gap-4"
              onClick={() => onDisapprove(selectedRequest)}
            >
              <div className="p-2.5 text-rose-400 group-hover:text-rose-600 group-hover:bg-rose-100 rounded-lg transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <span className="text-rose-600 font-bold text-sm block">Disapprove Request</span>
                <span className="text-rose-400 text-[11px] font-medium block mt-0.5">Mark this request as disapproved</span>
              </div>
            </button>
          </>
        )}

      </div>
    )}
  </Modal>
);