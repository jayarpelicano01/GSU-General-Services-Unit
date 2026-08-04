export interface JobOrderModalRequest {
  id: number;
  field_work: string;
  specific_work: string;
  unit?: {
    unit_name?: string;
    unit_acronym?: string;
    location?: { location_name: string } | null;
  } | null;
}

export interface JobOrderFormData {
  jobOrderNo: number | null;
  specificWorkOrder: string;
  personnels: string[];
}
