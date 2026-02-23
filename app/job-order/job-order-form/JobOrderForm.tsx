"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/app/utils/api/api";

// MOCK DATA
// const AVAILABLE_PERSONNEL = [
//   "Alex De Guzman",1
//   "Benjie Cortez",
//   "Charlie Magne",
//   "Danilo Santos",
//   "Eddie Garcia",
//   "Francis Tolentino",
//   "George Estregan",
//   "Harry Roque",
//   "Isko Moreno",
//   "Jose Mari Chan"
// ];

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

const JobOrderForm = () => {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);

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

          

//   const getAvailablePersonnel = (currentFieldName: string) => {
//     // 1. Identify which IDs are currently selected in OTHER fields
//     const selectedIds = [
//         currentFieldName !== 'personnel1' ? JobOrderFormData.personnel1 : null,
//         currentFieldName !== 'personnel2' ? JobOrderFormData.personnel2 : null,
//         currentFieldName !== 'personnel3' ? JobOrderFormData.personnel3 : null,
//     ].filter(Boolean); // Removes nulls and empty strings

//     // 2. Filter the master list to exclude those IDs
//     return personnelList.filter(person => !selectedIds.includes(person.id.toString()));
// };

  

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
        request_id: requestData?.id,
        specific_work: JobOrderFormData.specificWorkOrder,
        remarks: JobOrderFormData.remarks,
        jo_number: JobOrderFormData.jobOrderNo,
    }

    
    // const orderData = {
    //     request: requestData,
    //     specific_work: JobOrderFormData.specificWorkOrder,
    //     remarks: JobOrderFormData.remarks,
    //     jo_number: JobOrderFormData.jobOrderNo,
    //     personnels: JobOrderFormData.personnels
    //     .map(id => personnelList.find(p => p.id === Number(id)))
    //     .filter(Boolean)
    // };



    console.log(payload);    
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
        
        localStorage.setItem("job-request", JSON.stringify(updatedRequestData))
        // localStorage.setItem("job-order", JSON.stringify(orderData))
        
        console.log('Job Order creation:', response.data.status , response.data);

        const updatedOrderDate = {
          ...response.data.data,
          personnels: JobOrderFormData.personnels
        .map(id => personnelList.find(p => p.id === Number(id)))
        }

        localStorage.setItem("job-order", JSON.stringify(updatedOrderDate))
        alert('Job Order processed successfully!');
        router.push(`/job-order/print-job-order`)
    } catch (error) {
      console.error('Error creating job order:', error);
    }
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
            <h1 className="text-xl font-bold text-slate-800">Job Order Form</h1>
          </div>
        </div>

        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          
          {/* SECTION 1: REQUEST REFERENCE */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Request Reference
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requesting Unit</label>
                    <div className="text-sm font-medium text-slate-700">{requestData.unit.unit_name} ({requestData.unit.unit_acronym})</div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Field of Work</label>
                    <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold inline-block border border-indigo-100">
                        {requestData.field_work || "General"}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location</label>
                    <div className="text-sm font-medium text-slate-700">{requestData.unit.location.location_name}</div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requested Work Description</label>
                    <div className="text-sm text-slate-600 italic bg-white p-3 rounded border border-slate-200">
                        {requestData.specific_work}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assessment Results</label>
                    <div className="text-sm text-slate-600 italic bg-white p-3 rounded border border-slate-200">
                        {requestData.assessment_results || "None Specified"}
                    </div>
                </div>
            </div>
          </div>

          {/* SECTION 2: JOB EXECUTION DETAILS */}
          <div className="space-y-6">
            {/* Order Number */}
            <div>
              <label htmlFor="jobOrderNo" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Order No.
              </label>
              <input 
                type="number" 
                id="jobOrderNo"
                name="jobOrderNo"
                onChange={handleInputChange}
                className="text-lg p-2 font-mono font-bold text-indigo-400 rounded-xl border-slate-200 border-2 focus:border-indigo-600 focus:bg-white outline-none transition-all w-full"
                placeholder="0000"
                required
              />
            </div>
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
    </div>
  );
};

export default JobOrderForm;