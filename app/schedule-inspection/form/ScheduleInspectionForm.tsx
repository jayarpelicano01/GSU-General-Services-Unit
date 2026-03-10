"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/app/utils/api/api";
import Alert from "@/app/components/alert/Alert";
import ConfirmDialog from "@/app/components/confirm/Confirm";

interface JobRequestData {
  id: number;
  unit: {
    unit_name: string;
    unit_acronym: string;
    head_id: number;
    head: {
      first_name: string;
      middle_name: string;
      last_name: string;
      suffix: string;
    };
    location_id: number;
    location: {
      location_name: string;
    };
  };
  assessment_results: string;
  location: string;
  field_work: string;
  specific_work: string;
  estimated_duration_value: number;
  estimated_duration_unit: string;
  status_of_materials: string;
  status: string;
}

interface JobOrderData {
  jobOrderNo: number | null;
  specificWorkOrder: string; 
  remarks: string;
  personnels: string[];
}

interface Personnel {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    field: string;
}

const ScheduleInspectionForm = () => {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {

    const fetchPersonnel = async () => {
      try {
        const response = await API.get('/personnels');
        setPersonnelList(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error('Error fetching personnel:', error);
      }
    };
    fetchPersonnel();
    
  }, []);

  
  const [requestData, setRequestData] = useState<JobRequestData | null>(null);
  const [JobOrderFormData, setJobOrderFormData] = useState<JobOrderData>({  
    jobOrderNo: null,
    specificWorkOrder: requestData?.specific_work || "",
    personnels: [],
    remarks: "",
  });
  
  useEffect(() => {
    const fetchRequest = async () => {
      const storedRequestId = localStorage.getItem("selectedRequestId");
      console.log(storedRequestId);

      if (storedRequestId) {
        try {
          const response = await API.get(`/job-requests/${storedRequestId}`);
          const data = response.data.data;

          if (data.status === 'Approved') {
            router.push("/job-request-list")
          }

          setRequestData(data);
          setJobOrderFormData(prev => ({
          ...prev,
          specificWorkOrder: data.specific_work || "",
        }));
        } catch (error) {
          console.error("Failed to fetch request", error);
        }
      }
    };

    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

          
  

  const filteredPersonnel = personnelList.filter(
    person => person.field === requestData?.field_work
  );

  // People selected via the assist dropdown (not in filteredPersonnel)
  const assistPersonnel = personnelList.filter(p => 
    JobOrderFormData.personnels.includes(String(p.id)) && 
    !filteredPersonnel.some(fp => fp.id === p.id)
  );

  // Combined list: field-matched + assist selections
  const displayPersonnel = [...filteredPersonnel, ...assistPersonnel];
  

  useEffect(() => {
    console.log(JobOrderFormData);
 }, [JobOrderFormData]);

  const submitData = async (status: string) => {  
    const payload = {
        request_id: requestData?.id,
        specific_work: JobOrderFormData.specificWorkOrder,
        remarks: JobOrderFormData.remarks,
        jo_number: JobOrderFormData.jobOrderNo,
        status: status
    }

    try {
        const response = await API.post('/job-orders', {...payload});
        
        if (response.data.status === 'success') {
          const jobOrderId = response.data.data.id;

          try {
            API.patch(`/job-requests/${requestData?.id}/status`, { status: "Approved"});
          } catch (error) {
            console.error(error);
          }
          
          try {
            await Promise.all(JobOrderFormData.personnels.map(personnelId => 
                API.post(`/assignments/${personnelId}/assign/${jobOrderId}`, { personnel_id: personnelId })
            ));
          } catch (error) {
            console.error(error);
          }
        }

        const updatedRequestData = { 
          ...requestData, 
          jo_number: JobOrderFormData.jobOrderNo 
        };

        const updatedOrderDate = {
          ...response.data.data,
          personnels: JobOrderFormData.personnels
        .map(id => personnelList.find(p => p.id === Number(id)))
        }

        localStorage.setItem("job-request", JSON.stringify(updatedRequestData))
        localStorage.setItem("job-order", JSON.stringify(updatedOrderDate))
        setShowSuccess(true);

        if (status === "Assigned") {
          setTimeout(() => {
            router.push(`/job-order/print-job-order`);
          }, 1500);
        } else {
          setTimeout(() => {
            router.push(`/job-order-list`);
          }, 1500);
        }
    } catch (error) {
      console.error('Error creating job order:', error);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload
    setShowConfirm(true); // Show the confirmation dialog instead of submitting
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJobOrderFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!requestData) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header - UPDATED: Removed subtitle */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Schedule Inspection Form</h1>
          </div>
        </div>

        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          
          {/* SECTION 2: JOB EXECUTION DETAILS */}
          <div className="space-y-6">   
            {/* Personnel */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Personnel <span className="text-red-400">*</span>
              </label>

              {/* Filtered by field_work */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
              {displayPersonnel.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No personnel available for <span className="font-semibold">{requestData?.field_work}</span>
                </div>
              ) : (
                displayPersonnel.map((person, index) => {
                  const isSelected = JobOrderFormData.personnels.includes(String(person.id));
                  const isAssist = assistPersonnel.some(p => p.id === person.id);
                  const fullName = `${person.first_name} ${person.middle_name || ''} ${person.last_name} ${person.suffix || ''}`.trim();

                  return (
                    <div
                      key={person.id}
                      onClick={() => {
                        setJobOrderFormData(prev => ({
                          ...prev,
                          personnels: isSelected
                            ? prev.personnels.filter(id => id !== String(person.id))
                            : [...prev.personnels, String(person.id)]
                        }));
                      }}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all
                        ${index !== 0 ? 'border-t border-slate-100' : ''}
                        ${isSelected
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                          ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {person.first_name[0]}{person.last_name[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{fullName}</span>
                          {/* Badge to indicate this person is from assist */}
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

              {/* Selected summary */}
              {JobOrderFormData.personnels.length > 0 && (
                <p className="text-xs text-indigo-500 font-medium">
                  {JobOrderFormData.personnels.length} personnel selected
                </p>
              )}

              {/* Add person to assist */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Add Person to Assist
                </label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id || JobOrderFormData.personnels.includes(id)) return;
                      setJobOrderFormData(prev => ({
                        ...prev,
                        personnels: [...prev.personnels, id]
                      }));
                      e.target.value = ""; // reset after selection
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a person to assist...</option>
                    {personnelList
                      .filter(p => 
                        !JobOrderFormData.personnels.includes(String(p.id)) &&
                        !filteredPersonnel.some(fp => fp.id === p.id)
                    )
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}
                        </option>
                      ))
                    }
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>

            </div>
            {/* Text Areas */}
            <div className="space-y-6">
                <div>
                    <label htmlFor="specificWorkOrder" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Specific Work to be Done <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        id="specificWorkOrder"
                        name="specificWorkOrder"
                        value={JobOrderFormData.specificWorkOrder}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Detailed instructions for the personnel..."
                        required
                    />
                </div>

                <div>
                    <label htmlFor="remarks" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Remarks
                    </label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={JobOrderFormData.remarks}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Any additional notes or constraints..."
                    />
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <button
                type="button"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors flex items-center gap-2"
            >
                ← Back to Request List
            </button>

            <div className="flex gap-3">
                <button
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                Print Preview
                </button>
                <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                Process Order
                </button>
            </div>
          </div>
        </form>
      </div>

      <div className="fixed top-6 right-6 z-9999 w-full max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          {showSuccess && (
            <Alert 
              type="success" 
              message="Job Order processed successfully. Redirecting..." 
              onClose={() => setShowSuccess(false)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Process Job Order?"
        message="Finalize and Print the Order or save to draft first?"
        confirmLabel="Yes, Process"
        cancelLabel="Save as Draft"
        onConfirm={() => {
          setShowConfirm(false);
          submitData("Assigned");
        }}
        onCancel={() => {
          setShowConfirm(false);
          submitData("Pending")
        }}
      />
    </div>
  );
};

export default ScheduleInspectionForm;