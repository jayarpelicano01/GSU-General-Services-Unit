"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import MoltenMetal from "@/components/ui/MoltenMetal";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#f8f9ff] py-20 sm:py-28 lg:py-32 dark:bg-slate-950">
      {/* Full-bleed MoltenMetal background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl lg:w-[55%]">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 shadow-sm dark:bg-slate-900 dark:border-indigo-500/30 dark:text-indigo-300"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            System is now live
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05] dark:text-slate-100"
          >
            GSU Job Requesting
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">& Job Ordering System</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
          >
            Streamline your maintenance requests, inspections, and job orders with
            the University General Services Unit.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a
              href="#workflow"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              How it works
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
