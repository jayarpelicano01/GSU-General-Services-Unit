"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { API } from '@/app/utils/api/api';
import { useRouter } from "next/navigation";
import Modal from '@/app/components/modal/modal';
import { useAuth } from '@/app/context/AuthContext';
import { JobOrderDetailsModal } from '@/app/components/modal/job-order-modals/JobOrderDetailsModal';

interface JobRequest {
        id: number;
        request_date: string;
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
    date_accomplished?: string;
    status: string;
}

const JobOrderTable = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All Orders');
    const tabs = ['All Orders', 'Assigned', 'Pending', 'Completed', 'Cancelled'];
    const [orders, setOrders] = useState<JobOrder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'jo' | 'unit' | 'date' | 'status'>('jo');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    
    const today = new Date().toISOString().split('T')[0];


    const [selectedOrder, setSelectedOrder] = useState<JobOrder | null>(null);
    const [completeOrder, setCompleteOrder] = useState<JobOrder | null>(null);

    const [viewingOrder, setViewingOrder] = useState<JobOrder | null>(null);

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
            const response = await API.patch(`/job-orders/${cancelOrder?.id}/status`, {
                status: "Cancelled",
                reason: cancelReason
            });

            if (response.data.status === "success") {
                setCancelOrder(null);
                fetchOrders();
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
        }
    };

    const handleIssueOrder = async (order: JobOrder) => {
        try {
            const response = await API.patch(`/job-orders/${order.id}/status`, {
                status: "Assigned"
            });

            const jobOrderData = response.data.data;
            const jobRequestData = jobOrderData.job_request;

            const updatedRequestData = { 
                ...jobRequestData, 
                jo_number: jobOrderData.jo_number 
            };

            if (response.data.status === "success") {
                setSelectedOrder(null);
                localStorage.setItem("job-request", JSON.stringify(updatedRequestData));
                localStorage.setItem("job-order", JSON.stringify(jobOrderData));
                router.push(`/job-order/print-job-order`);
            }
            
        } catch (error) {
            console.error("Error issuing order:", error);
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
            startDateValue = new Date(order.date_started).toISOString().split('T')[0];
        }
        
        setFormData({
            date_started: startDateValue,
            date_accomplished: todayStr
        });
    };


    const router = useRouter();
    const isGsuStaff = user?.role === "GSU_STAFF";
    const isUnitUser = user?.role === "UNIT_STAFF" || user?.role === "UNIT_HEAD";
    const canAccessReport = isGsuStaff;

    const handleGenerateReport = () => {
        router.push('/accomplishment-report');
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab !== 'All Orders' && order.status !== activeTab) return false;

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            const haystack = [
                String(order.jo_number),
                String(order.id),
                order.job_request?.unit?.unit_name,
                order.job_request?.unit?.unit_acronym,
                order.job_request?.field_work,
                order.specific_work,
                order.status,
                order.date_started,
            ].filter(Boolean).join(' ').toLowerCase();
            if (!haystack.includes(q)) return false;
        }

        return true;
    });

    const toggleSort = (key: 'jo' | 'unit' | 'date' | 'status') => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir(key === 'jo' || key === 'date' ? 'desc' : 'asc');
        }
    };

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortKey) {
            case 'unit':
                return (a.job_request?.unit?.unit_name || '').localeCompare(b.job_request?.unit?.unit_name || '') * dir;
            case 'status':
                return (a.status || '').localeCompare(b.status || '') * dir;
            case 'date':
                return (new Date(a.date_started || 0).getTime() - new Date(b.date_started || 0).getTime()) * dir;
            case 'jo':
            default:
                return ((a.jo_number || 0) - (b.jo_number || 0)) * dir;
        }
    });

    const sortIndicator = (key: 'jo' | 'unit' | 'date' | 'status') =>
        sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕';

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
            fetchOrders();

            alert("Order completed!");
        } catch (error) {
            console.error("Submit failed:", error);
        }
    };


  return (
    
    <div className="min-h-screen bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="px-4 sm:px-8 pt-6 pb-3 flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-slate-800 text-lg font-extrabold tracking-tight">Job Orders</h2>
                    <p className="text-slate-400 text-[12px] font-medium mt-0.5">Manage and monitor all job orders</p>
                </div>
                <span className="bg-indigo-50 text-indigo-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-100 whitespace-nowrap shrink-0">
                    {filteredOrders.length} {activeTab === 'All Orders' ? 'Total' : activeTab}
                </span>
            </div>

            {/* Search bar */}
            <div className="px-4 sm:px-8 py-3 border-b border-slate-100">
                <div className="relative max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by JO no., unit, field of work, description, status, or date..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
            </div>
        
            {/* Navigation Tabs (From Screenshot) */}
            <div className="flex items-center border-b border-slate-100 px-4 sm:px-8 py-2 gap-5 sm:gap-8 overflow-x-auto">
                {tabs.map((tab) => {
                    const count = tab === 'All Orders'
                        ? orders.length
                        : orders.filter(o => o.status === tab).length;

                    return (
                        <button
                            key={tab}
                            className={`py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
            
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-4 sm:px-8 py-5">
                  <button onClick={() => toggleSort('jo')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    JO No. <span className="text-[9px]">{sortIndicator('jo')}</span>
                  </button>
                </th>
                <th className="px-4 py-5">
                  <button onClick={() => toggleSort('unit')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Requesting Unit <span className="text-[9px]">{sortIndicator('unit')}</span>
                  </button>
                </th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5 text-center">
                  <button onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Status <span className="text-[9px]">{sortIndicator('status')}</span>
                  </button>
                </th>
                <th className="px-4 sm:px-8 py-5 text-right">
                  <button onClick={() => toggleSort('date')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Date <span className="text-[9px]">{sortIndicator('date')}</span>
                  </button>
                </th>
                <th className="px-4 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* ID */}
                  <td className="px-4 sm:px-8 py-6 text-slate-400 text-sm font-medium tabular-nums whitespace-nowrap">
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
                    <div className="font-bold text-slate-700 text-sm" title={order.specific_work}>
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

                  {/* Date */}
                  <td className="px-4 sm:px-8 py-6 text-slate-500 text-sm tabular-nums whitespace-nowrap">
                    {order.date_started ? new Date(order.date_started).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Action */}
                <td className="px-4 py-6 text-right">
                    <div className="flex justify-end items-center">
                        {isUnitUser ? (
                        /* View only for unit staff/head */
                        <button 
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                            View Details
                        </button>
                        ) : order.status === 'Assigned' ? (
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
                        ) : order.status === 'Pending' ? (
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
                            onClick={() => setViewingOrder(order)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                            View Details
                        </button>
                        )}
                    </div>
                </td>
                </tr>
              ))}
              {sortedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <div className="text-slate-400 text-sm font-medium">
                      No job orders found{searchQuery ? ` matching "${searchQuery}"` : ''} in {activeTab}.
                    </div>
                  </td>
                </tr>
              )}
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
        maxWidth="lg"
    >
        {selectedOrder && (
            <div className="flex flex-col gap-2">

                {/* Status + summary header */}
                <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Description</p>
                        <p className="text-sm font-bold text-slate-700 truncate mt-0.5">{selectedOrder.specific_work}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{selectedOrder.job_request?.field_work} • {selectedOrder.job_request?.unit?.unit_acronym}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block shrink-0 ${
                        selectedOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        selectedOrder.status === 'Assigned' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                        selectedOrder.status === 'Ongoing' ? 'bg-blue-100 text-blue-600' :
                        selectedOrder.status === 'Pending' ? 'bg-slate-100 text-slate-600' :
                        'bg-rose-100 text-rose-600'
                    }`}>
                        {selectedOrder.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                </div>

                {/* 1. View Details Action */}
                <button 
                    className="group w-full text-left px-4 py-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-between" 
                    onClick={() => {
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
                {selectedOrder.status === 'Pending' && (
                    <>
                        {/* Divider with text */}
                        <div className="flex items-center my-3 px-2">
                            <div className="h-px bg-slate-100 flex-1" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Update Status</span>
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>

                        {/* 2. Complete Order Action (Now Indigo) */}
                        <button 
                            className="group w-full text-left px-4 py-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all flex items-center gap-4 shadow-sm"
                            onClick={() => {
                                handleIssueOrder(selectedOrder); 
                            }}
                        >
                            <div className="p-2.5 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-blue-900 font-extrabold text-sm block">Issue Job Order</span>
                                <span className="text-blue-600/70 text-[11px] font-medium block mt-0.5">Officially dispatch this job order</span>
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
      
    <JobOrderDetailsModal viewingOrder={viewingOrder} onClose={() => setViewingOrder(null)} />

      {/* Floating Report Button */}
      {canAccessReport && (
        <button
          onClick={handleGenerateReport}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 text-sm font-bold transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          Generate Report
        </button>
      )}

    </div>
  );
};

export default JobOrderTable;