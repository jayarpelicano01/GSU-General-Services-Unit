"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { API } from '@/app/utils/api/api';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/modal/modal';

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
    date_started?: string;
    status: string;
}

const JobOrderTable = () => {
    const [activeTab, setActiveTab] = useState('All Orders');
    const tabs = ['Assigned', 'All Orders', 'Pending', 'Completed', 'Cancelled'];
    const [orders, setOrders] = useState<JobOrder[]>([]);
    
    const today = new Date().toISOString().split('T')[0];


    const [selectedOrder, setSelectedOrder] = useState<JobOrder | null>(null);
    const [completeOrder, setCompleteOrder] = useState<JobOrder | null>(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<JobOrder | null>(null);

    // const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelOrder, setCancelOrder] = useState<JobOrder | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = async () => {
            try {
                const response = await API.get('/job-orders');
                setOrders(response.data.data);
            } catch (error) {
                console.error('Error fetching job orders:', error);
            }
        }

        
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders();

        
    }, []);

    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            alert("Please enter a reason for cancellation.");
            return;
        }

        try {
            const response = await API.patch(`/job-orders/${cancelOrder?.id}/cancel`, {
                reason: cancelReason
            });

            if (response.data.status === "success") {
                setCancelOrder(null);
                fetchOrders(); // Refresh your table data
                // Optional: Show a success toast/alert
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
        }
    };
    
    // Update your state to use the order's existing data as defaults
    const [formData, setFormData] = useState({
        date_started: completeOrder?.date_started || '', 
        date_accomplished: today
    });

    const handleOpenCompleteModal = (order: JobOrder) => {
        const todayStr = new Date().toISOString().split('T')[0];
        let startDateValue = '';
        setSelectedOrder(null); 
        
        setCompleteOrder(order);

        console.log(order.date_started);

        if (order.date_started) {
            // Only attempt to format if the date actually exists
            startDateValue = new Date(order.date_started).toISOString().split('T')[0];
        }
        
        setFormData({
            date_started: startDateValue,
            date_accomplished: todayStr
        });
    };


    const router = useRouter();
      
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

    useEffect(() => {
        const AssignedOrders = orders.filter(order => {
            return order.status === 'Assigned';
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (AssignedOrders.length > 0) {setActiveTab("Assigned")}
    }, [orders])

    const handleFinalSubmit = async () => {
        try {
            // completeOrder is the JobOrder object we selected
            await API.patch(`/job-orders/${completeOrder?.id}/complete`, formData);
            
            // Refresh the table and close modal
            setCompleteOrder(null);

            const fetchOrders = async () => {
                try {
                    const response = await API.get('/job-orders');
                    setOrders(response.data.data);
                } catch (error) {
                    console.error('Error fetching job orders:', error);
                }
    }
            fetchOrders(); // Call your existing fetch function to update the UI

            alert("Order completed!");
        } catch (error) {
            console.error("Submit failed:", error);
        }
    };


  return (
    
    <div className="min-h-screen bg-[#f8f9ff] p-8">
        
         
        
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-2 gap-8">
            
            <div className='flex gap-8'>
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
            <div>
                <button
                    onClick={handleGenerateReport}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 right-20 rounded-lg text-sm font-bold transition-all"
                    >
                    Generate Report
                </button> 
            </div>
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
                    <div className="flex justify-end items-center">
                        {order.status === 'Assigned' ? (
                        /* Triple Dot Button for Assigned Orders */
                        <button 
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                        ) : (
                        /* Simple View Details for everything else (Completed, Pending, etc.) */
                        <button 
                            type="button"
                            onClick={() => {setIsDetailsOpen(true); setViewingOrder(order)}}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                            View Details
                        </button>
                        )}
                    </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



    {/* ---------------MODALS--------------- */}

    <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Order Actions"
        subtitle={`Manage Job Order #${selectedOrder?.jo_number}`}
        maxWidth="md"
    >
        {selectedOrder && (
            <div className="flex flex-col gap-2">
                
                {/* 1. View Details Action */}
                <button 
                    className="group w-full text-left px-4 py-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-between" 
                    onClick={() => {
                        setIsDetailsOpen(true); 
                        setViewingOrder(selectedOrder); 
                        setSelectedOrder(null);
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <span className="text-slate-700 font-bold text-sm">View Full Details</span>
                    </div>
                    <svg className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {selectedOrder.status === 'Assigned' && (
                    <>
                        {/* Divider with text */}
                        <div className="flex items-center my-3 px-2">
                            <div className="h-px bg-slate-100 flex-1" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Update Status</span>
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>

                        {/* 2. Complete Order Action (Now Indigo) */}
                        <button 
                            className="group w-full text-left px-4 py-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-all flex items-center gap-4 shadow-sm"
                            onClick={() => {
                                handleOpenCompleteModal(selectedOrder); 
                            }}
                        >
                            <div className="p-2.5 bg-white rounded-lg text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-indigo-900 font-extrabold text-sm block">Mark as Completed</span>
                                <span className="text-indigo-600/70 text-[11px] font-medium block mt-0.5">Finalize and close this job order</span>
                            </div>
                        </button>

                        {/* 3. Cancel Order Action (Keep Rose for warnings) */}
                        <button 
                            className="group w-full text-left px-4 py-4 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all flex items-center gap-4 mt-1"
                            onClick={() => {
                                setCancelOrder(selectedOrder); 
                                setCancelReason(""); 
                                setSelectedOrder(null); 
                            }}
                        >
                            <div className="p-2.5 text-rose-400 group-hover:text-rose-600 group-hover:bg-rose-100 rounded-lg transition-colors">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <span className="text-rose-600 font-bold text-sm">Cancel Order</span>
                        </button>
                    </>
                )}
            </div>
        )}
    </Modal>

    {/* COMPLETION FORM MODAL */}
    <Modal
        isOpen={Boolean(completeOrder)}
        title="Complete Order"
        subtitle="Finalize job duration & timeline"
        onClose={() => setCompleteOrder(null)}
        maxWidth="md"
    >
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                        Date Started
                    </label>
                    <input 
                        type="date"
                        value={formData.date_started}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                        onChange={(e) => setFormData({...formData, date_started: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                        Date Accomplished
                    </label>
                    <input 
                        type="date"
                        value={formData.date_accomplished}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                        onChange={(e) => setFormData({...formData, date_accomplished: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button 
                    onClick={() => setCompleteOrder(null)} 
                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    className="flex-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                    onClick={handleFinalSubmit}
                >
                    Submit Completion
                </button>
            </div>
        </div>
    </Modal>

    {/* CANCELLATION MODAL */}
    <Modal
        isOpen={Boolean(cancelOrder)}
        title="Cancel Order"
        subtitle={`JO Number: #${cancelOrder?.jo_number}`}
        onClose={() => setCancelOrder(null)}
        maxWidth="md"
    >
        <div className="space-y-6">
            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex gap-3">
                <div className="text-rose-500 shrink-0">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-[12px] text-rose-800 leading-relaxed font-medium">
                    <strong>Attention:</strong> Cancelling this order will mark it as inactive. This action is recorded in the system logs.
                </p>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                    Reason for Cancellation
                </label>
                <textarea 
                    rows={4}
                    placeholder="Briefly describe why this job order is being cancelled..."
                    value={cancelReason}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none"
                    onChange={(e) => setCancelReason(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button 
                    onClick={() => setCancelOrder(null)} 
                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Go Back
                </button>
                <button 
                    className="flex-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
                    onClick={handleCancelSubmit}
                >
                    Confirm Cancellation
                </button>
            </div>
        </div>
    </Modal>
      
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