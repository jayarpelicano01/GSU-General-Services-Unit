export interface User {
  id: number;
  email: string;
  role: 'GSU_STAFF' | 'UNIT_HEAD' | 'UNIT_STAFF';
  reference_id: number;
  gsu_head?: {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
  };
  unit_head?: {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    unit_id: number;
    unit: {
      id: number;
      unit_name: string;
      unit_acronym: string;
    };
  };
  unit?: {
    id: number;
    unit_name: string;
    unit_acronym: string;
    head_id: number;
    head: {
      first_name: string;
      middle_name: string | null;
      last_name: string;
      suffix: string | null;
    };
    location_id: number;
    location: {
      location_name: string;
    };
  };
}

export interface JobRequest {
  id: number;
  request_date: string;
  field_work: string;
  specific_work: string;
  estimated_duration_value: number | null;
  estimated_duration_unit: string | null;
  status_of_materials: string | null;
  status: string;
  reason_for_disapproval: string | null;
  unit_id: number;
  gsu_head_id: number | null;
  unit: {
    id: number;
    unit_name: string;
    unit_acronym: string;
  };
  gsu_head?: {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
  };
}

export interface JobOrder {
  id: number;
  request_id: number;
  date_started: string;
  date_accomplished: string | null;
  specific_work: string | null;
  remarks: string | null;
  status: string;
  jo_number: number | null;
  reason_for_cancelling: string | null;
  job_request: JobRequest;
}

export interface DashboardStats {
  totalJobRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedOrders: number;
  underInspection: number;
  awaitingMaterials: number;
}

export interface RecentActivity {
  id: number;
  type: 'job_request' | 'job_order' | 'inspection';
  title: string;
  description: string;
  date: string;
  status: string;
}