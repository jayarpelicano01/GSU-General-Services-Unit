export interface JobRequest {
  id: number;
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
    };
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

export interface Personnel {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  field: string;
}

export interface InspectionFormData {
  scheduledDate: string;
  personnels: string[];
}

export interface InspectionResultFormData {
  assessment_results: string;
  estimated_duration_value: number;
  estimated_duration_unit: 'Hours' | 'Days';
  status_of_materials: 'Available' | 'Not Available' | null;
  recommendation: string;
}