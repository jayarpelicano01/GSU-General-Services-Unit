import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import JobRequestTable from "./job-request-table/JobRequestTable"

const JobRequestListPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <JobRequestTable />
      </ProtectedRoute>
    </DashboardLayout>
  )
}

export default JobRequestListPage