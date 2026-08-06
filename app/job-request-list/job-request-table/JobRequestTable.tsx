"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/app/utils/api/api';
import { RequestActionsModal } from '@/app/components/modal/job-request-modals/RequestActionsModal';
import { RequestDetailsModal } from '@/app/components/modal/job-request-modals/RequestDetailsModal';
import PageSkeleton from '@/app/components/loading/page-skeleton/PageSkeleton';
import { LordIcon } from '@/components/ui/lord-icon';
import { DisapproveModal } from '@/app/components/modal/job-request-modals/DisapproveModal';
import { HeadRejectModal } from '@/app/components/modal/job-request-modals/HeadRejectModal';
import { ScheduleInspectionModal } from '@/app/components/modal/job-request-modals/ScheduleInspectionModal';
import { CreateJobOrderModal } from '@/app/components/modal/job-order-modals/CreateJobOrderModal';
import { Personnel, InspectionFormData } from '@/app/types/JobRequest';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/context/ToastContext';
import { getErrorMessage } from '@/app/utils/errors';
import { Pagination } from '@/components/ui/pagination';
import { MoreVertical, Check, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface JobRequest {
  id: number;
  request_date?: string;
  unit: {
    id: number;
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
  reason_for_disapproval: string | null;
  head_approved?: boolean;
  head_approved_at?: string | null;
}

const JobRequestTable = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isGsuStaff = user?.role === "GSU_STAFF";
  const isUnitUser = user?.role === "UNIT_STAFF" || user?.role === "UNIT_HEAD";
  const isUnitHead = user?.role === "UNIT_HEAD";
  const canAccessReport = isGsuStaff;
  const [activeTab, setActiveTab] = useState('All Requests');
  const tabs = isUnitUser
    ? ['All Requests', 'For Approval', 'Pending', 'Under Inspection', 'Awaiting Materials', 'Approved', 'Disapproved', 'Cancelled']
    : ['All Requests', 'Pending', 'Under Inspection', 'Awaiting Materials', 'Approved', 'Disapproved', 'Cancelled'];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'unit' | 'date' | 'status'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<JobRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

  const [disapproveTarget, setDisapproveTarget] = useState<JobRequest | null>(null);
  const [disapproveReason, setDisapproveReason] = useState('');

  const [rejectTarget, setRejectTarget] = useState<JobRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [inspectionTarget, setInspectionTarget] = useState<JobRequest | null>(null);
  const [inspectionForm, setInspectionForm] = useState<InspectionFormData>({ scheduledDate: '', personnels: [] });
  const [showInspectionConfirm, setShowInspectionConfirm] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [createJobOrderRequest, setCreateJobOrderRequest] = useState<JobRequest | null>(null);

  useEffect(() => {

    const fetchRequests = async () => {
      try {
        const response = await API.get('/job-requests');
        setRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching job requests:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false)
        }, 500);
      }
    };

    const fetchPersonnel = async () => {
      try {
        const response = await API.get('/personnels');
        setPersonnelList(response.data.data);
      } catch (error) {
        console.error('Error fetching personnel:', error);
      }
    };

    fetchRequests();
    fetchPersonnel();
    
  }, []); 

  const handleDisapproveRequest = (req: JobRequest) => {
    setDisapproveTarget(req);
    setDisapproveReason('');
    setSelectedRequest(null);
  };

  const handleSubmitDisapproval = async () => {
    if (!disapproveTarget) return;
    try {
      await API.patch(`/job-requests/${disapproveTarget.id}/status`, {
        status: 'Disapproved',
        reason_for_disapproval: disapproveReason, // ← was 'reason'
      });
      setRequests(prev =>
        prev.map(r => r.id === disapproveTarget.id ? { ...r, status: 'Disapproved' } : r)
      );
      setDisapproveTarget(null);
      setDisapproveReason('');
      success('Request has been disapproved successfully.');
    } catch (err) {
      console.error('Failed to disapprove request:', err);
      error(getErrorMessage(err, 'Failed to disapprove request. Please try again.'));
    }
  };

  const handleOpenCreateJobOrder = (req: JobRequest) => {
    setSelectedRequest(null);
    setCreateJobOrderRequest(req);
  }

  const handleApproveRequest = async (req: JobRequest) => {
    try {
      await API.patch(`/job-requests/${req.id}/head-approval`, {
        approved: true,
      });
      setRequests(prev =>
        prev.map(r => r.id === req.id ? { ...r, head_approved: true, head_approved_at: new Date().toISOString(), status: 'Pending' } : r)
      );
      success('Request approved successfully.');
    } catch (err) {
      console.error('Failed to approve request:', err);
      error(getErrorMessage(err, 'Failed to approve request. Please try again.'));
    }
  };

  const handleSubmitRejection = async () => {
    if (!rejectTarget) return;
    try {
      await API.patch(`/job-requests/${rejectTarget.id}/head-approval`, {
        approved: false,
        reason_for_disapproval: rejectReason,
      });
      setRequests(prev =>
        prev.map(r => r.id === rejectTarget.id ? { ...r, head_approved: false, reason_for_disapproval: rejectReason, status: 'Disapproved' } : r)
      );
      setRejectTarget(null);
      setRejectReason('');
      success('Request rejected successfully.');
    } catch (err) {
      console.error('Failed to reject request:', err);
      error(getErrorMessage(err, 'Failed to reject request. Please try again.'));
    }
  };

  const handleOpenInspectionModal = (req: JobRequest) => {
    setInspectionTarget(req);
    setInspectionForm({ scheduledDate: '', personnels: [] });
    setSelectedRequest(null);
  };

  const handleSubmitInspection = async () => {
    if (!inspectionTarget) return;
    setIsScheduling(true);
    try {
      await API.patch(`/job-requests/${inspectionTarget.id}/status`, { status: 'Under Inspection' });
      await API.post('/inspections', {
        job_request_id: inspectionTarget.id,
        inspection_date: inspectionForm.scheduledDate,
        personnel_ids: inspectionForm.personnels.map(Number),
      });
      setRequests(prev =>
        prev.map(r => r.id === inspectionTarget.id ? { ...r, status: 'Under Inspection' } : r)
      );
      setInspectionTarget(null);
      setShowInspectionConfirm(false);
      success('Inspection scheduled successfully.');
    } catch (err) {
      console.error('Failed to schedule inspection:', err);
      error(getErrorMessage(err, 'Failed to schedule inspection. Please try again.'));
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab !== 'All Requests' && req.status !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const haystack = [
        String(req.id),
        req.unit?.unit_name,
        req.unit?.unit_acronym,
        req.field_work,
        req.specific_work,
        req.status,
        req.request_date,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const toggleSort = (key: 'id' | 'unit' | 'date' | 'status') => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'id' || key === 'date' ? 'desc' : 'asc');
    }
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'unit':
        return (a.unit?.unit_name || '').localeCompare(b.unit?.unit_name || '') * dir;
      case 'status':
        return (a.status || '').localeCompare(b.status || '') * dir;
      case 'date':
        return (new Date(a.request_date || 0).getTime() - new Date(b.request_date || 0).getTime()) * dir;
      case 'id':
      default:
        return (a.id - b.id) * dir;
    }
  });

  const sortIndicator = (key: 'id' | 'unit' | 'date' | 'status') =>
    sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕';

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalItems = sortedRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRequests = sortedRequests.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    const hasForApproval = requests.some(r => r.status === 'For Approval');
    const hasPending = requests.some(r => r.status === 'Pending');
    const hasUnderInspection = requests.some(r => r.status === 'Under Inspection');
    const hasAwaitingMaterials = requests.some(r => r.status === 'Awaiting Materials');

    if (hasForApproval) {
      setActiveTab('For Approval');
    } else if (hasPending) {
      setActiveTab('Pending');
    } else if (hasUnderInspection) {
      setActiveTab('Under Inspection');
    } else if (hasAwaitingMaterials) {
      setActiveTab('Awaiting Materials');
    } else {
      setActiveTab('All Requests');
    }
  }, [requests]);

  if (isLoading) { return < PageSkeleton />; }

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">

        <div className="px-4 sm:px-8 pt-6 pb-3 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Job Requests</h2>
            <p className="text-slate-400 text-[12px] font-medium mt-0.5 dark:text-slate-500">Manage and monitor all incoming job requests</p>
          </div>
          <span className="bg-indigo-50 text-indigo-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-100 whitespace-nowrap shrink-0 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30">
            {filteredRequests.length} {activeTab === 'All Requests' ? 'Total' : activeTab}
          </span>
        </div>

        {/* Search bar */}
        <div className="px-4 sm:px-8 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, unit, field of work, description, status, or date..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Navigation Tabs (From Screenshot) */}
        <div className="flex items-center border-b border-slate-100 px-4 sm:px-8 py-2 gap-5 sm:gap-8 overflow-x-auto dark:border-slate-800">
          {tabs.map((tab) => {
            const count = tab === 'All Requests'
              ? requests.length
              : requests.filter(r => r.status === tab).length;

            return (
              <button
                key={tab}
                className={`py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
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
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 dark:text-slate-500 dark:border-slate-800">
                <th className="px-4 sm:px-8 py-5">
                  <button onClick={() => toggleSort('id')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">
                    ID <span className="text-[9px]">{sortIndicator('id')}</span>
                  </button>
                </th>
                <th className="px-4 py-5">
                  <button onClick={() => toggleSort('unit')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">
                    Requesting Unit <span className="text-[9px]">{sortIndicator('unit')}</span>
                  </button>
                </th>
                <th className="px-4 py-5">Field of Work</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5 text-center">
                  <button onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">
                    Status <span className="text-[9px]">{sortIndicator('status')}</span>
                  </button>
                </th>
                <th className="px-4 sm:px-8 py-5 text-right">
                  <button onClick={() => toggleSort('date')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">
                    Date <span className="text-[9px]">{sortIndicator('date')}</span>
                  </button>
                </th>
                <th className="px-4 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group dark:hover:bg-slate-800/50">
                  
                  {/* ID */}
                  <td className="px-4 sm:px-8 py-6 text-slate-400 text-sm font-medium tabular-nums whitespace-nowrap dark:text-slate-500">
                    #{req.id}
                  </td>

                  {/* Requesting Unit */}
                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm leading-tight dark:text-slate-200">
                      {req.unit?.unit_name}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 font-medium dark:text-slate-500">
                      {req.unit?.unit_acronym} • {req.unit?.location?.location_name}
                    </div>
                  </td>

                  {/* Field of Work */}
                  <td className="px-4 py-6">
                    <span className="text-slate-600 text-[13px] font-semibold bg-slate-100 px-2.5 py-1 rounded dark:text-slate-300 dark:bg-slate-800">
                      {req.field_work}
                    </span>
                  </td>
                  
                  {/* Work Description */}
                  <td className="px-4 py-6 max-w-50">
                    <div className="font-bold text-slate-700 truncate text-sm dark:text-slate-200" title={req.specific_work}>
                      {req.specific_work}
                    </div>
                    <div className="text-indigo-500 text-[10px] font-bold uppercase mt-1 dark:text-indigo-400">
                      Est: {req.estimated_duration_value} {req.estimated_duration_unit}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tight inline-block min-w-20 ${
                      req.status === 'For Approval'        ? 'bg-violet-100 text-violet-600 border border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30' :
                      req.status === 'Approved'           ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' :
                      req.status === 'Pending'            ? 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30' :
                      req.status === 'Under Inspection'   ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' :
                      req.status === 'Awaiting Materials' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300' :
                      req.status === 'Disapproved'        ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' :
                      req.status === 'Cancelled'          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {req.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 sm:px-8 py-6 text-slate-500 text-sm tabular-nums whitespace-nowrap dark:text-slate-400">
                    {req.request_date ? new Date(req.request_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Action Cell */}
                  <td className="px-4 py-6 text-right">
                    <div className="flex justify-end items-center">
                      {isUnitHead && req.status === 'For Approval' && req.unit?.id === user?.unit_id ? (
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              type="button"
                              aria-label="Request actions"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={6}
                              className="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                            >
                              <DropdownMenu.Item
                                onSelect={() => handleApproveRequest(req)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none cursor-pointer select-none hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300 dark:focus:bg-emerald-500/15 dark:focus:text-emerald-300"
                              >
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Approve
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => {
                                  setRejectTarget(req);
                                  setRejectReason('');
                                }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none cursor-pointer select-none hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 dark:focus:bg-rose-500/15 dark:focus:text-rose-300"
                              >
                                <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                Reject
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      ) : isUnitUser ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingRequest(req);
                            setSelectedRequest(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View Details
                        </button>
                      ) : ['Pending', 'Under Inspection', 'Awaiting Materials'].includes(req.status) ? (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          aria-label="Request actions"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingRequest(req);
                            setSelectedRequest(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {totalItems === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <LordIcon icon="hmpomorl" trigger="loop" className="w-10 h-10" primary="#94a3b8" secondary="#cbd5e1" />
                      <div className="text-slate-500 text-sm font-semibold dark:text-slate-400">No job requests found</div>
                      <div className="text-slate-400 text-xs dark:text-slate-500">
                        {searchQuery
                          ? `No results matching "${searchQuery}" in ${activeTab}.`
                          : `There are no ${activeTab === 'All Requests' ? 'requests' : activeTab.toLowerCase()} to show.`}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      <RequestActionsModal
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onViewDetails={(req) => {
          setViewingRequest(req);
          setSelectedRequest(null);
        }}
        onDisapprove={(req) => handleDisapproveRequest(req)}
        onCreateJobOrder={(req) => handleOpenCreateJobOrder(req)}
        onScheduleInspection={(req) => {
          setSelectedRequest(null);
          handleOpenInspectionModal(req);
        }}
        onSeeInspection={() => {
          setSelectedRequest(null);
          router.push('/schedule-inspection');
        }}
        onSeePrRis={() => {
          setSelectedRequest(null);
          router.push('/pr-ris');
        }}
      />

      <CreateJobOrderModal
        open={Boolean(createJobOrderRequest)}
        request={createJobOrderRequest}
        onClose={() => setCreateJobOrderRequest(null)}
      />

     <RequestDetailsModal
        viewingRequest={viewingRequest}
        onClose={() => setViewingRequest(null)}
      />

      <DisapproveModal
        disapproveTarget={disapproveTarget}
        disapproveReason={disapproveReason}
        onReasonChange={(reason) => setDisapproveReason(reason)}
        onClose={() => setDisapproveTarget(null)}
        onConfirm={handleSubmitDisapproval}
      />

      <HeadRejectModal
        rejectTarget={rejectTarget}
        rejectReason={rejectReason}
        onReasonChange={(reason) => setRejectReason(reason)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleSubmitRejection}
      />

      <ScheduleInspectionModal
        inspectionTarget={inspectionTarget}
        inspectionForm={inspectionForm}
        personnelList={personnelList}
        isSubmitting={isScheduling}
        showConfirm={showInspectionConfirm}
        onClose={() => setInspectionTarget(null)}
        onFormChange={(form) => setInspectionForm(form)}
        onConfirmOpen={() => setShowInspectionConfirm(true)}
        onConfirm={handleSubmitInspection}
        onConfirmClose={() => setShowInspectionConfirm(false)}
      />

      {/* Floating Report Button */}
      {canAccessReport && (
        <button
          onClick={() => router.push('/accomplishment-report')}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 text-sm font-bold transition-all dark:shadow-none"
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

export default JobRequestTable;