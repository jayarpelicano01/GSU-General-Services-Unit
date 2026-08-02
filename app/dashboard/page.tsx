"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { API } from "@/app/utils/api/api"
import { cn } from "@/lib/utils"
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

function getFirstName(user: User | null) {
  if (!user) return ""
  return (
    user.unit_head?.first_name ||
    user.gsu_head?.first_name ||
    user.unit?.head?.first_name ||
    "there"
  )
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
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              changeUp ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {changeUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
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

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return
    }

    async function fetchDashboardData() {
      try {
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
        setRequests([])
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, authLoading, user])

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "Pending").length
    const underInspection = requests.filter((r) => r.status === "Under Inspection").length
    const awaitingMaterials = requests.filter((r) => r.status === "Awaiting Materials").length
    const inProgress = underInspection + awaitingMaterials
    const completedOrders = orders.filter((o) => o.status === "Completed").length
    return {
      totalRequests: requests.length,
      pending,
      inProgress,
      completedOrders,
    }
  }, [requests, orders])

  const fieldWorkData = useMemo(() => {
    const counts: Record<string, number> = {}
    requests.forEach((r) => {
      const key = r.field_work || "Unspecified"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [requests])

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
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
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
      change: "+12%",
      changeUp: true,
    },
    {
      name: "Pending",
      value: stats.pending,
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      change: "+5%",
      changeUp: false,
    },
    {
      name: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: "+3%",
      changeUp: true,
    },
    {
      name: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: "+8%",
      changeUp: true,
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
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="rounded-xl shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Requests by Field Work
            </CardTitle>
            <CardDescription>Number of requests per field work type</CardDescription>
          </CardHeader>
          <CardContent>
            {fieldWorkData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={fieldWorkData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
      <Suspense fallback={
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      }>
        <ProtectedRoute>
          <DashboardContent />
        </ProtectedRoute>
      </Suspense>
    </DashboardLayout>
  )
}
