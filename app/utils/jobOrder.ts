import { API } from "@/app/utils/api/api";
import { JobOrderFormData, JobOrderModalRequest } from "@/app/types/JobOrder";
import { Personnel } from "@/app/types/JobRequest";

interface CreateJobOrderParams {
  request: JobOrderModalRequest;
  form: JobOrderFormData;
  personnelList: Personnel[];
  prRisId?: string | null;
}

export const createJobOrder = async ({
  request,
  form,
  personnelList,
  prRisId,
}: CreateJobOrderParams) => {
  const response = await API.post("/job-orders", {
    request_id: request.id,
    specific_work: form.specificWorkOrder,
    jo_number: form.jobOrderNo,
    status: "Assigned",
  });

  if (response.data.status !== "success") {
    throw new Error("Failed to create job order.");
  }

  const jobOrderId = response.data.data.id;

  await API.patch(`/job-requests/${request.id}/status`, { status: "Approved" }).catch(() => {});

  if (prRisId) {
    await API.patch(`/purchase-requests/${prRisId}/receive`).catch(() => {});
  }

  await Promise.all(
    form.personnels.map((pid) =>
      API.post(`/assignments/${pid}/assign/${jobOrderId}`, { personnel_id: pid })
    )
  ).catch(() => {});

  const fullRequest = await API.get(`/job-requests/${request.id}`)
    .then((r) => r.data.data)
    .catch(() => ({ ...request, jo_number: form.jobOrderNo }));

  const jobRequestData = {
    ...fullRequest,
    jo_number: form.jobOrderNo,
  };

  const jobOrderData = {
    ...response.data.data,
    personnels: form.personnels
      .map((pid) => personnelList.find((p) => p.id === Number(pid)))
      .filter(Boolean),
  };

  localStorage.setItem("job-request", JSON.stringify(jobRequestData));
  localStorage.setItem("job-order", JSON.stringify(jobOrderData));

  return { jobOrderId, jobRequestData, jobOrderData };
};
