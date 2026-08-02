"use client"

import { useEffect, useState, useMemo, useCallback, Suspense } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/app/context/AuthContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { MonthlyRequestsByUnit, UnitRequestsByField, UnitMonthlyTrend } from "@/app/components/dashboard/DashboardCharts"
import { DashboardSkeleton } from "@/app/components/dashboard/DashboardSkeleton"
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  SearchCheck,
  Package,
  Wrench,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { format, subDays, startOfMonth, subMonths } from "date-fns"
import { API } from "@/app/utils/api/api"
import { cn } from "@/lib/utils"
import { getFirstName } from "@/lib/rbac"
import type { JobRequest, JobOrder, User } from "@/app/types"

export const dynamic = "force-dynamic"

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  "Under Inspection": "bg-indigo-100 text-indigo-800",
  Approved: "bg-emerald-100 text-emerald-800",
  "Awaiting Materials": "bg-blue-100 text-blue-800",
  Disapproved: "bg-rose-100 text-rose-800",
  Cancelled: "bg-slate-100 text-slate-800",
  Assigned: "bg-blue-100 text-blue-800",
  Ongoing: "bg-emerald-100 text-emerald-800",
  Completed: "bg-emerald-100 text-emerald-800",
}

const statusDotColors: Record<string, string> = {
  Pending: "bg-amber-500",
  "Under Inspection": "bg-indigo-500",
  Approved: "bg-emerald-500",
  "Awaiting Materials": "bg-blue-500",
  Disapproved: "bg-rose-500",
  Cancelled: "bg-slate-400",
  Assigned: "bg-blue-500",
  Ongoing: "bg-emerald-500",
  Completed: "bg-emerald-500",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        statusColors[status] || "bg-slate-100 text-slate-800"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", statusDotColors[status] || "bg-slate-400")} />
      {status}
    </span>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

function getRoleLabel(user: User | null) {
  if (!user) return ""
  switch (user.role) {
    case "GSU_STAFF":
      return "General Services Unit · Oversight view"
    case "UNIT_HEAD":
      return `Unit Head · ${user.unit_head?.unit?.unit_acronym || ""}`
    case "UNIT_STAFF":
      return `Unit Staff · ${user.unit?.unit_acronym || ""}`
    default:
      return ""
  }
}

function getScopedUnitId(user: User | null): number | null {
  if (!user) return null
  if (user.role === "UNIT_HEAD") return user.unit_head?.unit_id ?? null
  if (user.role === "UNIT_STAFF") return user.unit?.id ?? null
  return null
}

function computeDelta(current: number, previous: number): { change: string; changeUp: boolean } {
  if (previous === 0) {
    return current === 0 ? { change: "—", changeUp: true } : { change: "New", changeUp: true }
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  return {
    change: `${pct > 0 ? "+" : ""}${pct}%`,
    changeUp: pct >= 0,
  }
}

const LAST_MONTHS = 6

function monthKeys(count: number) {
  const now = new Date()
  const months: { key: string; label: string }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = startOfMonth(subMonths(now, i))
    months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM") })
  }
  return months
}

function buildMonthlyTrend(requests: JobRequest[], unitId: number | null) {
  const months = monthKeys(LAST_MONTHS)
  const counts = new Map(months.map((m) => [m.key, 0]))
  requests.forEach((r) => {
    if (unitId && r.unit_id !== unitId) return
    const key = format(new Date(r.request_date), "yyyy-MM")
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1)
  })
  return months.map((m) => ({ month: m.label, requests: counts.get(m.key) || 0 }))
}

function buildMonthlyByUnit(requests: JobRequest[]) {
  const months = monthKeys(LAST_MONTHS)
  const unitNames = new Map<number, string>()
  requests.forEach((r) => unitNames.set(r.unit_id, r.unit.unit_acronym))
  const units = [...unitNames.entries()].sort((a, b) => a[0] - b[0])

  const rows: { month: string; [unit: string]: string | number }[] = months.map((m) => ({ month: m.label }))
  units.forEach(([, acronym]) => rows.forEach((row) => (row[acronym] = 0)))

  requests.forEach((r) => {
    const key = format(new Date(r.request_date), "yyyy-MM")
    const idx = months.findIndex((m) => m.key === key)
    if (idx < 0) return
    const acronym = unitNames.get(r.unit_id)
    if (acronym) rows[idx][acronym] = Number(rows[idx][acronym]) + 1
  })
  return rows
}

