import PrintLayout from "@/app/components/PrintLayout";
import InspectionReport from "@/app/components/printouts/inspection/InspectionReport";

const InspectionPage = () => {
  return (
    <PrintLayout 
      title="Inspection" 
      subtitle="Report Preview" 
      backPath="/job-request-list"
    >
      <InspectionReport />
    </PrintLayout>
  );
};

export default InspectionPage;