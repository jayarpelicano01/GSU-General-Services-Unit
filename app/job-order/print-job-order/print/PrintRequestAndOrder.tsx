"use client";
import PrintJobRequest from "@/app/components/printouts/PrintJobRequest";
import PrintJobOrder from "@/app/components/printouts/PrintJobOrder";
import { useSyncExternalStore } from "react";
import Sidebar from "@/app/components/Sidebar";


const subscribe = () => () => {}; 
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface JobRequest {
        id: number;
        request_date: Date;
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
        jo_number: number;
    }

interface Personnel {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
}

interface JobOrder {
    job_request: JobRequest;
    specific_work: string;
    remarks: string;
    date_started: Date;
    jo_number: number;
    personnels: [Personnel];
}

interface PrintProps {
    JobRequest: JobRequest;
    JobOrder: JobOrder;
}

const PrintRequestAndOrder = ({ JobRequest, JobOrder}: PrintProps) => {

  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) return null;
  return (
    <div className="flex bg-gray-200">
        
        <Sidebar />

        <div className="print-container ml-64 flex-1">
            <div className="page-break">
                <PrintJobRequest JobRequest={JobRequest} />
            </div>
            <div className="page-break">
                <PrintJobOrder JobOrder={JobOrder} />
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }

                    .page-break {
                        display: block;
                    }   

                    .print-container {
                        margin-left: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    </div>
  );
};

export default PrintRequestAndOrder;