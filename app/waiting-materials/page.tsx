import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import WaitingMaterialsTable from "./waiting-materials-table/WaitingMaterialsTable";

const WaitingMaterialsPage = () => {
    return (
        <DashboardLayout>
            <ProtectedRoute>
                <WaitingMaterialsTable />
            </ProtectedRoute>
        </DashboardLayout>
    );
}

export default WaitingMaterialsPage;