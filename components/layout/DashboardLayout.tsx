"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          "lg:ml-72"
        )}
        id="main-content"
        tabIndex={-1}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}