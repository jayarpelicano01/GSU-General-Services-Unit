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
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'All Requests', 'Approved', 'Disapproved', 'Cancelled'];
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
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">ID</th>
                <th className="px-4 py-5">Requesting Unit</th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5 text-center">Materials</th>
                <th className="px-4 py-5 text-center">Status</th>
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

                  {/* Materials Status */}
                  <td className="px-4 py-6 text-center">
                    {req.status_of_materials ? (
                      <span className={`text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded border ${
                        req.status_of_materials.toLowerCase() === 'available' 
                        ? 'text-emerald-600 border-emerald-100 bg-emerald-50' 
                        : 'text-amber-600 border-amber-100 bg-amber-50'
                      }`}>
                        {req.status_of_materials}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded border text-slate-400 border-slate-100 bg-slate-50">
                        Not Specified
                      </span>
                    )}
                  </td>

                  {/* Overall Status Badge */}
                  <td className="px-4 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block min-w-20 ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                      req.status === 'Disapproved' ? 'bg-rose-100 text-rose-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-8 py-6 text-right">
                    {req.status === 'Pending' ? (
                      <button 
                        className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:text-white tracking-tight hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                        onClick={() => handleNavigateToJobOrderForm(req)}
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