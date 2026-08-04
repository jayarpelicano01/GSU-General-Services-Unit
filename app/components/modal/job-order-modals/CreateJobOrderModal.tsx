"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/modal/modal";
import ConfirmDialog from "@/app/components/confirm/Confirm";
import { CreateJobOrderFields } from "@/app/components/modal/job-order-modals/CreateJobOrderFields";
import { useToast } from "@/app/context/ToastContext";
import { getErrorMessage } from "@/app/utils/errors";
import { API } from "@/app/utils/api/api";
import { createJobOrder } from "@/app/utils/jobOrder";
import { JobOrderFormData, JobOrderModalRequest } from "@/app/types/JobOrder";
import { Personnel } from "@/app/types/JobRequest";

interface Props {
  open: boolean;
  request: JobOrderModalRequest | null;
  prRisId?: string | null;
  onClose: () => void;
}

export const CreateJobOrderModal = ({ open, request, prRisId, onClose }: Props) => {
  const router = useRouter();
  const { success, error } = useToast();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [form, setForm] = useState<JobOrderFormData>({ jobOrderNo: null, specificWorkOrder: "", personnels: [] });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await API.get("/personnels");
        setPersonnelList(response.data.data);
      } catch (err) {
        console.error("Error fetching personnel:", err);
      }
    };
    fetchPersonnel();
  }, []);

  useEffect(() => {
    if (open) {
      setForm({
        jobOrderNo: null,
        specificWorkOrder: request?.specific_work ?? "",
        personnels: [],
      });
      setShowConfirm(false);
    }
  }, [open, request]);

  if (!request) return null;

  const submitData = async (status: string) => {
    setIsSubmitting(true);
    try {
      await createJobOrder({ request, form, personnelList, status, prRisId });
      setShowConfirm(false);
      onClose();
      success(status === "Assigned" ? "Job Order created and personnel assigned." : "Job Order created successfully.");
      setTimeout(() => {
        router.push(status === "Assigned" ? "/job-order/print-job-order" : "/job-order-list");
      }, 1200);
    } catch (err) {
      console.error("Error creating job order:", err);
      error(getErrorMessage(err, "Failed to create job order. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        title="Create Job Order"
        subtitle={`${request.field_work} • ${request.unit?.unit_name ?? ""}`}
        maxWidth="xl"
      >
        <CreateJobOrderFields request={request} personnelList={personnelList} form={form} onChange={setForm} />

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={isSubmitting || !form.jobOrderNo || !form.specificWorkOrder.trim()}
            onClick={() => setShowConfirm(true)}
            className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            Process Order
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Process Job Order?"
        message="Finalize and Print the Order or save to draft first?"
        confirmLabel="Yes, Process"
        cancelLabel="Save as Draft"
        isLoading={isSubmitting}
        onConfirm={() => submitData("Assigned")}
        onCancel={() => submitData("Pending")}
      />
    </>
  );
};
