"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"

// Inner component that uses useSearchParams - must be wrapped in Suspense
const LoginPageInner = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("redirect") || "/dashboard"
  const { login, loading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isLoading = loading || authLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password, false)
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4 py-12">
      {/* Centered Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Login Form */}
          <div className="flex-1 lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              {/* Logo & Title */}
              <Link href="/" className="inline-flex items-center gap-3 mb-8">
                <div>
                  <span className="text-xl font-extrabold text-slate-900">GSU System</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Job Requesting & Ordering</p>
                </div>
              </Link>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Sign in to your account</h2>
              <p className="text-slate-600 mb-8">Enter your credentials to access the dashboard</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Email address"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Password"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center text-sm text-slate-500 mt-8">
                <p>Demo credentials:</p>
                <div className="mt-2 space-y-1 text-[11px] font-mono bg-slate-100 rounded-lg p-3 text-left">
                  <div><strong>GSU Staff:</strong> gsu.staff@uep.edu.ph / TestPass123</div>
                  <div><strong>Unit Head:</strong> unit.head@uep.edu.ph / TestPass123</div>
                  <div><strong>Unit Staff:</strong> unit.staff@uep.edu.ph / TestPass123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - UEP Logo & Branding */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 px-8 py-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            {/* Floating shapes */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 text-center text-white max-w-lg">
              {/* UEP Logo */}
              <div className="mb-8">
                <img
                  src="/UEP-Logo.png"
                  alt="University of Eastern Philippines"
                  className="w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Institution Name */}
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
                University of Eastern Philippines
              </h3>
              <p className="text-indigo-100 text-base mb-6 uppercase tracking-wider">
                Catarman, Northern Samar
              </p>

              {/* System Branding */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-extrabold mb-1">General Services Unit</h4>
                <p className="text-indigo-100 mb-4">Job Requesting & Ordering System</p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white/90">Secure Access</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white/90">Role-Based</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white/90">Audit Trail</span>
                </div>
              </div>

              {/* Footer note */}
              <p className="mt-8 text-indigo-200/70 text-sm">
                © 2026 General Services Unit &bull; UEP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for Suspense fallback
const LoginPageSkeleton = () => (
  <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto animate-pulse space-y-6">
            <div className="h-10 w-40 bg-slate-200 rounded-xl" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-6 w-full bg-slate-200 rounded" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-slate-200 rounded-xl" />
              <div className="h-12 w-full bg-slate-200 rounded-xl" />
            </div>
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-full bg-slate-200 rounded" />
              <div className="h-6 w-full bg-slate-200 rounded" />
              <div className="h-6 w-full bg-slate-200 rounded" />
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 px-8 py-12">
          <div className="text-center text-white max-w-lg animate-pulse space-y-6">
            <div className="h-28 w-28 mx-auto bg-white/20 rounded-full" />
            <div className="h-8 w-3/4 mx-auto bg-white/20 rounded" />
            <div className="h-6 w-1/2 mx-auto bg-white/20 rounded" />
            <div className="h-32 w-full bg-white/10 rounded-2xl" />
            <div className="h-4 w-1/3 mx-auto bg-white/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const LoginPage = () => {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageInner />
    </Suspense>
  )
}

export default LoginPage