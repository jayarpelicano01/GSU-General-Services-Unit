"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("GSU_STAFF" | "UNIT_HEAD" | "UNIT_STAFF")[]
}

// Skeleton for Suspense fallback
const ProtectedRouteSkeleton = () => (
  <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent" />
  </div>
)

function ProtectedRouteInner({ children, allowedRoles }: ProtectedRouteProps) {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  // Redirect AFTER render (useEffect) - this is the fix
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
      console.log(isAuthenticated, loading, redirect)
    }
  }, [loading, isAuthenticated, redirect, router])

  // Role check
  if (!loading && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <ProtectedRouteSkeleton />
  }

  // Show skeleton while loading or not authenticated
  if (loading || !isAuthenticated) {
    return <ProtectedRouteSkeleton />
  }

  return <>{children}</>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  return (
    <Suspense fallback={<ProtectedRouteSkeleton />}>
      <ProtectedRouteInner children={children} allowedRoles={allowedRoles} />
    </Suspense>
  )
}