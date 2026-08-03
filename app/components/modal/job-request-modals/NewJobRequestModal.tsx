"use client";
import { useEffect, useState } from "react";
import Modal from "@/app/components/modal/modal";
import { API } from "@/app/utils/api/api";
import { useAuth } from "@/app/context/AuthContext";
import { FieldWork } from "@/app/job-request/job-request-form/JobRequestForm";

interface Unit {
  id: number;
  unit_name: string;
  unit_acronym: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const NewJobRequestModal = ({ isOpen, onClose, onCreated }: Props) => {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [fieldWork, setFieldWork] = useState<FieldWork | "">("");
  const [specificWork, setSpecificWork] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestingUnitId = user?.unit_id ?? "";

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await API.get('/units');
        setUnits(response.data.data);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      }
    };
    if (isOpen) fetchUnits();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFieldWork("");
      setSpecificWork("");
      setError(null);
    }
  }, [isOpen]);

  const fieldWorkOptions = [
    { column: 1, items: [FieldWork.Carpentry, FieldWork.ArtAndSign, FieldWork.Electrical] },
    { column: 2, items: [FieldWork.Painting, FieldWork.Landscaping, FieldWork.Plumbing] },
    { column: 3, items: [FieldWork.Welding, FieldWork.RefrigerationAndAirConditioning, FieldWork.BrushCutter] },
    { column: 4, items: [FieldWork.Utility] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fieldWork) {
      setError("Please select a field of work.");
      return;
    }
    if (!specificWork.trim()) {
      setError("Please provide a work description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      request_date: new Date().toISOString().split('T')[0],
      unit_id: requestingUnitId,
      field_work: fieldWork,
      specific_work: specificWork,
    };

    try {
      const response = await API.post('/job-requests', payload);
      if (response.status === 201 || response.status === 200) {
        onCreated?.();
        onClose();
      } else {
        setError("Failed to submit job request. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit job request:", error);
      setError("Failed to submit job request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUnit = units.find((u) => u.id === requestingUnitId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Job Request"
      subtitle="General Services Unit (GSU) Office"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requesting Unit */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Requesting Unit <span className="text-red-400">*</span>
          </label>
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 font-medium">
            {selectedUnit
              ? `${selectedUnit.unit_name} ${selectedUnit.unit_acronym ? `(${selectedUnit.unit_acronym})` : ""}`
              : "Your unit"}
          </div>
        </div>

        {/* Field Work */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Field Work Selection <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            {fieldWorkOptions.map((column) => (
              <div key={column.column} className="space-y-3">
                {column.items.map((item) => (
                  <label key={item} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center shrink-0">
                      <input
                        type="radio"
                        name="fieldWork"
                        value={item}
                        checked={fieldWork === item}
                        onChange={() => {
                          setFieldWork(fieldWork === item ? "" : item);
                          setError(null);
                        }}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-indigo-600 transition-all"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Specific Work Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Specific Work Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            value={specificWork}
            onChange={(e) => {
              setSpecificWork(e.target.value);
              setError(null);
            }}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            placeholder="Detailed instructions..."
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-600 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewJobRequestModal;
