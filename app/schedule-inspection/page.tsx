import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import ScheduleInspectionForm from "./form/ScheduleInspectionForm";

const ScheduleInspectionPage = () => {
    return (
        <DashboardLayout>
            <ProtectedRoute>
                <ScheduleInspectionForm />
            </ProtectedRoute>
        </DashboardLayout>
     );
}

export default ScheduleInspectionPage;