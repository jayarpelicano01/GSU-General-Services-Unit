"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    system: [
      { label: "Login", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Job Requests", href: "/job-request-list" },
      { label: "Job Orders", href: "/job-order-list" },
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "User Guide", href: "#" },
      { label: "Changelog", href: "#" },
    ],
    support: [
      { label: "Contact GSU", href: "#" },
      { label: "Report Issue", href: "#" },
      { label: "Feedback", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg">GSU System</h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Job Requesting & Ordering</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Streamlining facility maintenance workflows for the General Services Unit.
              From request to completion — transparent, accountable, efficient.
            </p>
          </div>

          {/* System Links */}
          <nav aria-label="System Navigation">
            <h4 className="text-white font-semibold mb-4">System</h4>
            <ul className="space-y-3">
              {footerLinks.system.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support">
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400">
              © {currentYear} General Services Unit
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              University of Eastern Philippines • Catarman, Northern Samar
            </p>
          </div>

          {/* Version & Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400">
              v1.0.0-beta
            </span>
            <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-indigo-900/30 text-indigo-300">
              Next.js 15 + React 19
            </span>
            <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-emerald-900/30 text-emerald-300">
              Express 5 + Sequelize 6
            </span>
            <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-amber-900/30 text-amber-300">
              MySQL 8
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}