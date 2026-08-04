"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PrRisTable from "./pr-ris-table/PrRisTable";

const PrRisPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <PrRisTable />
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default PrRisPage;
