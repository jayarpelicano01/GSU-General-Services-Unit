"use client";
import PrintJobRequest from "@/app/components/printouts/PrintJobRequest";
import PrintJobOrder from "@/app/components/printouts/PrintJobOrder";
import { useSyncExternalStore } from "react";

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
    JobRequest: JobRequest | null;
    JobOrder: JobOrder | null;
}

const PrintRequestAndOrder = ({ JobRequest, JobOrder}: PrintProps) => {

  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) return null;
  return (
    <div>
        {JobRequest && <PrintJobRequest JobRequest={JobRequest} />}
        <div className="page-break border-t-2 border-dashed border-gray-400 my-0 mx-1"></div>
        {JobOrder && <PrintJobOrder JobOrder={JobOrder} />}
    </div>
  );
};

export default PrintRequestAndOrder;
