"use client";
import { useEffect, useState } from "react";
import PrintRequestAndOrder from "./print/PrintRequestAndOrder";

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
    request: JobRequest;
    specific_work: string;
    remarks: string;
    jo_number: number;
    personnels: [Personnel];
}

export default function PrintPage() {
  
  const [RequestData] = useState<JobRequest>(() => {
    if (typeof window !== "undefined") {
      const storedRequestData = localStorage.getItem("job-request");
      return storedRequestData ? JSON.parse(storedRequestData) : null;
    }
    return null;
  });

  const [OrderData] = useState<JobOrder>(() => {
    if (typeof window !== "undefined") {
      const storedOrderData = localStorage.getItem("job-order");
      return storedOrderData ? JSON.parse(storedOrderData) : null;
    }
    return null;
  });

  return <PrintRequestAndOrder JobRequest={RequestData} JobOrder={OrderData} />;
}