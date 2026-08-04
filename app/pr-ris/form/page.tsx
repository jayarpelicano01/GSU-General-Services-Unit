"use client";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PrRisForm from "../pr-ris-form/PrRisForm";

const PrRisFormPage = () => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
          <PrRisForm />
        </Suspense>
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default PrRisFormPage;
