"use client";
import Image from 'next/image';
import React, { useState } from 'react';

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
  assessment_results: string;
  estimated_duration_value: number;
  estimated_duration_unit: string;
  status_of_materials: string;
  status: string;
}

interface Personnel {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  field: string;
}

interface InspectionSchedule {
    request: JobRequest;
    scheduledDate: Date;
    personnels: Personnel[];
    recommendation?: string;
}

const InspectionReport = () => {
    const [schedule, setSchedule] = useState<InspectionSchedule | null>(null);

    
    const location = schedule?.request.unit?.location.location_name || '';
    const head = schedule?.request.unit?.head;
    const headFullName = head ? `${head.first_name} ${head.middle_name || ''} ${head.last_name} ${head.suffix || ''}` : '';
    const unitName = schedule?.request.unit ? `${schedule.request.unit.unit_name} ${schedule.request.unit.unit_acronym? `(${schedule.request.unit.unit_acronym})` : ''}` : '';

    function getSchedule() {
        const fetchedSchedule = localStorage.getItem('inspection-schedule');
        setSchedule(fetchedSchedule ? JSON.parse(fetchedSchedule) : {});
    }

    React.useEffect(() => {
        getSchedule();
    }, []);

    console.log(schedule);
    
    const dateString = schedule?.scheduledDate
    ? new Date(schedule.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    : '';


    return (
        <div 
            style={{ padding: "15mm 20mm 15mm 20mm" }} 
            className="print-header text-black font-sans w-[210mm] min-h-[297mm] mx-auto overflow-hidden bg-white"
        >
            {/* Header */}
            <div className="flex justify-center items-center relative mb-2">
                <Image 
                    src="/UEP-Logo.png" 
                    loading='eager'
                    alt="UEP Logo" 
                    width={90}
                    height={90}
                    className="absolute left-0" 
                />
                <div className="text-center text-[13px] leading-snug">
                    <p>Republic of the Philippines</p>
                    <p className="font-bold">UNIVERSITY OF EASTERN PHILIPPINES</p>
                    <p className="italic">University Town, Northern Samar</p>
                    <p className="text-[11px]">
                        Website: <span style={{ color: '#0056b3' }}>http://uep.edu.ph</span>{' '}
                        Email: <span style={{ color: '#0056b3' }}>uepnsofficial@gmail.com</span>
                    </p>
                </div>
                <div className="absolute right-0 flex items-center gap-1">
                    <Image src="/socotec.jpg"       alt="Socotec Logo"         width={70} height={70} />
                    <Image src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" width={70} height={70} />
                </div>
            </div>

            {/* Blue divider */}
            <div style={{ backgroundColor: '#0056b3' }} className="bg-blue-header h-1.75 mt-4 mb-0.5" />

            {/* Title */}
            <div className="text-center mb-2 mt-3 ">
                <p className="font-bold text-[13px] tracking-widest uppercase">General Services Unit</p>
                <p className="font-bold text-[28px] tracking-wide uppercase mt-1">Inspection Report</p>
            </div>

            {/* Form Fields */}
            <div className="mt-5 space-y-2.5 text-[12px]">
                {[
                    { label: "SECTION", value: unitName },
                    { label: "DATE INSPECTED", value: dateString },
                    { label: "LOCATION OF UNIT / INSPECTED", value: location },
                    { label: "NUMBER OF UNIT / INSPECTED", value: "" },
                    { label: "TYPE OF UNIT / INSPECTED", value: "" },
                ].map(({label, value}) => (
                    <div key={label} className="flex items-end gap-2">
                        <span className="font-bold shrink-0 w-52.5">{label}</span>
                        <span className="shrink-0">:</span>
                        <span className="flex-1 border-b border-black block text-[13px]" style={{ minHeight: '14px' }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* Remarks */}
            <div className="mt-8 text-[12px]">
                <div className="flex items-end gap-2">
                    <span className="font-bold shrink-0 w-52.5">REMARKS</span>
                    <span className="shrink-0">:</span>
                    <span className="flex-1 border-b border-black block text-[13px]" style={{ minHeight: '14px' }}>
                        {schedule?.request?.assessment_results || ''}
                    </span>
                </div>
                <div className="mt-3 space-y-4.5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border-b border-black w-full" style={{ minHeight: '14px' }} />
                    ))}
                </div>
            </div>

            {/* Recommendation */}
            <div className="mt-8 text-[12px]">
                <div className="flex items-end gap-2">
                    <span className="font-bold shrink-0 w-52.5">RECOMMENDATION / SUGGESTION</span>
                    <span className="shrink-0">:</span>
                    <span className="flex-1 border-b border-black block text-[13px]" style={{ minHeight: '14px' }}>
                        {schedule?.recommendation || ''}
                    </span>
                </div>
                <div className="mt-3 space-y-4.5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border-b border-black w-full" style={{ minHeight: '14px' }} />
                    ))}
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 flex justify-between text-[12px]">
                {/* Left — Acknowledgment */}
                <div className="w-[45%]">
                    <p className="mb-8 text-center">Acknowledgment</p>
                    <div className='ml-12.5'>
                        <div className="border-b border-black w-50 text-center"><p className= "text-[13px]">{headFullName}</p></div>
                        <p className="mt-1 ml-9">Head, Requesting Unit</p>
                    </div>
                    <div className="mt-6 mx-10 flex items-end gap-1">
                        <span className="shrink-0">Date:</span>
                        <div className="border-b border-black flex-1" style={{ minHeight: '14px' }} />
                    </div>
                </div>

                {/* Inspected by lines — one per personnel */}
                <div className="ml-10 w-[45%]">
                    <p className="mb-8">Inspected by:</p>
                    
                    {schedule?.personnels.map((person) => (
                        <div key={person.id} className="mt-3">
                            <div className="  text-center border-b border-black w-63">
                                <p className='text-[13px]'>{person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''}</p>
                            </div>
                        </div>
                    ))}

                    <div className="mt-8">
                        <p>Noted by:</p>
                        <div className="flex flex-col justify-center items-center">
                            <p className="font-bold mt-3">ARNOLD A. SALES, LPT, MAED-PE</p>
                            <p>Head, General Services Unit</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FOOTER TABLE (The Blue Box) */}
            <div style={{borderWidth: '2px'}} className="mt-8 border border-blue-400 grid grid-cols-3 tex text-[11px] font-bold uppercase overflow-hidden">
                <div style={{}} className="p-2 border-r border-blue-400 text-[11px]">
                    DOCUMENT NO: <br />
                    <div className="flex justify-center text-center w-full">
                        <span className="border-b border-black w-40">UEP-GSU-FM-010</span>

                    </div>
                </div>
                <div style={{borderWidth: '0 1px 0 1px'}} className="border-r p-2 border-blue-400 flex text-[11px] flex-col justify-center">
                    REVISION NO: <br />
                    <div className="flex justify-center text-center w-full">
                    <span className="border-b border-black w-40">00</span>
                    </div>
                    </div>
                <div style={{borderWidth: '0 0 0 1px '}} className="p-2 border-blue-400 text-[11px]">
                    EFFECTIVITY DATE: <br />
                    <div className="flex justify-center text-center">
                    <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    .bg-blue-header {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}

export default InspectionReport;