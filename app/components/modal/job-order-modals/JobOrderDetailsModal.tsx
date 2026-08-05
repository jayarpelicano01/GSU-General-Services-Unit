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
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Status</span>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block ${
            viewingOrder.status === 'Completed'  ? 'bg-emerald-100 text-emerald-600' :
            viewingOrder.status === 'Assigned'   ? 'bg-blue-100 text-blue-600' :
            viewingOrder.status === 'Cancelled'  ? 'bg-rose-100 text-rose-600' :
            'bg-slate-100 text-slate-500'
          }`}>
            {viewingOrder.status.toUpperCase()}
          </span>
        </div>

        {/* Requesting Unit */}
        {viewingOrder.job_request?.unit && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requesting Unit</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-800 font-bold text-sm">{viewingOrder.job_request.unit.unit_name}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {viewingOrder.job_request.unit.unit_acronym} • {viewingOrder.job_request.unit.location?.location_name}
              </p>
              <p className="text-slate-500 text-[11px] mt-2 font-medium">
                Head: {viewingOrder.job_request.unit.head?.first_name} {viewingOrder.job_request.unit.head?.last_name}
              </p>
            </div>
          </div>
        )}

        {/* Field of Work */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Field of Work</p>
          <span className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-3 py-1.5 rounded-lg">
            {viewingOrder.job_request?.field_work}
          </span>
        </div>

        {/* Work Description */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Work Description</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-700 text-sm leading-relaxed">{viewingOrder.specific_work}</p>
          </div>
        </div>

        {/* Estimated Duration */}
        {viewingOrder.job_request?.estimated_duration_value ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Duration</p>
            <p className="text-indigo-600 font-bold text-sm">
              {viewingOrder.job_request.estimated_duration_value} {viewingOrder.job_request.estimated_duration_unit}
            </p>
          </div>
        ) : null}

        {/* Assigned Personnel */}
        {viewingOrder.personnels && viewingOrder.personnels.length > 0 ? (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Personnel</p>
            <div className="flex flex-wrap gap-2">
              {viewingOrder.personnels.map((p, idx) => (
                <span
                  key={idx}
                  className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-3 py-1.5 rounded-lg"
                >
                  {p.first_name} {p.last_name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Admin Remarks */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Remarks</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-700 text-sm leading-relaxed">
              {viewingOrder.remarks || "No internal remarks recorded."}
            </p>
          </div>
        </div>

        {/* Close */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    )}
  </Modal>
);