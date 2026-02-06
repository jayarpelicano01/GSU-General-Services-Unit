import React from 'react';

const JobRequestTable = () => {
  // Mock data based on your GSU Job Request form structure
  const mockRequests = [
    {
      id: "#01",
      requestingUnit: "College of Science",
      location: "UEP Main Campus",
      fieldWork: "Electrical",
      specificWork: "Repair of air-conditioning unit in Laboratory 101",
      duration: "2",
      unit: "Days",
      statusOfMaterials: "available",
      status: "COMPLETED"
    },
    {
      id: "#02",
      requestingUnit: "College of Engineering",
      location: "UEP Main Campus",
      fieldWork: "Plumbing",
      specificWork: "Leaking pipes in the faculty restroom",
      duration: "5",
      unit: "Hours",
      statusOfMaterials: "not-available",
      status: "PENDING"
    },
    {
      id: "#03",
      requestingUnit: "Business Ad",
      location: "UEP Main Campus",
      fieldWork: "Carpentry",
      specificWork: "Repair of broken faculty desks",
      duration: "3",
      unit: "Days",
      statusOfMaterials: "available",
      status: "ONGOING"
    },
    {
      id: "#04",
      requestingUnit: "Registrar Office",
      location: "UEP Main Campus",
      fieldWork: "Masonry",
      specificWork: "Fixing floor tiles at the entrance",
      duration: "1",
      unit: "Days",
      statusOfMaterials: "not-available",
      status: "TERMINATED"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-8">
      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Navigation Tabs (From Screenshot) */}
        <div className="flex items-center border-b border-slate-100 px-8 py-2 gap-8">
          <button className="text-indigo-600 font-bold border-b-2 border-indigo-600 py-4 text-sm">All Requests</button>
          <button className="text-slate-400 font-medium py-4 text-sm hover:text-slate-600">Completed</button>
          <button className="text-slate-400 font-medium py-4 text-sm hover:text-slate-600">Pending</button>
          <button className="text-slate-400 font-medium py-4 text-sm hover:text-slate-600">Ongoing</button>
          <button className="text-slate-400 font-medium py-4 text-sm hover:text-slate-600">Terminated</button>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">ID</th>
                <th className="px-4 py-5">Work Description</th>
                <th className="px-4 py-5">Field Work</th>
                <th className="px-4 py-5">Requesting Unit</th>
                <th className="px-4 py-5">Materials</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-slate-400 text-sm font-medium">{req.id}</td>
                  
                  {/* Work Description (Primary Column) */}
                  <td className="px-4 py-6 max-w-xs">
                    <div className="font-bold text-slate-700 truncate">{req.specificWork}</div>
                    <div className="text-indigo-500 text-xs mt-0.5">Est: {req.duration} {req.unit}</div>
                  </td>

                  {/* Field Work */}
                  <td className="px-4 py-6">
                    <span className="text-slate-600 text-sm font-medium">{req.fieldWork}</span>
                  </td>

                  {/* Requesting Unit */}
                  <td className="px-4 py-6">
                    <div className="text-slate-700 font-bold text-sm">{req.requestingUnit}</div>
                    <div className="text-slate-400 text-[11px] italic">{req.location}</div>
                  </td>

                  {/* Materials Status Badge */}
                  <td className="px-4 py-6">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded border ${
                      req.statusOfMaterials === 'available' 
                      ? 'text-emerald-600 border-emerald-100 bg-emerald-50' 
                      : 'text-amber-600 border-amber-100 bg-amber-50'
                    }`}>
                      {req.statusOfMaterials.replace('-', ' ')}
                    </span>
                  </td>

                  {/* Overall Status Badge (From Screenshot Styles) */}
                  <td className="px-4 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                      req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                      req.status === 'ONGOING' ? 'bg-blue-100 text-blue-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>

                  {/* Action Menu Dot */}
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
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