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
  const tabs = ['All Requests', 'Pending', 'Under Inspection', 'Awaiting Materials', 'Approved', 'Disapproved', 'Cancelled'];
  const router = useRouter();
  const [requests, setRequests] = useState<JobRequest[]>([]);
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
      
  // console.log(requests);
  

  const handleNavigateToJobOrderForm = (requestId: number) => {
    localStorage.setItem('selectedRequestId', requestId.toString());
    router.push('/job-order');
  }

  const handleScheduleInspection = (requestId: number) => {
    localStorage.setItem('selectedRequestId', requestId.toString());
    router.push('/schedule-inspection');
  }

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'All Requests') return true;
    return req.status === activeTab;
  });

  useEffect(() => {
      const AssignedRequest = requests.filter(request => {
          return request.status === 'Pending';
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (AssignedRequest.length > 0) {setActiveTab("Pending")}
  }, [requests])


  return (
    <div className="min-h-screen bg-[#f8f9ff] p-8">
      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-8 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-slate-800 text-lg font-extrabold tracking-tight">Job Requests</h2>
            <p className="text-slate-400 text-[12px] font-medium mt-0.5">Manage and monitor all incoming job requests</p>
          </div>
          <span className="bg-indigo-50 text-indigo-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-100">
            {filteredRequests.length} {activeTab === 'All Requests' ? 'Total' : activeTab}
          </span>
        </div>
        
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
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">ID</th>
                <th className="px-4 py-5">Requesting Unit</th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* ID */}
                  <td className="px-8 py-6 text-slate-400 text-sm font-medium tabular-nums">
                    #{req.id}
                  </td>

                  {/* Requesting Unit */}
                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm leading-tight">
                      {req.unit?.unit_name || 'Unknown Unit'}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 font-medium">
                      {req.unit?.unit_acronym} • {req.unit?.location?.location_name}
                    </div>
                  </td>

                  {/* Field of Work */}
                  <td className="px-4 py-6">
                    <span className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-2.5 py-1 rounded">
                      {req.field_work}
                    </span>
                  </td>
                  
                  {/* Work Description */}
                  <td className="px-4 py-6 max-w-50">
                    <div className="font-bold text-slate-700 truncate text-sm" title={req.specific_work}>
                      {req.specific_work}
                    </div>
                    <div className="text-indigo-500 text-[10px] font-bold uppercase mt-1">
                      Est: {req.estimated_duration_value} {req.estimated_duration_unit}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-8 py-6 text-right">
                    {req.status === 'Pending' ? (
                      <button 
                        className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:text-white tracking-tight hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                        onClick={() => handleScheduleInspection(req.id)}
                      >
                        Schedule Inspection
                      </button>
                    ) : req.status === 'Approved' ? (
                      <button 
                        className="bg-white border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:text-white tracking-tight hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                        onClick={() => handleNavigateToJobOrderForm(req.id)}
                      >
                        Create Job Order
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors font-bold text-[11px] uppercase tracking-wider">
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