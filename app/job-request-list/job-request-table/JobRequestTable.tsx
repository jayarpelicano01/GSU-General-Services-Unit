"use client"; // Required for useState

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/app/utils/api/api';
import { RequestActionsModal } from '@/app/components/modal/job-request-modals/RequestActionsModal';
import { RequestDetailsModal } from '@/app/components/modal/job-request-modals/RequestDetailsModal';
import { ScheduleInspectionModal } from '@/app/components/modal/job-request-modals/ScheduleInspectionModal';
import { InspectionResultsModal } from '@/app/components/modal/job-request-modals/InspectionResultsModal';
import PageSkeleton from '@/app/components/loading/page-skeleton/PageSkeleton';
import { DisapproveModal } from '@/app/components/modal/job-request-modals/DisapproveModal';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/context/ToastContext';
import { getErrorMessage } from '@/app/utils/errors';

interface JobRequest {
  id: number;
  request_date?: string;
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
  reason_for_disapproval: string | null;
}

interface Personnel {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  field: string;
}

interface InspectionFormData {
  scheduledDate: string;
  personnels: string[];
}

const JobRequestTable = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isGsuStaff = user?.role === "GSU_STAFF";
  const isUnitUser = user?.role === "UNIT_STAFF" || user?.role === "UNIT_HEAD";
  const canAccessReport = isGsuStaff;
  const [activeTab, setActiveTab] = useState('All Requests');
  const tabs = ['All Requests', 'Pending', 'Under Inspection', 'Awaiting Materials', 'Approved', 'Disapproved', 'Cancelled'];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'unit' | 'date' | 'status'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<JobRequest | null>(null);
  const [showInspectionConfirm, setShowInspectionConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [disapproveTarget, setDisapproveTarget] = useState<JobRequest | null>(null);
  const [disapproveReason, setDisapproveReason] = useState('');

  const [inspectionTarget, setInspectionTarget] = useState<JobRequest | null>(null);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [inspectionForm, setInspectionForm] = useState<InspectionFormData>({
    scheduledDate: '',
    personnels: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    fetchRequests();
    
  }, []); 

  if (viewingRequest) {
    console.log(viewingRequest);
    
  }

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

  const handleNavigateToJobOrderForm = (requestId: number) => {
    localStorage.setItem('selectedRequestId', requestId.toString());
    router.push('/job-order');
  }

  const [inspectionResultTarget, setInspectionResultTarget] = useState<JobRequest | null>(null);
  const [inspectionResultForm, setInspectionResultForm] = useState({
    assessment_results: '',
    estimated_duration_value: 0,
    estimated_duration_unit: 'Hours' as 'Hours' | 'Days',
    status_of_materials: null as 'Available' | 'Not Available' | null,
  });

  const handleSubmitInspectionResult = async () => {
    if (!inspectionResultTarget) return;
    try {
      await API.patch(`/job-requests/${inspectionResultTarget.id}`, {
        assessment_results: inspectionResultForm.assessment_results,
        estimated_duration_value: inspectionResultForm.estimated_duration_value,
        estimated_duration_unit: inspectionResultForm.estimated_duration_unit,
        status_of_materials: inspectionResultForm.status_of_materials,
        status: inspectionResultForm.status_of_materials === 'Available' ? 'Approved' : 'Awaiting Materials',
      });
      setRequests(prev =>
        prev.map(r => r.id === inspectionResultTarget.id ? {
          ...r,
          status: inspectionResultForm.status_of_materials === 'Available' ? 'Approved' : 'Awaiting Materials',
          status_of_materials: inspectionResultForm.status_of_materials ?? r.status_of_materials,
        } : r)
      );
      setInspectionResultTarget(null);
      success('Inspection results submitted successfully.');
    } catch (err) {
      console.error('Failed to submit inspection results:', err);
      error(getErrorMessage(err, 'Failed to submit inspection results. Please try again.'));
    }
  };

  const handleSubmitInspection = async () => {
    if (!inspectionTarget) return;
    setIsSubmitting(true);
    try {
      await API.patch(`/job-requests/${inspectionTarget.id}/status`, {
        status: 'Under Inspection',
      //   scheduled_date: inspectionForm.scheduledDate,
      //   personnel_ids: inspectionForm.personnels,
      });
      setRequests(prev =>
        prev.map(r => r.id === inspectionTarget.id ? { ...r, status: 'Under Inspection' } : r)
      );
      // setInspectionTarget(null);
      localStorage.setItem('inspection-schedule', JSON.stringify({
        request: inspectionTarget,
        scheduledDate: inspectionForm.scheduledDate,
        personnels: inspectionForm.personnels.map(id =>
          personnelList.find(p => String(p.id) === id)
      ),
      }));
      success('Inspection scheduled successfully.');
      router.push('/inspection');
    } catch (err) {
      console.error('Failed to schedule inspection:', err);
      error(getErrorMessage(err, 'Failed to schedule inspection. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenInspectionModal = (req: JobRequest) => {
    setInspectionTarget(req);
    setInspectionForm({
      scheduledDate: new Date().toISOString().split('T')[0],
      personnels: [],
    });
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
    const hasPending = requests.some(r => r.status === 'Pending');
    const hasUnderInspection = requests.some(r => r.status === 'Under Inspection');
    const hasAwaitingMaterials = requests.some(r => r.status === 'Awaiting Materials');

    if (hasPending) {
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
    <div className="min-h-screen bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-4 sm:px-8 pt-6 pb-3 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-800">Job Requests</h2>
            <p className="text-slate-400 text-[12px] font-medium mt-0.5">Manage and monitor all incoming job requests</p>
          </div>
          <span className="bg-indigo-50 text-indigo-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-100 whitespace-nowrap shrink-0">
            {filteredRequests.length} {activeTab === 'All Requests' ? 'Total' : activeTab}
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
              placeholder="Search by ID, unit, field of work, description, status, or date..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Navigation Tabs (From Screenshot) */}
        <div className="flex items-center border-b border-slate-100 px-4 sm:px-8 py-2 gap-5 sm:gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const count = tab === 'All Requests'
              ? requests.length
              : requests.filter(r => r.status === tab).length;

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
                  <button onClick={() => toggleSort('id')} className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    ID <span className="text-[9px]">{sortIndicator('id')}</span>
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
              {sortedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* ID */}
                  <td className="px-4 sm:px-8 py-6 text-slate-400 text-sm font-medium tabular-nums whitespace-nowrap">
                    #{req.id}
                  </td>

                  {/* Requesting Unit */}
                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm leading-tight">
                      {req.unit?.unit_name}
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

                  {/* Status */}
                  <td className="px-4 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight inline-block min-w-20 ${
                      req.status === 'Approved'           ? 'bg-emerald-100 text-emerald-600' :
                      req.status === 'Pending'            ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                      req.status === 'Under Inspection'   ? 'bg-blue-100 text-blue-600' :
                      req.status === 'Awaiting Materials' ? 'bg-orange-100 text-orange-600' :
                      req.status === 'Disapproved'        ? 'bg-rose-100 text-rose-600' :
                      req.status === 'Cancelled'          ? 'bg-slate-100 text-slate-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {req.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 sm:px-8 py-6 text-slate-500 text-sm tabular-nums whitespace-nowrap">
                    {req.request_date ? new Date(req.request_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Action */}
                  {/* Action Cell */}
                  <td className="px-4 py-6 text-right">
                    <div className="flex justify-end items-center">
                      {isUnitUser ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingRequest(req);
                            setSelectedRequest(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                          View Details
                        </button>
                      ) : req.status === 'Pending' || req.status === 'Under Inspection' || req.status === 'Approved' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingRequest(req);
                            setSelectedRequest(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold text-[11px] uppercase tracking-wider underline underline-offset-4"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <div className="text-slate-400 text-sm font-medium">
                      No job requests found{searchQuery ? ` matching "${searchQuery}"` : ''} in {activeTab}.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestActionsModal
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onViewDetails={(req) => {
          setViewingRequest(req);
          setSelectedRequest(null);
        }}
        onScheduleInspection={(req) => {
          setSelectedRequest(null);
          handleOpenInspectionModal(req);
        }}
        onDisapprove={(req) => handleDisapproveRequest(req)}
        onSubmitResults={(req) => {
          setSelectedRequest(null);
          setInspectionResultTarget(req);
          setInspectionResultForm({
            assessment_results: '',
            estimated_duration_value: 0,
            estimated_duration_unit: 'Hours',
            status_of_materials: null,
          });
        }}
        onCreateJobOrder={(req) => {
          setSelectedRequest(null);
          handleNavigateToJobOrderForm(req.id);
        }}
      />

     <RequestDetailsModal
        viewingRequest={viewingRequest}
        onClose={() => setViewingRequest(null)}
      />

      <ScheduleInspectionModal
        inspectionTarget={inspectionTarget}
        inspectionForm={inspectionForm}
        personnelList={personnelList}
        isSubmitting={isSubmitting}
        showConfirm={showInspectionConfirm}
        onClose={() => setInspectionTarget(null)}
        onFormChange={(form) => setInspectionForm(form)}
        onConfirmOpen={() => setShowInspectionConfirm(true)}
        onConfirm={() => {
          setShowInspectionConfirm(false);
          handleSubmitInspection();
        }}
        onConfirmClose={() => setShowInspectionConfirm(false)}
      />

      <InspectionResultsModal
        inspectionResultTarget={inspectionResultTarget}
        inspectionResultForm={inspectionResultForm}
        isSubmitting={isSubmitting}
        onClose={() => setInspectionResultTarget(null)}
        onFormChange={(form) => setInspectionResultForm(form)}
        onCreateJobOrder={() => {
          handleSubmitInspectionResult();
          handleNavigateToJobOrderForm(inspectionResultTarget!.id);
        }}
        onRequestPurchase={() => {
          handleSubmitInspectionResult();
          // TODO: router.push('/purchase-request')
        }}
      />

      <DisapproveModal
        disapproveTarget={disapproveTarget}
        disapproveReason={disapproveReason}
        onReasonChange={(reason) => setDisapproveReason(reason)}
        onClose={() => setDisapproveTarget(null)}
        onConfirm={handleSubmitDisapproval}
      />

      {/* Floating Report Button */}
      {canAccessReport && (
        <button
          onClick={() => router.push('/accomplishment-report')}
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

export default JobRequestTable;