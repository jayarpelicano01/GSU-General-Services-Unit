"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/app/utils/api/api';

interface JobRequest {
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
    }
  };
  field_work: string;
  specific_work: string;
  estimated_duration_value: number;
  estimated_duration_unit: string;
  status_of_materials: string;
  status: string;
}

const JobRequestTable = () => {
  const [activeTab, setActiveTab] = useState('All Requests');
  const tabs = ['All Requests', 'Completed', 'Pending', 'Ongoing', 'Terminated'];
  const router = useRouter();
  const [requests, setRequests] = useState<JobRequest[]>([]);
  // const mockRequests = [
  //   {
  //     id: 1,
  //     requestingUnit: "College of Science",
  //     location: "UEP Main Campus",
  //     fieldWork: "Electrical",
  //     specificWork: "Repair of air-conditioning unit in Laboratory 101",
  //     duration: 2,
  //     unit: "Days",
  //     statusOfMaterials: "available",
  //     status: "Completed"
  //   },
  //   {
  //     id: 2,
  //     requestingUnit: "White Beach Resort",
  //     location: "UEP Main Campus",
  //     fieldWork: "Electrical",
  //     specificWork: "Installation of Power Supply at Swimming Pool Area & temporary source of electricity at Staff House",
  //     duration: 5,
  //     unit: "Hours",
  //     statusOfMaterials: "Not Available",
  //     status: "Pending"
  //   },
  //   {
  //     id: 3,
  //     requestingUnit: "Business Ad",
  //     location: "UEP Main Campus",
  //     fieldWork: "Carpentry",
  //     specificWork: "Repair of broken faculty desks",
  //     duration: 3,
  //     unit: "Days",
  //     statusOfMaterials: "Available",
  //     status: "Ongoing"
  //   },
  //   {
  //     id: 4,
  //     requestingUnit: "Registrar Office",
  //     location: "UEP Main Campus",
  //     fieldWork: "Masonry",
  //     specificWork: "Fixing floor tiles at the entrance",
  //     duration: 1,
  //     unit: "Days",
  //     statusOfMaterials: "Not Available",
  //     status: "Terminated"
  //   }
  // ];

  useEffect(() => {

    const fetchRequests = async () => {
      try {
        const response = await API.get('/job-requests');
        setRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching job requests:', error);
      }
    };

    fetchRequests();
    
  }, []); // Refetch if the number of requests changes
      
  console.log(requests);
  

  const handleNavigateToJobOrderForm = (request: JobRequest) => {
    localStorage.setItem('selectedRequest', JSON.stringify(request));
    router.push('/job-order');
  }

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'All Requests') return true;
    return req.status === activeTab;
  });


  return (
    <div className="min-h-screen bg-[#f8f9ff] p-8">
      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Navigation Tabs (From Screenshot) */}
        <div className="flex items-center border-b border-slate-100 px-8 py-2 gap-8">
          
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-4 text-sm font-medium ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">ID</th>
                <th className="px-4 py-5">Requesting Unit</th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5">Materials</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-slate-400 text-sm font-medium">{req.id}</td>

                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm">{req.unit.unit_name} ({req.unit.unit_acronym})</div>
                    <div className="text-slate-400 text-[11px] italic">{req.unit.location.location_name}</div>
                  </td>

                  <td className="px-4 py-6">
                    <span className="text-slate-600 text-sm font-medium">{req.field_work}</span>
                  </td>
                  
                  <td className="px-4 py-6 max-w-xs">
                    <div className="font-bold text-slate-700 truncate">{req.specific_work }</div>
                    <div className="text-indigo-500 text-xs mt-0.5">Est: {req.estimated_duration_value} {req.estimated_duration_unit}</div>
                  </td>
                  

                  {/* Materials Status Badge */}
                  <td className="px-4 py-6">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded border ${
                      req.status_of_materials === 'Available' 
                      ? 'text-emerald-600 border-emerald-100 bg-emerald-50' 
                      : 'text-amber-600 border-amber-100 bg-amber-50'
                    }`}>
                      {req.status_of_materials}
                    </span>
                  </td>

                  {/* Overall Status Badge (From Screenshot Styles) */}
                  <td className="px-4 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                      req.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                      req.status === 'Ongoing' ? 'bg-blue-100 text-blue-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Action Menu Dot */}
                  <td className="px-8 py-6 text-right">
                    {req.status === 'Pending' ? (
                      <button 
                        className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        onClick={() => handleNavigateToJobOrderForm(req)}
                      >
                        Create Job Order
                      </button>
                    ) : (
                      <button className="text-slate-300 hover:text-slate-500 transition-colors px-4 py-2 text-[11px] font-bold uppercase">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobRequestTable;