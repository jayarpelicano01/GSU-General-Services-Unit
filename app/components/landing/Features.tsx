"use client";

import { motion, type Variants } from "framer-motion";
import { Users, FileText, Zap, ClipboardList } from "lucide-react";
import { LordIcon } from "@/components/ui/lord-icon";

interface Feature {
  lordIcon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  primary: string;
  secondary: string;
}

const features: Feature[] = [
  {
    lordIcon: "hmpomorl",
    title: "Submit Requests",
    description: "Unit staff create detailed job requests with field of work, specifications, estimated duration, and material requirements, all in a guided multi-step form.",
    color: "text-indigo-600 dark:text-indigo-300",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/15",
    primary: "#4f46e5",
    secondary: "#c7d2fe",
  },
  {
    lordIcon: "wjyqkiew",
    title: "Inspect & Approve",
    description: "GSU staff schedule inspections, assign personnel, record assessment results, and determine material availability, with full audit trail and digital sign-off.",
    color: "text-blue-600 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-500/15",
    primary: "#2563eb",
    secondary: "#bfdbfe",
  },
  {
    lordIcon: "fwkrbvja",
    title: "Order & Complete",
    description: "Convert approved requests to job orders, assign personnel, track execution progress, and generate completion reports with printable documentation.",
    color: "text-emerald-600 dark:text-emerald-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/15",
    primary: "#10b981",
    secondary: "#a7f3d0",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            Built for Your Workflow
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Every feature designed around the actual GSU process, with no forced workflows and no missing steps.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-colors duration-300 dark:bg-slate-800/50 dark:border-slate-800 dark:hover:border-indigo-500/30 dark:hover:shadow-none"
            >
              {/* Top accent line on hover */}
              <span className="absolute top-0 left-6 right-6 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

              {/* Icon Wrapper */}
              <div className={`${feature.bgColor} ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <LordIcon icon={feature.lordIcon} trigger="hover" primary={feature.primary} secondary={feature.secondary} className="w-7 h-7" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </motion.div>

        {/* Additional capabilities list */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-16"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">Also Includes</h3>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
          >
            {[
              { label: "Role-based dashboards", icon: Users },
              { label: "Printable reports", icon: FileText },
              { label: "Real-time status", icon: Zap },
              { label: "Audit logging", icon: ClipboardList },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group p-4 bg-slate-50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md hover:shadow-indigo-100 transition-all duration-200 cursor-default dark:bg-slate-800 dark:hover:border-indigo-500/30 dark:hover:bg-slate-800 dark:hover:shadow-none"
              >
                <item.icon className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}