"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  Building2,
  Calendar,
  FileCheck,
  Clock,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useTheme } from "@/app/context/ThemeContext"
import { getUserDisplay } from "@/lib/rbac"
import type { Role } from "@/lib/rbac"

const navigation: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; roles: readonly Role[] }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["GSU_STAFF", "UNIT_HEAD", "UNIT_STAFF"] },
  { name: "Job Requests", href: "/job-request-list", icon: FileText, roles: ["GSU_STAFF", "UNIT_HEAD", "UNIT_STAFF"] },
  { name: "Job Orders", href: "/job-order-list", icon: ClipboardList, roles: ["GSU_STAFF", "UNIT_HEAD", "UNIT_STAFF"] },
  { name: "Inspections", href: "/schedule-inspection", icon: Calendar, roles: ["GSU_STAFF"] },
  { name: "Personnel", href: "/personnel", icon: Users, roles: ["GSU_STAFF"] },
  { name: "PR / RIS", href: "/pr-ris", icon: Clock, roles: ["GSU_STAFF"] },
  { name: "Accomplishment Report", href: "/accomplishment-report", icon: FileCheck, roles: ["GSU_STAFF", "UNIT_HEAD"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const display = getUserDisplay(user)
  const visibleNavigation = navigation.filter((item) => !user || item.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "no-print fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={cn("flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800", collapsed && "justify-center")}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3" aria-label="GSU System Home">
              <img
                src="/UEP-Logo.png"
                alt="University of Eastern Philippines"
                className="w-9 h-9 object-contain flex-shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate block">GSU System</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">Job Requesting & Ordering</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="flex items-center justify-center" aria-label="GSU System Home">
              <img
                src="/UEP-Logo.png"
                alt="University of Eastern Philippines"
                className="w-9 h-9 object-contain"
              />
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
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
        <div className={cn("p-3 border-t border-slate-200 dark:border-slate-800", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{display.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{display.subtitle}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="pt-2 space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={handleLogout}
              >
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
        className="no-print lg:hidden fixed left-4 top-4 z-50"
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
