"use client";
import Image from 'next/image';

interface Unit {
    unit_name: string;
    unit_acronym: string;
}

interface JobRequest {
    id: number;
    request_date?: string | Date;
    unit: Unit;
    field_work: string;
    specific_work: string;
    estimated_duration_value?: number;
    estimated_duration_unit?: string;
    status: string;
}

interface Props {
    selectedField: string;
    JobRequests: JobRequest[];
    month: number | '';
    year: number | '';
}

const JobRequestReport = ({ selectedField, JobRequests, month, year }: Props) => {
    const monthLabel = month
        ? new Date(`${year}-${String(month).padStart(2, '0')}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
        : null;

    const reportTitle = month
        ? `JOB REQUEST MONITORING REPORT (${monthLabel})`
        : year
        ? `CONSOLIDATED JOB REQUEST MONITORING REPORT YEAR ${year}`
        : 'CONSOLIDATED JOB REQUEST MONITORING REPORT';

    return (
        <div
            style={{ padding: "10mm 10mm 10mm 10mm" }}
            className="print-header bg-white text-black font-sans w-[297mm] min-h-[210mm] mx-auto overflow-hidden"
        >
            <div className="flex justify-center items-center relative mb-2">
                <Image
                    src="/UEP-Logo.png"
                    loading='eager'
                    alt="UEP Logo"
                    width={80}
                    height={80}
                    className="w-20 h-20 absolute left-20"
                />
                <div className="text-center">
                    <p className="text-md">Republic of the Philippines</p>
                    <p className="font-bold text-md leading-tight">UNIVERSITY OF EASTERN PHILIPPINES</p>
                    <p className="text-md italic">University Town, Northern Samar</p>
                    <p className="text-[11px]">Website: <span style={{ color: '#0056b3'}}>http://uep.edu.ph</span> Email: <span style={{ color: '#0056b3'}}>uepnsofficial@gmail.com</span></p>
                </div>
                <Image
                    src="/bagongpilipinas.png"
                    alt="UEP Logo"
                    width={80}
                    height={80}
                    className="w-20 h-20 absolute right-10"
                />
                <Image
                    src="/socotec.jpg"
                    alt="UEP Logo"
                    width={68}
                    height={80}
                    className="w-17 h-20 absolute right-35"
                />
            </div>

            <div className="text-black text-center font-bold text-lg m-2">
                GENERAL SERVICES UNIT
            </div>

            {selectedField !== "All" && (
                <div className="text-red-500 text-center font-bold text-xl mb-2">
                    {reportTitle} <span className="text-base">( {selectedField} )</span>
                </div>
            )}
            {selectedField === "All" && (
                <div className="text-red-500 text-center font-bold text-xl mb-2">
                    {reportTitle}
                </div>
            )}

            <table className="w-full text-black text-[12px] mt-4">
                <thead className='border border-black'>
                    <tr className=" bg-blue-200 border border-black text-center uppercase">
                        <th className=" border border-black px-2 py-2 font-bold whitespace-nowrap">JR No.</th>
                        <th className=" border border-black px-2 py-2 font-bold whitespace-nowrap">Field of Work</th>
                        <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Specific Work</th>
                        <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Requesting Office/Unit</th>
                        <th className=" px-3 py-2 font-bold whitespace-nowrap border border-black">Date Requested</th>
                        <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Estimated Duration</th>
                        <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Status</th>
                    </tr>
                </thead>

                <tbody className='border border-black'>
                    {JobRequests.map((req) => (
                        <tr key={req.id} className='border border-black'>
                            <td className="border border-black px-2 py-2 text-center">{req.id}</td>
                            <td className="border border-black px-2 py-2 text-center">{req.field_work}</td>
                            <td className="border border-black px-2 py-2 text-left">{req.specific_work}</td>
                            <td className="border border-black px-2 py-2 text-center">
                                {req.unit?.unit_name}
                                {req.unit?.unit_acronym && (
                                    <span> ({req.unit.unit_acronym})</span>
                                )}
                            </td>
                            <td className="border border-black px-2 py-2 text-center">
                                {req.request_date
                                    ? new Date(req.request_date).toLocaleString("en-US", {
                                        month: "long",
                                        day: 'numeric',
                                        year: 'numeric'
                                    })
                                    : '—'}
                            </td>
                            <td className="border border-black px-2 py-2 text-center">
                                {req.estimated_duration_value
                                    ? `${req.estimated_duration_value} ${req.estimated_duration_unit || ''}`
                                    : '—'}
                            </td>
                            <td className="border border-black px-2 py-2 text-center">{req.status}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className='hidden '>
                    <tr>
                        <td colSpan={7} className="pt-5">
                            <div style={{ borderWidth: '2px' }} className="border border-blue-400 grid grid-cols-3 text-[11px] font-bold uppercase overflow-hidden">
                                <div className="p-2 border-r border-blue-400 text-[11px]">
                                    DOCUMENT NO: <br />
                                    <div className="flex justify-center text-center w-full">
                                        <span className="border-b border-black w-40">UEP-GSU-FM-001</span>
                                    </div>
                                </div>
                                <div className="p-2 border-r border-blue-400 flex text-[11px] flex-col justify-center">
                                    REVISION NO: <br />
                                    <div className="flex justify-center text-center w-full">
                                        <span className="border-b border-black w-40">00</span>
                                    </div>
                                </div>
                                <div className="p-2 border-blue-400 text-[11px]">
                                    EFFECTIVITY DATE: <br />
                                    <div className="flex justify-center text-center">
                                        <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <style jsx>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tfoot {
                        display: table-footer-group;
                    }

                    tbody {
                        display: table-row-group;
                    }

                    table {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    thead tr {
                        background-color: #bfdbfe;
                    }
                }
            `}</style>
        </div>
    );
}

export default JobRequestReport;