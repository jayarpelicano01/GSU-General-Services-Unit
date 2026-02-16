"use client";
import { useEffect, useState } from "react";
import PrintJobRequest from "@/app/components/PrintJobRequest";

interface JobRequest {
        id: number;
        unit: {
        head: {
            first_name: string;
            middle_name: string;
            last_name: string;
            suffix: string;
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

export default function PrintPage() {
  // 1. Initialize state directly from localStorage
  const [data] = useState<JobRequest>(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("job-request");
      return storedData ? JSON.parse(storedData) : null;
    }
    return null;
  });

  // 2. Effect now only handles the side effect (printing)
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) return <div className="p-10 text-center">Loading Print Document...</div>;

  return <PrintJobRequest JobRequest={data} />;
}