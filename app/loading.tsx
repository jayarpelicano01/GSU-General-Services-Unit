import Image from "next/image"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f8f9ff]">
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-indigo-100/70">
        <div className="h-full w-1/3 bg-indigo-600 animate-loading-bar" />
      </div>

      {/* Ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-72 bg-indigo-100/60 rounded-full blur-2xl animate-aurora" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/40 blur-2xl animate-pulse" />
          <Image
            src="/UEP-Logo.png"
            alt="GSU System"
            width={80}
            height={80}
            className="relative object-contain animate-float-slow"
            priority
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="h-6 w-6 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading...</span>
        </div>
      </div>
    </div>
  )
}
