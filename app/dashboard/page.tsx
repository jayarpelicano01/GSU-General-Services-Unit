"use client"

import { useEffect, useState, useMemo, useCallback, Suspense } from "react"
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
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
  Completed: "bg-emerald-100 text-emerald-800",
}

const donutColors: Record<string, string> = {
  Pending: "#f59e0b",
  Approved: "#10b981",
  Disapproved: "#f43f5e",
  "Awaiting Materials": "#3b82f6",
  "Under Inspection": "#6366f1",
  Cancelled: "#64748b",
  Assigned: "#0ea5e9",
  Completed: "#22c55e",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusColors[status] || "bg-slate-100 text-slate-800"
      )}
    >
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
}: {
  name: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  change: string
  changeUp: boolean
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
          <p className="text-3xl font-extrabold text-slate-900">{value.toLocaleString()}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">{name}</p>
        </div>
      </CardContent>
    </Card>
  )
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

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "Pending").length
    const underInspection = requests.filter((r) => r.status === "Under Inspection").length
    const awaitingMaterials = requests.filter((r) => r.status === "Awaiting Materials").length
    const completedOrders = orders.filter((o) => o.status === "Completed").length

    const now = Date.now()
    const currentStart = subDays(new Date(), 30).getTime()
    const previousStart = subDays(new Date(), 60).getTime()

    const inWindow = (dateStr: string, start: number, end: number) => {
      const t = new Date(dateStr).getTime()
      return Number.isFinite(t) && t >= start && t < end
    }

    const reqCount = (pred: (r: JobRequest) => boolean, current: boolean) =>
      requests.filter((r) =>
        pred(r) &&
        inWindow(r.request_date, current ? currentStart : previousStart, current ? now : currentStart)
      ).length

    const completedCount = (current: boolean) =>
      orders.filter((o) =>
        o.status === "Completed" &&
        inWindow(o.date_accomplished || o.date_started, current ? currentStart : previousStart, current ? now : currentStart)
      ).length

    const series = (pred: (r: JobRequest) => boolean) =>
      computeDelta(reqCount(pred, true), reqCount(pred, false))

    return {
      totalRequests: requests.length,
      pending,
      underInspection,
      awaitingMaterials,
      completedOrders,
      trends: {
        totalRequests: series(() => true),
        pending: series((r) => r.status === "Pending"),
        underInspection: series((r) => r.status === "Under Inspection"),
        awaitingMaterials: series((r) => r.status === "Awaiting Materials"),
        completedOrders: computeDelta(completedCount(true), completedCount(false)),
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

  const unitId = getScopedUnitId(user)
  const isGsuStaff = user?.role === "GSU_STAFF"
  const monthlyTrend = useMemo(() => buildMonthlyTrend(requests, isGsuStaff ? null : unitId), [requests, unitId, isGsuStaff])
  const monthlyByUnit = useMemo(() => buildMonthlyByUnit(requests), [requests])

  const statusData = useMemo(() => {
    const statuses = [
      "Pending",
      "Approved",
      "Disapproved",
      "Awaiting Materials",
      "Under Inspection",
      "Cancelled",
    ]
    return statuses
      .map((status) => ({
        name: status,
        value: requests.filter((r) => r.status === status).length,
      }))
      .filter((d) => d.value > 0)
  }, [requests])

  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort(
          (a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
        )
        .slice(0, 5),
    [requests]
  )

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.date_started).getTime() - new Date(a.date_started).getTime()
        )
        .slice(0, 5),
    [orders]
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

  const statCards = [
    {
      name: "Total Requests",
      value: stats.totalRequests,
      icon: FileText,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      ...stats.trends.totalRequests,
    },
    {
      name: "Pending",
      value: stats.pending,
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      ...stats.trends.pending,
    },
    {
      name: "Under Inspection",
      value: stats.underInspection,
      icon: SearchCheck,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      ...stats.trends.underInspection,
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
      name: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      ...stats.trends.completedOrders,
    },
  ]

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {fieldWorkData.length === 0 ? (
          <Card className="rounded-xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Requests by Field Work
              </CardTitle>
              <CardDescription>Number of requests per field work type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            </CardContent>
          </Card>
        ) : (
          <UnitRequestsByField data={fieldWorkData} />
        )}

        {/* Donut Chart */}
        <Card className="rounded-xl shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              Request Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of requests by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={64}
                        outerRadius={90}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={donutColors[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {stats.totalRequests.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Total</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  {statusData.map((entry) => (
                    <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: donutColors[entry.name] || "#94a3b8" }}
                      />
                      {entry.name} ({entry.value})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Row */}
      <div className="grid grid-cols-1 gap-6">
        {isGsuStaff ? (
          requests.length === 0 ? (
            <Card className="rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Monthly Requests by Unit
                </CardTitle>
                <CardDescription>Requests per unit over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              </CardContent>
            </Card>
          ) : (
            <MonthlyRequestsByUnit data={monthlyByUnit} />
          )
        ) : requests.length === 0 ? (
          <Card className="rounded-xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Requests over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            </CardContent>
          </Card>
        ) : (
          <UnitMonthlyTrend data={monthlyTrend} />
        )}
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Requests */}
        <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Recent Job Requests
              </CardTitle>
              <CardDescription>Latest requests submitted</CardDescription>
            </div>
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
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Field Work</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="w-28">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm font-medium">#{request.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{request.unit.unit_acronym}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[140px]">
                            {request.unit.unit_name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">{request.field_work}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(request.request_date), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="border-t border-slate-100">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-indigo-600 hover:text-indigo-700" asChild>
                    <Link href="/job-request-list">
                      View All Requests
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Job Orders */}
        <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Recent Job Orders
              </CardTitle>
              <CardDescription>Latest orders created</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No job orders yet</p>
                <p className="text-sm">Orders are created from approved requests</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">JO No.</TableHead>
                      <TableHead>Request</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="w-28">Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium text-indigo-600">
                          JO-{order.jo_number?.toString().padStart(4, "0") || order.id}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {order.job_request.field_work} - {order.job_request.specific_work}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(order.date_started), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="border-t border-slate-100">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-indigo-600 hover:text-indigo-700" asChild>
                    <Link href="/job-order-list">
                      View All Orders
                      <ChevronRight className="w-4 h-4 ml-1" />
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
