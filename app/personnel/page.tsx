import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import PersonnelTable from "./personnel-table/PersonnelTable"

const PersonnelPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <PersonnelTable />
      </ProtectedRoute>
    </DashboardLayout>
  )
}

export default PersonnelPage