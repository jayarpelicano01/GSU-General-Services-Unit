"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/app/utils/api/api";

// MOCK DATA
// const AVAILABLE_PERSONNEL = [
//   "Alex De Guzman",
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
  };
  location: "UEP MAIN CAMPUS";
  field_work: string;
  specific_work: string;
  estimated_duration_value: number;
  estimated_duration_unit: string;
  status_of_materials: string;
  status: string;
}

interface JobOrderData {
  jobOrderNo: "31";
  specificWorkOrder: string; 
  remarks: string;
  personnel1: string;
  personnel2: string;
  personnel3: string;
}

interface Personnel {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
}

const JobOrderForm = () => {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);

  useEffect(() => {

    const fetchPersonnel = async () => {
      try {
        const response = await API.get('/personnels');
        setPersonnelList(response.data.data);
      } catch (error) {
        console.error('Error fetching personnel:', error);
      }
    };

    fetchPersonnel();
    
  }, []);

  const [requestData] = useState<JobRequestData | null>(() => {
    const storedRequest = localStorage.getItem("selectedRequest");
    if (storedRequest) {
      try {
        return JSON.parse(storedRequest);
      } catch (error) {
        console.error("Failed to parse selected request", error);
      }
    }
    return null;
  });

  const [JobOrderFormData, setJobOrderFormData] = useState<JobOrderData>({
    jobOrderNo: "31",
    specificWorkOrder: "",
    personnel1: "",
    personnel2: "",
    personnel3: "",
    remarks: "",
  });
  
  const selectedPersonnel = [
    JobOrderFormData.personnel1,
    JobOrderFormData.personnel2,
    JobOrderFormData.personnel3,
  ].filter(Boolean); 

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

    console.log(payload);
    

    try {
        const response = await API.post('/job-orders', {...payload});

        const jobOrderId = response.data.data.id;

        // await Promise.all(selectedPersonnel.map(personnelId => 
        //     API.post(`/job-orders/${jobOrderId}/assign-personnel`, { personnel_id: personnelId })
        // ));
        // console.log('Job Order created successfully:', response.data);


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
            {/* Subtitle removed here */}
          </div>
          <div className="text-right">
             <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Order No.</span>
             <span className="text-lg font-mono font-bold text-indigo-600">{JobOrderFormData.jobOrderNo}</span>
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
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requested Work Description</label>
                    <div className="text-sm text-slate-600 italic bg-white p-3 rounded border border-slate-200">
                        {requestData.specific_work}
                    </div>
                </div>
            </div>
          </div>

          {/* SECTION 2: JOB EXECUTION DETAILS */}
          <div className="space-y-6">
            
            {/* Personnel Stack */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Assigned Personnel
                </label>
                
                <div className="space-y-4">
                    
                    {/* Personnel 1 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel1"
                                value={JobOrderFormData.personnel1}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Select Personnel 1...</option>
                                {personnelList.map(person => (
                                    <option key={person.id} value={person.id}>{person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    {/* Personnel 2 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel2"
                                value={JobOrderFormData.personnel2}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select Personnel 2...</option>
                                {personnelList.map(person => (
                                    <option key={person.id} value={person.id}>{person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    {/* Personnel 3 */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <select
                                name="personnel3"
                                value={JobOrderFormData.personnel3}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select Personnel 3...</option>
                                {personnelList.map(person => (
                                    <option key={person.id} value={person.id}>{person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
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