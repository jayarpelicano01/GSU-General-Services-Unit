"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { API } from '@/app/utils/api/api';
import { useRouter } from 'next/navigation';

interface JobRequest {
        id: number;
        unit: {
        head: {
            first_name: string;
            middle_name: string;
            last_name: string;
            suffix: string;
        },
        location: {
            location_name: string;
        }
        unit_name: string;
        unit_acronym: string;
        };
        field_work: string;
        specific_work: string;
        assessment_results: string;
        status_of_materials: string;
        estimated_duration_value: number;
        estimated_duration_unit: string;
    }

interface Personnel {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
}

interface JobOrder {
    id: number;
    job_request: JobRequest;
    specific_work: string;
    remarks: string;
    jo_number: number;
    personnels: [Personnel];
    status: string;
}

const JobOrderTable = () => {
    const [activeTab, setActiveTab] = useState('Assigned');
    const tabs = ['Assigned', 'All Orders', 'Completed', 'Cancelled'];
    // const router = useRouter();
    const [orders, setOrders] = useState<JobOrder[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<JobOrder | null>(null);

    const handleOpenEditModal = (order: JobOrder) => {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
    };

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<JobOrder | null>(null);

    const handleOpenDetails = (order: JobOrder) => {
        setViewingOrder(order);
        setIsDetailsOpen(true);
    };

    const router = useRouter();

  useEffect(() => {

    // const fetchRequests = async () => {
    //   try {
    //     const response = await API.get('/job-requests');
    //     setRequests(response.data.data);
    //   } catch (error) {
    //     console.error('Error fetching job requests:', error);
    //   }
    // };

    // fetchRequests();

    const fetchOrders = async () => {
        try {
            const response = await API.get('/job-orders');
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching job orders:', error);
        }
    }

    fetchOrders();
    
  }, []); // Refetch if the number of requests changes
      
  console.log(orders);
  

    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");

    const handleGenerateReport = () => {
        setShowModal(true);
    };

    const handleConfirm = () => {
        if (!selectedMonth) return;
        router.push(`/accomplishment-report?month=${selectedMonth}`);
        setShowModal(false);
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All Orders') return true;
        return order.status === activeTab;
    });


  return (
    
    <div className="min-h-screen bg-[#f8f9ff] p-8">
      {/* Table Container */}
        <button
            onClick={handleGenerateReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
            Generate Report
        </button>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
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
                <th className="px-8 py-5">JO No.</th>
                <th className="px-4 py-5">Requesting Unit</th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* ID */}
                  <td className="px-8 py-6 text-slate-400 text-sm font-medium tabular-nums">
                    #{order.jo_number}
                  </td>
                  
                  {/* Requesting Unit */}
                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm leading-tight">
                      {order.job_request?.unit?.unit_name || 'Unknown Unit'}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 font-medium">
                      {order.job_request?.unit?.unit_acronym} • {order.job_request?.unit?.location?.location_name}
                    </div>
                  </td>

                  {/* Field of Work */}
                  <td className="px-4 py-6">
                    <span className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-2.5 py-1 rounded">
                      {order.job_request?.field_work}
                    </span>
                  </td>
                  
                  {/* Work Description */}
                  <td className="px-4 py-6 max-w-50">
                    <div className="font-bold text-slate-700 truncate text-sm" title={order.specific_work}>
                      {order.specific_work}
                    </div>
                    <div className="text-indigo-500 text-[10px] font-bold uppercase mt-1">
                      Est: {order.job_request?.estimated_duration_value} {order.job_request?.estimated_duration_unit}
                    </div>
                  </td>

                  {/* Remarks */}
                  {/* <td className="px-4 py-6 max-w-50">
                    {order.remarks ? (
                      <div className="text-[13px] text-slate-600 truncate font-medium" title={order.remarks}>
                        {order.remarks}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No remarks</span>
                    )}
                  </td> */}

                  {/* Overall Status Badge */}
                  <td className="px-4 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block min-w-20 ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'Assigned' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                      order.status === 'Ongoing' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'Pending' ? 'bg-slate-100 text-slate-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>

                  {/* Action */}
                 <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenEditModal(order)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all group/edit relative"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                            </svg>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                Edit Order
                            </span>
                        </button>

                        {/* Example of a conditional action button */}
                        <button 
                            onClick={() => handleOpenDetails(order)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                            View Details
                        </button>
                    </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Edit Job Order</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Order Reference #{selectedOrder?.id}</p>
                    </div>
                    <button 
                        onClick={() => setIsEditModalOpen(false)} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Work Description</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-25"
                            defaultValue={selectedOrder?.specific_work}
                            placeholder="Describe the specific work..."
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Remarks</label>
                        <input 
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            defaultValue={selectedOrder?.remarks}
                            placeholder="Add any internal remarks..."
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Discard
                    </button>
                    <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                        Update Order
                    </button>
                </div>
            </div>
        </div>
    )}
    {isDetailsOpen && viewingOrder && (
      <div className="fixed inset-0 z-100 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          {/* Slide-over Panel Animation */}
          <div className="bg-white h-full w-full max-w-2xl shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
              
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <div>
                      <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-slate-800">Job Order Details</h2>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                              viewingOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                              {viewingOrder.status}
                          </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">JO Number: <span className="font-mono text-indigo-600 font-bold">{viewingOrder.jo_number}</span></p>
                  </div>
                  <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
              </div>

              <div className="p-8 space-y-10">
                  {/* Section 1: Requesting Unit */}
                  <section>
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Requesting Unit Info</h3>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                          <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold">Office/Department</label>
                              <p className="text-sm font-bold text-slate-700">{viewingOrder.job_request.unit.unit_name}</p>
                              <p className="text-xs text-slate-500">{viewingOrder.job_request.unit.unit_acronym}</p>
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold">Location</label>
                              <p className="text-sm font-bold text-slate-700">{viewingOrder.job_request.unit.location.location_name}</p>
                          </div>
                          <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 uppercase font-bold">Unit Head</label>
                              <p className="text-sm font-bold text-slate-700">
                                  {viewingOrder.job_request.unit.head.first_name} {viewingOrder.job_request.unit.head.last_name} {viewingOrder.job_request.unit.head.suffix}
                              </p>
                          </div>
                      </div>
                  </section>

                  {/* Section 2: Work Specifics */}
                  <section>
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Work Description</h3>
                      <div className="space-y-4">
                          <div className="border-l-4 border-indigo-500 pl-4">
                              <p className="text-slate-700 text-sm leading-relaxed italic">&quot;{viewingOrder.specific_work}&quot;</p>
                          </div>
                          <div className="flex gap-8 text-[12px]">
                              <div>
                                  <span className="text-slate-400">Field:</span> <span className="font-bold text-slate-700">{viewingOrder.job_request.field_work}</span>
                              </div>
                              <div>
                                  <span className="text-slate-400">Duration:</span> <span className="font-bold text-slate-700">{viewingOrder.job_request.estimated_duration_value} {viewingOrder.job_request.estimated_duration_unit}</span>
                              </div>
                          </div>
                      </div>
                  </section>

                  {/* Section 3: Personnel Assigned */}
                  <section>
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Assigned Personnel</h3>
                      <div className="flex flex-wrap gap-2">
                          {viewingOrder.personnels.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                      {p.first_name[0]}
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">{p.first_name} {p.last_name}</span>
                              </div>
                          ))}
                      </div>
                  </section>

                  {/* Section 4: Remarks & Assessment */}
                  <section>
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Admin Remarks</h3>
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                          <p className="text-sm text-amber-800 leading-relaxed">{viewingOrder.remarks || "No internal remarks recorded."}</p>
                      </div>
                  </section>
              </div>

              

              {/* Footer Action */}
              {/* <div className="p-8 sticky bottom-0 bg-white border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg"
                  >
                      Print PDF Report
                  </button>
              </div> */}
          </div>
      </div>
  )}
  {showModal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-80 space-y-4">
        <h2 className="text-slate-800 font-bold text-lg">Generate Report</h2>
        <p className="text-slate-400 text-sm">Select a month to generate the accomplishment report.</p>
        
        <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:border-indigo-500 outline-none"
        />

        <div className="flex gap-3 justify-end">
            <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors"
            >
            Cancel
            </button>
            <button
            onClick={handleConfirm}
            disabled={!selectedMonth}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-lg transition-all"
            >
            Generate
            </button>
        </div>
        </div>
    </div>
    )}
  
    </div>
  );
};

export default JobOrderTable;