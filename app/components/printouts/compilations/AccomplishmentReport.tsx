"use client";
import { API } from '@/app/utils/api/api';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
}

interface Unit {
    unit_name: string;
    unit_acronym: string;
}

interface JobRequest {
    id: number;
    unit: Unit;
    field_work: string;
}

interface JobOrder {
    id: number;
    jo_number: number;
    specific_work: string;
    date_started: string | Date;
    date_accomplished: string | Date;
    status: string;
    job_request: JobRequest; 
    personnels: Personnel[];
}

interface Props {
  selectedField: string;
}

const AccomplishmentReport = ({selectedField}: Props) => {
    const searchParams = useSearchParams();
    const month = searchParams.get('month');
    
    const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);

    const selectedFieldLabel = selectedField === "All" 
    ? '' 
    : selectedField;

    useEffect(() => {

        const fetchJobOrders = async () => {
            const response = await API.get('/job-orders/completed/');
            const data = response.data.data;
            setJobOrders(data);
        }

        fetchJobOrders();
    }, [])

    const filteredByFieldWorkOrders = selectedField === "All"
    ? jobOrders
    : jobOrders.filter(order => order.job_request?.field_work === selectedField);

    const filteredOrders = filteredByFieldWorkOrders.filter(order => {
        if (!month) return true;
        const orderMonth = new Date(order.date_started).toISOString().slice(0, 7);
        return orderMonth === month;
    });
    
    return (
        <div 
            style={{padding: "10mm 10mm 10mm 10mm"}} 
            className="bg-white text-black font-sans w-[297mm] min-h-[210mm] mx-auto overflow-hidden"
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
                <p className="text-xs">Republic of the Philippines</p>
                <p className="font-bold text-xs leading-tight">UNIVERSITY OF EASTERN PHILIPPINES</p>
                <p className="text-xs italic">University Town, Northern Samar</p>
                <p className="text-[10px]">Website: <span style={{ color: '#0056b3'}}>http://uep.edu.ph</span> Email: <span style={{ color: '#0056b3'}}>uepnsofficial@gmail.com</span></p>
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
                className="w-17 h-20 absolute right-30" 
                />
            </div>

            <div className="text-black text-center font-bold text-md m-2">
                GENERAL SERVICES UNIT
            </div>

            <div className="text-red-500 text-center font-bold text-lg mb-2">
                MONTHLY ACCOMPLISHMENT REPORT{' '}
                {month && (
                    <span>
                        ({new Date(month + '-01T00:00:00').toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric'
                        }).toUpperCase()} 
                        {selectedField !== "All" && (
                                <span> - {selectedField}</span>
                            )}
                        )
                    </span>
                )} 
            </div>

            <table className="w-full text-black border text-[12px] mt-4">
            {/* Blue Header */}
            <thead className='border border-black'>
                <tr className=" bg-blue-200 border border-black text-center uppercase">
                <th className=" border border-black px-2 py-2 font-bold whitespace-nowrap">JR No.</th>
                <th className="  border border-black px-2 py-2 font-bold whitespace-nowrap">Job Order</th>
                <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Requesting Office/Unit</th>
                <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Date Started</th>
                <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Date Completion</th>
                <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Assigned Personnel</th>
                <th className=" px-2 py-2 font-bold whitespace-nowrap border border-black">Remarks</th>
                </tr>
            </thead>

            {/* Body */}
            <tbody className='border border-black'>
                {/* Replace with your actual data */}
                {filteredOrders.map((order) => (
                <tr key={order.id} className='border border-black'>
                    <td className="border border-black px-2 py-2 text-center">{order.jo_number}</td>
                    <td className="border border-black px-2 py-2 text-center">{order.specific_work}</td>
                    <td className="border border-black px-2 py-2 text-center">{order.job_request.unit.unit_name} ({order.job_request.unit.unit_acronym})</td>
                    <td className="border border-black px-2 py-2 text-center">
                        {new Date(order.date_started).toLocaleString("en-US",
                            {month: "long",
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                        {new Date(order.date_accomplished).toLocaleString("en-US",
                            {month: "long",
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                        {order.personnels.map(p => `${p.first_name[0]}. ${p.last_name}`).join(', ')}
                    </td>
                    <td className="border border-black text-center px-2 py-2">Accomplished</td>
                </tr>
                ))}
            </tbody>
            </table>

            <div style={{borderWidth: '2px'}} className="print-footer mt-2 border border-blue-400 grid grid-cols-3 text-[11px] font-bold uppercase overflow-hidden">
                <div className="p-2 border-r border-blue-400 text-[11px]">
                    DOCUMENT NO: <br />
                    <div className="flex justify-center text-center w-full">
                        <span className="border-b border-black w-40">UEP-GSU-FM-005</span>
                    </div>
                </div>
                <div style={{borderWidth: '0 1px 0 1px'}} className="border-r p-2 border-blue-400 flex text-[11px] flex-col justify-center">
                    REVISION NO: <br />
                    <div className="flex justify-center text-center w-full">
                        <span className="border-b border-black w-40">00</span>
                    </div>
                </div>
                <div style={{borderWidth: '0 0 0 1px'}} className="p-2 border-blue-400 text-[11px]">
                    EFFECTIVITY DATE: <br />
                    <div className="flex justify-center text-center">
                        <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .print-footer {
                    display: none
                }

                @media print {
                    @page {
                    size: A4 landscape;
                    margin: 0;
                    }

                    .print-footer {
                        display: grid;
                        position: fixed;
                        bottom: 10;
                        left: 10mm;
                        right: 10mm;
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    table { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

                    thead tr { background-color: #bfdbfe; }
                }
            `}</style>

        </div>
        
    );
}

export default AccomplishmentReport;