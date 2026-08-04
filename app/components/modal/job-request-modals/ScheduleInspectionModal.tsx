"use client";

import Modal from "@/app/components/modal/modal";
import ConfirmDialog from "@/app/components/confirm/Confirm";
import { JobRequest, Personnel, InspectionFormData } from "@/app/types/JobRequest";

interface Props {
  inspectionTarget: JobRequest | null;
  inspectionForm: InspectionFormData;
  personnelList: Personnel[];
  isSubmitting: boolean;
  showConfirm: boolean;
  onClose: () => void;
  onFormChange: (form: InspectionFormData) => void;
  onConfirmOpen: () => void;
  onConfirm: () => void;
  onConfirmClose: () => void;
}

export const ScheduleInspectionModal = ({
  inspectionTarget, inspectionForm, personnelList,
  isSubmitting, showConfirm, onClose, onFormChange,
  onConfirmOpen, onConfirm, onConfirmClose,
}: Props) => {

  const fieldPersonnel = personnelList.filter(p => p.field === inspectionTarget?.field_work);
  const assistPersonnel = personnelList.filter(p =>
    inspectionForm.personnels.includes(String(p.id)) &&
    !fieldPersonnel.some(fp => fp.id === p.id)
  );
  const displayPersonnel = [...fieldPersonnel, ...assistPersonnel];

  const togglePersonnel = (id: string, isSelected: boolean) => {
    onFormChange({
      ...inspectionForm,
      personnels: isSelected
        ? inspectionForm.personnels.filter(p => p !== id)
        : [...inspectionForm.personnels, id],
    });
  };

  return (
    <>
      <Modal
        isOpen={Boolean(inspectionTarget)}
        title="Schedule Inspection"
        subtitle={`${inspectionTarget?.field_work} • ${inspectionTarget?.unit?.unit_name}`}
        onClose={onClose}
        maxWidth="md"
      >
        <div className="space-y-6">

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
              Inspection Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={inspectionForm.scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onFormChange({ ...inspectionForm, scheduledDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
              Personnel <span className="text-red-400">*</span>
            </label>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {displayPersonnel.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No personnel available for <span className="font-semibold">{inspectionTarget?.field_work}</span>
                </div>
              ) : (
                displayPersonnel.map((person, index) => {
                  const isSelected = inspectionForm.personnels.includes(String(person.id));
                  const isAssist = assistPersonnel.some(p => p.id === person.id);
                  const fullName = `${person.first_name} ${person.middle_name || ''} ${person.last_name} ${person.suffix || ''}`.trim();

                  return (
                    <div
                      key={person.id}
                      onClick={() => togglePersonnel(String(person.id), isSelected)}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all
                        ${index !== 0 ? 'border-t border-slate-100' : ''}
                        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                          ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {person.first_name[0]}{person.last_name[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{fullName}</span>
                          {isAssist && (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                              Assist
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
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

            {inspectionForm.personnels.length > 0 && (
              <p className="text-xs text-indigo-500 font-medium mt-2">
                {inspectionForm.personnels.length} personnel selected
              </p>
            )}

            <div className="pt-4 mt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                Add Person to Assist
              </label>
              <div className="relative">
                <select
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id || inspectionForm.personnels.includes(id)) return;
                    onFormChange({ ...inspectionForm, personnels: [...inspectionForm.personnels, id] });
                    e.target.value = '';
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select a person to assist...</option>
                  {personnelList
                    .filter(p =>
                      !inspectionForm.personnels.includes(String(p.id)) &&
                      !fieldPersonnel.some(fp => fp.id === p.id)
                    )
                    .map(person => (
                      <option key={person.id} value={person.id}>
                        {person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}
                      </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmOpen}
              disabled={isSubmitting || !inspectionForm.scheduledDate || inspectionForm.personnels.length === 0}
              className="flex-2 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={onConfirmClose}
        title="Schedule Inspection?"
        message={`Assign personnel and schedule inspection for ${inspectionTarget?.unit?.unit_name} on ${
          inspectionForm.scheduledDate
            ? new Date(inspectionForm.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
            : 'the selected date'
        }?`}
        confirmLabel="Yes, Schedule"
        cancelLabel="Go Back"
        isLoading={isSubmitting}
        onConfirm={onConfirm}
        onCancel={onConfirmClose}
      />
    </>
  );
};