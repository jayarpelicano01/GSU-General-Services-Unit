import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import JobRequestForm from "../job-request-form/JobRequestForm"

const JobRequestNewPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <JobRequestForm />
      </ProtectedRoute>
    </DashboardLayout>
  )
}

export default JobRequestNewPage