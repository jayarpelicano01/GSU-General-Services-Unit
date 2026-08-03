import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import PrintLayout from "@/app/components/PrintLayout";
import InspectionReport from "@/app/components/printouts/inspection/InspectionReport";

const InspectionPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <PrintLayout
          title="Inspection"
          subtitle="Report Preview"
          backPath="/job-request-list"
        >
          <InspectionReport />
        </PrintLayout>
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default InspectionPage;