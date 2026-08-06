"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/app/context/AuthContext"
import { useToast } from "@/app/context/ToastContext"
import { useTheme } from "@/app/context/ThemeContext"
import { getErrorMessage } from "@/app/utils/errors"
import { Moon, Sun, Mail, Lock } from "lucide-react"
import MoltenMetal from "@/components/ui/MoltenMetal"

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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9ff] px-4 py-12 dark:bg-slate-950">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-xl text-slate-500 hover:text-slate-900 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm hover:bg-white transition-colors dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/80 dark:border-slate-700"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Centered rectangle container */}
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-100/60 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none lg:flex-row">
        {/* Left 40% - Login Form */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:w-2/5 dark:bg-slate-900">
          <div className="w-full">
            {/* Logo & Branding */}
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm group-hover:border-indigo-200 transition-colors dark:bg-slate-900 dark:border-slate-800">
                <Image
                  src="/UEP-Logo.png"
                  alt="University of Eastern Philippines"
                  width={40}
                  height={40}
                  className="w-9 h-9 object-contain"
                />
              </span>
              <span>
                <span className="text-xl font-display text-slate-900 dark:text-slate-100">GSU <span className="text-indigo-600 dark:text-indigo-400">System</span></span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Requesting & Ordering</p>
              </span>
            </Link>

            {/* Sign In Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Please sign in to continue.</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Mail className="w-5 h-5" aria-hidden="true" />
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-slate-500 hover:text-indigo-600 transition-colors dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Lock className="w-5 h-5" aria-hidden="true" />
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

              <div className="pt-1">
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
                      "Sign In"
                    )}
                  </span>
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <span className="text-indigo-600 font-medium dark:text-indigo-400">Contact administrator</span>
            </p>
          </div>
        </div>

        {/* Right 60% - Molten Visual */}
        <div className="relative min-h-[300px] overflow-hidden bg-[#f8f9ff] lg:w-3/5 dark:bg-slate-950">
          <div className="absolute inset-0" aria-hidden="true">
            <MoltenMetal
              color1="#5227FF"
              color2="#FF9FFC"
              color3="#FFFFFF"
              speed={0.35}
              scale={4}
              detail={3}
              glow={1.6}
              coreSize={0.1}
              swirl={1}
              fold={-0.2}
              blackPoint={0.05}
              brightness={1.3}
              colorMode="molten"
              grain={true}
              grainIntensity={0.05}
              mouseInteraction={true}
              mouseStrength={0.3}
              opacity={0.5}
            />
          </div>

          {/* Tagline - upper left, ~24% from top */}
          <div className="absolute left-8 top-[24%] z-10 max-w-[75%] lg:left-10">
            <p className="text-lg sm:text-xl font-medium leading-snug text-slate-800 dark:text-white dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
              Keep your facilities running smoothly.
            </p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
              Request, inspect, and track every job order in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for Suspense fallback
const LoginPageSkeleton = () => (
  <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9ff] px-4 py-12 dark:bg-slate-950">
    <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-100/60 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none lg:flex-row">
      <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:w-2/5 dark:bg-slate-900">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="h-9 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-5 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
          <div className="h-12 w-full bg-indigo-100 dark:bg-indigo-500/30 rounded-xl" />
          <div className="h-5 w-64 mx-auto bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="relative min-h-[300px] overflow-hidden bg-[#f8f9ff] lg:w-3/5 dark:bg-slate-950">
        <div className="absolute left-8 top-[24%] max-w-[75%] animate-pulse lg:left-10">
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/15 rounded" />
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-white/15 rounded mt-3" />
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