function StatCard({
  name,
  value,
  icon: Icon,
  bgColor,
  textColor,
  change,
  changeUp,
  valueSuffix,
}: {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  change: string
  changeUp: boolean
  valueSuffix?: string
}) {
  return (
    <Card className="rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("rounded-full p-3", bgColor)}>
            <Icon className={cn("w-6 h-6", textColor)} aria-hidden="true" />
          </div>
          <span
            title="Compared to the previous 30 days"
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              changeUp ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {change === "—" ? null : changeUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {change}
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-slate-900">
            {value.toLocaleString()}
            {valueSuffix ? <span className="ml-1 text-base font-semibold text-slate-400">{valueSuffix}</span> : null}
          </p>
          <p className="text-sm font-medium text-slate-500 mt-1">{name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyChartCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardData {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  change: string
  changeUp: boolean
  valueSuffix?: string
}

function DashboardContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<JobRequest[]>([])
  const [orders, setOrders] = useState<JobOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(false)
      const [requestsRes, ordersRes] = await Promise.all([
        API.get("/job-requests"),
        API.get("/job-orders"),
      ])

      const allRequests = requestsRes.data.data || []
      const allOrders = ordersRes.data.data || []

      const unitId = getScopedUnitId(user)
      const scopedRequests = unitId
        ? allRequests.filter((r: JobRequest) => r.unit_id === unitId)
        : allRequests
      const scopedOrders = unitId
        ? allOrders.filter((o: JobOrder) => o.job_request.unit_id === unitId)
        : allOrders

      setRequests(scopedRequests)
      setOrders(scopedOrders)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return
    }

    setLoading(true)
    fetchDashboardData()
  }, [authLoading, isAuthenticated, fetchDashboardData])

  const unitId = getScopedUnitId(user)
  const isGsuStaff = user?.role === "GSU_STAFF"
  const isUnitStaff = user?.role === "UNIT_STAFF"

  const stats = useMemo(() => {
    const now = Date.now()
    const currentStart = subDays(new Date(), 30).getTime()
    const previousStart = subDays(new Date(), 60).getTime()
    const monthStart = startOfMonth(new Date()).getTime()
    const prevMonthStart = startOfMonth(subMonths(new Date(), 1)).getTime()

    const inWindow = (dateStr: string, start: number, end: number) => {
      const t = new Date(dateStr).getTime()
      return Number.isFinite(t) && t >= start && t < end
    }

    const completedThisMonth = orders.filter((o) => {
      if (o.status !== "Completed") return false
      const t = new Date(o.date_accomplished || o.date_started).getTime()
      return Number.isFinite(t) && t >= monthStart && t <= now
    }).length

    const completedPrevMonth = orders.filter((o) => {
      if (o.status !== "Completed") return false
      const t = new Date(o.date_accomplished || o.date_started).getTime()
      return Number.isFinite(t) && t >= prevMonthStart && t < monthStart
    }).length

    const countReq = (status: string, current: boolean) =>
      requests.filter((r) =>
        r.status === status &&
        inWindow(r.request_date, current ? currentStart : previousStart, current ? now : currentStart)
      ).length

    const countOrderByStatus = (statuses: string[], current: boolean) =>
      orders.filter((o) =>
        statuses.includes(o.status) &&
        inWindow(o.date_started, current ? currentStart : previousStart, current ? now : currentStart)
      ).length

    const completedOrders = orders.filter(
      (o) => o.status === "Completed" && o.date_started && o.date_accomplished
    )
    const avgDaysToComplete = completedOrders.length
      ? Math.round(
          (completedOrders.reduce((sum, o) => {
            const s = new Date(o.date_started!).getTime()
            const a = new Date(o.date_accomplished!).getTime()
            return sum + (a - s) / 86400000
          }, 0) /
            completedOrders.length) *
            10
        ) / 10
      : 0

    return {
      pendingInspections: requests.filter((r) => r.status === "Under Inspection").length,
      awaitingMaterials: requests.filter((r) => r.status === "Awaiting Materials").length,
      ordersToAssign: orders.filter((o) => o.status === "Pending").length,
      completedThisMonth,
      inProgress: orders.filter((o) => o.status === "Assigned" || o.status === "Ongoing").length,
      myPendingRequests: requests.filter((r) => r.status === "Pending").length,
      avgDaysToComplete,
      trends: {
        pendingInspections: computeDelta(countReq("Under Inspection", true), countReq("Under Inspection", false)),
        awaitingMaterials: computeDelta(countReq("Awaiting Materials", true), countReq("Awaiting Materials", false)),
        ordersToAssign: computeDelta(countOrderByStatus(["Pending"], true), countOrderByStatus(["Pending"], false)),
        completedThisMonth: computeDelta(completedThisMonth, completedPrevMonth),
        inProgress: computeDelta(countOrderByStatus(["Assigned", "Ongoing"], true), countOrderByStatus(["Assigned", "Ongoing"], false)),
        myPendingRequests: computeDelta(countReq("Pending", true), countReq("Pending", false)),
      },
    }
  }, [requests, orders])

  const fieldWorkData = useMemo(() => {
    const counts: Record<string, number> = {}
    requests.forEach((r) => {
      const key = r.field_work || "Unspecified"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .map(([field, requests]) => ({ field, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 8)
  }, [requests])

  const fieldWorkData30d = useMemo(() => {
    const cutoff = subDays(new Date(), 30).getTime()
    const counts: Record<string, number> = {}
    requests.forEach((r) => {
      const t = new Date(r.request_date).getTime()
      if (!Number.isFinite(t) || t < cutoff) return
      const key = r.field_work || "Unspecified"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .map(([field, requests]) => ({ field, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 8)
  }, [requests])

  const monthlyTrend = useMemo(() => buildMonthlyTrend(requests, isGsuStaff ? null : unitId), [requests, unitId, isGsuStaff])
  const monthlyByUnit = useMemo(() => buildMonthlyByUnit(requests), [requests])

  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort(
          (a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
        )
        .slice(0, 5),
    [requests]
  )

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-xl shadow-sm border border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-rose-50 p-4 mb-4">
              <Activity className="w-8 h-8 text-rose-500" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Unable to load dashboard</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Something went wrong while fetching your dashboard data. Please try again.
            </p>
            <Button className="mt-6" onClick={() => { setLoading(true); fetchDashboardData() }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gsuStatCards: StatCardData[] = [
    {
      name: "Pending Inspections",
      value: stats.pendingInspections,
      icon: SearchCheck,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      ...stats.trends.pendingInspections,
    },
    {
      name: "Awaiting Materials",
      value: stats.awaitingMaterials,
      icon: Package,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      ...stats.trends.awaitingMaterials,
    },
    {
      name: "Job Orders to Assign",
      value: stats.ordersToAssign,
      icon: Wrench,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      ...stats.trends.ordersToAssign,
    },
    {
      name: "Completed This Month",
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      ...stats.trends.completedThisMonth,
    },
  ]

  const unitStatCards: StatCardData[] = [
    {
      name: "Completed This Month",
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      ...stats.trends.completedThisMonth,
    },
    {
      name: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      ...stats.trends.inProgress,
    },
    {
      name: "My Pending Requests",
      value: stats.myPendingRequests,
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      ...stats.trends.myPendingRequests,
    },
    {
      name: "Avg Days to Complete",
      value: stats.avgDaysToComplete,
      icon: Timer,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: "—",
      changeUp: true,
      valueSuffix: "days",
    },
  ]

  const statCards = isGsuStaff ? gsuStatCards : unitStatCards
  const recentRequestsTitle = isUnitStaff ? "My Recent Requests" : "Recent Job Requests"
  const recentRequestsDescription = isUnitStaff
    ? "Latest requests you have submitted"
    : "Latest requests submitted"

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {getGreeting()}, {getFirstName(user)}
          </h1>
          <p className="text-slate-500 mt-1">{getRoleLabel(user)}</p>
        </div>
        <Button asChild>
          <Link href="/job-request/new">
            <FileText className="w-4 h-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            textColor={stat.textColor}
            change={stat.change}
            changeUp={stat.changeUp}
            valueSuffix={stat.valueSuffix}
          />
        ))}
      </div>

      {/* Charts Row */}
      {isGsuStaff ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.length === 0 ? (
            <EmptyChartCard
              title="Monthly Requests by Unit"
              description="Requests per unit over the last 6 months"
            />
          ) : (
            <MonthlyRequestsByUnit data={monthlyByUnit} />
          )}
          {fieldWorkData30d.length === 0 ? (
            <EmptyChartCard
              title="Requests by Field Work (30 days)"
              description="Total requests in the past 30 days by field work type"
            />
          ) : (
            <UnitRequestsByField data={fieldWorkData30d} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fieldWorkData.length === 0 ? (
            <EmptyChartCard title="Requests by Field" description="Number of requests per field work type" />
          ) : (
            <UnitRequestsByField data={fieldWorkData} />
          )}
          {monthlyTrend.every((d) => d.requests === 0) ? (
            <EmptyChartCard title="Unit Monthly Trend" description="Your requests over the last 6 months" />
          ) : (
            <UnitMonthlyTrend data={monthlyTrend} />
          )}
        </div>
      )}

      {/* Recent Requests */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="" />
          <CardHeader className="flex flex-row items-start justify-between px-6 pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div>
                <CardTitle className="text-base">{recentRequestsTitle}</CardTitle>
                <CardDescription>{recentRequestsDescription}</CardDescription>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {recentRequests.length} records
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No job requests yet</p>
                <Button asChild className="mt-4">
                  <Link href="/job-request/new">Create First Request</Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="w-16 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">ID</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Unit</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Field Work</TableHead>
                      <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Status</TableHead>
                      <TableHead className="w-28 text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-slate-50/70 border-slate-100">
                        <TableCell className="py-3.5">
                          <span className="inline-flex font-mono text-xs font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-1 tabular-nums">
                            #{request.id.toString().padStart(3, "0")}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                              {request.unit.unit_acronym.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 leading-tight">{request.unit.unit_acronym}</div>
                              <div className="text-xs text-slate-400 truncate max-w-[150px]">{request.unit.unit_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className="inline-flex max-w-[170px] truncate px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                            {request.field_work}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3.5">
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <div className="text-sm font-medium text-slate-700 tabular-nums">{format(new Date(request.request_date), "MMM d")}</div>
                          <div className="text-xs text-slate-400 tabular-nums">{format(new Date(request.request_date), "yyyy")}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="border-t border-slate-100 bg-slate-50/50">
                  <Button variant="ghost" size="sm" className="w-full justify-center py-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-transparent group" asChild>
                    <Link href="/job-request-list">
                      View All Requests
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ProtectedRoute>
          <DashboardContent />
        </ProtectedRoute>
      </Suspense>
    </DashboardLayout>
  )
}
