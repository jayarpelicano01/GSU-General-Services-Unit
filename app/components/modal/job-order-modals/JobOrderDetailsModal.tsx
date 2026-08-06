"use client";

import Modal from "@/app/components/modal/modal";

interface JobRequestRef {
  unit?: {
    unit_name?: string;
    unit_acronym?: string;
    location?: { location_name?: string };
    head?: { first_name?: string; middle_name?: string; last_name?: string; suffix?: string };
  };
  field_work?: string;
  estimated_duration_value?: number;
  estimated_duration_unit?: string;
}

interface PersonnelRef {
  first_name: string;
  last_name: string;
}

interface JobOrder {
  id: number;
  jo_number?: number;
  status: string;
  specific_work?: string;
  remarks?: string;
  job_request?: JobRequestRef;
  personnels?: PersonnelRef[];
}

interface Props {
  viewingOrder: JobOrder | null;
  onClose: () => void;
}

export const JobOrderDetailsModal = ({ viewingOrder, onClose }: Props) => (
  <Modal
    isOpen={Boolean(viewingOrder)}
    onClose={onClose}
    title="Job Order Details"
    subtitle={`JO #${viewingOrder?.jo_number}`}
    maxWidth="md"
  >
    {viewingOrder && (
      <div className="space-y-5">

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Current Status</span>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tight inline-block ${
            viewingOrder.status === 'Completed'  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' :
            viewingOrder.status === 'Assigned'   ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' :
            viewingOrder.status === 'Cancelled'  ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' :
            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {viewingOrder.status.toUpperCase()}
          </span>
        </div>

        {/* Requesting Unit */}
        {viewingOrder.job_request?.unit && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Requesting Unit</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
              <p className="text-slate-800 font-bold text-sm dark:text-slate-100">{viewingOrder.job_request.unit.unit_name}</p>
              <p className="text-slate-400 text-[11px] mt-0.5 dark:text-slate-500">
                {viewingOrder.job_request.unit.unit_acronym} • {viewingOrder.job_request.unit.location?.location_name}
              </p>
              <p className="text-slate-500 text-[11px] mt-2 font-medium dark:text-slate-400">
                Head: {viewingOrder.job_request.unit.head?.first_name} {viewingOrder.job_request.unit.head?.last_name}
              </p>
            </div>
          </div>
        )}

        {/* Field of Work */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Field of Work</p>
          <span className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-3 py-1.5 rounded-lg dark:text-slate-300 dark:bg-slate-800">
            {viewingOrder.job_request?.field_work}
          </span>
        </div>

        {/* Work Description */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Work Description</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <p className="text-slate-700 text-sm leading-relaxed dark:text-slate-200">{viewingOrder.specific_work}</p>
          </div>
        </div>

        {/* Estimated Duration */}
        {viewingOrder.job_request?.estimated_duration_value ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Estimated Duration</p>
            <p className="text-indigo-600 font-bold text-sm dark:text-indigo-400">
              {viewingOrder.job_request.estimated_duration_value} {viewingOrder.job_request.estimated_duration_unit}
            </p>
          </div>
        ) : null}

        {/* Assigned Personnel */}
        {viewingOrder.personnels && viewingOrder.personnels.length > 0 ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Assigned Personnel</p>
            <div className="flex flex-wrap gap-2">
              {viewingOrder.personnels.map((p, idx) => (
                <span
                  key={idx}
                  className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-3 py-1.5 rounded-lg dark:text-slate-300 dark:bg-slate-800"
                >
                  {p.first_name} {p.last_name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Admin Remarks */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 dark:text-slate-500">Admin Remarks</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <p className="text-slate-700 text-sm leading-relaxed dark:text-slate-200">
              {viewingOrder.remarks || "No internal remarks recorded."}
            </p>
          </div>
        </div>

        {/* Close */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
          >
            Close
          </button>
        </div>

      </div>
    )}
  </Modal>
);