"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Smoothly scroll to a section, accounting for the fixed header height
  const scrollToSection = useCallback((id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    // Wait a frame so the mobile menu closes and body scroll unlocks first
    setTimeout(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 80);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="GSU System Home">
            <img
              src="/UEP-Logo.png"
              alt="University of Eastern Philippines"
              className="w-9 h-9 lg:w-10 lg:h-10 object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-lg font-extrabold text-slate-900">GSU System</span>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Job Requesting & Ordering</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("features")}
              className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors group"
            >
              Features
              <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors group"
            >
              Workflow
              <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors">Login</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="lg:hidden">
          {/* Backdrop - click to close */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <nav
            aria-label="Mobile navigation"
            className="fixed left-0 right-0 top-16 z-50 mx-3 sm:mx-6 rounded-2xl bg-white border border-slate-200 shadow-xl p-2"
          >
            <button
              onClick={() => scrollToSection("features")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            >
              Workflow
            </button>
            <div className="my-1 border-t border-slate-100" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
