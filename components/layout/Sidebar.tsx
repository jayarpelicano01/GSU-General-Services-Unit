"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  Building2,
  Wrench,
  Calendar,
  FileCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Job Requests", href: "/job-request-list", icon: FileText },
  { name: "Job Orders", href: "/job-order-list", icon: ClipboardList },
  { name: "Inspections", href: "/schedule-inspection", icon: Calendar },
  { name: "Personnel", href: "/personnel", icon: Users },
  { name: "Units", href: "/units", icon: Building2 },
  { name: "Accomplishment Report", href: "/accomplishment-report", icon: FileCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={cn("flex items-center justify-between h-16 px-4 border-b border-slate-200", collapsed && "justify-center")}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3" aria-label="GSU System Home">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <span className="text-lg font-extrabold text-slate-900 truncate block">GSU System</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Job Requesting & Ordering</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="flex items-center justify-center" aria-label="GSU System Home">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", collapsed && "hidden")}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                title={collapsed ? item.name : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer / User section */}
        <div className={cn("p-3 border-t border-slate-200", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">Unit Staff</p>
                <p className="text-xs text-slate-500 truncate">General Services Unit</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="pt-2 space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>

        {/* Collapse/Expand toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-2 top-1/2 -translate-y-1/2 lg:hidden",
            collapsed && "hidden"
          )}
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          aria-expanded={!collapsed}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-2 top-1/2 -translate-y-1/2 lg:hidden",
            !collapsed && "hidden"
          )}
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          aria-expanded={collapsed}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed left-4 top-4 z-50"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
      >
        <Menu className="w-6 h-6" />
      </Button>
    </>
  )
}