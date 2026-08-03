import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import JobOrderForm from "./job-order-form/JobOrderForm"

const JobOrderFormLayout = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <JobOrderForm />
      </ProtectedRoute>
    </DashboardLayout>
  )
}

export default JobOrderFormLayout