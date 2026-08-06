"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { useToast } from "@/app/context/ToastContext"
import { useTheme } from "@/app/context/ThemeContext"
import { getErrorMessage } from "@/app/utils/errors"
import { Moon, Sun } from "lucide-react"

// Inner component that uses useSearchParams - must be wrapped in Suspense
const LoginPageInner = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("redirect") || "/dashboard"
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // If a session is already active (the user just backed into this page
  // without logging out), send them straight back to the dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(callbackUrl)
    }
  }, [authLoading, isAuthenticated, callbackUrl, router])

  // Only show the full-page skeleton while restoring an existing session on
  // first load. During an active submit the form stays visible and the button
  // shows its own spinner/disabled state instead.
  if (authLoading && !loading) {
    return <LoginPageSkeleton />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password, false)
      success("Signed in successfully.")
      // Redirect happens via the effect above once the session becomes active
    } catch (err) {
      const reason = getErrorMessage(err, "Unable to sign in. Please check your credentials.")
      setError(reason)
      toastError(reason)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-[#f8f9ff] dark:bg-slate-950">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Centered Card Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Login Form */}
          <div className="flex-1 lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              {/* Logo & Title */}
              <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow dark:shadow-none">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <div>
                  <span className="text-xl font-display text-slate-900 dark:text-slate-100">GSU <span className="text-indigo-600 dark:text-indigo-400">System</span></span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Job Requesting & Ordering</p>
                </div>
              </Link>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign in to your account</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Enter your credentials to access the dashboard</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300" role="alert">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full pl-11 pr-4 py-3 border border-slate-200 bg-slate-50/50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:placeholder:text-slate-500 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:border-indigo-500"
                      placeholder="Email address"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-11 pr-4 py-3 border border-slate-200 bg-slate-50/50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:placeholder:text-slate-500 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:border-indigo-500"
                      placeholder="Password"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 dark:shadow-none dark:focus:ring-offset-slate-900"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                <p className="inline-flex items-center gap-3 text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <span className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                  Demo credentials
                  <span className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                </p>
                <div className="mt-3 space-y-1 text-[11px] font-mono bg-slate-50 border border-slate-100 rounded-xl p-4 text-left text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-300">
                  <div><span className="text-indigo-600 dark:text-indigo-400">GSU Staff:</span> gsu.staff@uep.edu.ph / TestPass123</div>
                  <div><span className="text-indigo-600 dark:text-indigo-400">Unit Head:</span> cs.head@uep.edu.ph / TestPass123</div>
                  <div><span className="text-indigo-600 dark:text-indigo-400">Unit Staff:</span> unit.staff@uep.edu.ph / TestPass123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - UEP Logo & Branding */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-indigo-700 px-8 py-12 relative overflow-hidden">
            <div className="relative z-10 text-center text-white max-w-lg">
              {/* UEP Logo */}
              <div className="relative mb-8">
                <div className="absolute inset-0 mx-auto w-28 h-28 bg-indigo-400/40 rounded-full blur-2xl animate-pulse" />
                <img
                  src="/UEP-Logo.png"
                  alt="University of Eastern Philippines"
                  className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Institution Name */}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
                University of Eastern Philippines
              </h3>
              <p className="text-indigo-100 text-base mb-6 uppercase tracking-wider">
                Catarman, Northern Samar
              </p>

              {/* System Branding */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold mb-1">General Services Unit</h4>
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
  <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-[#f8f9ff] dark:bg-slate-950">
    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-500/30 rounded-xl" />
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-12 w-full bg-indigo-100 dark:bg-indigo-500/30 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-indigo-700 px-8 py-12">
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
