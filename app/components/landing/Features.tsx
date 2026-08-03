"use client";

import { motion, type Variants } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "Submit Requests",
    description: "Unit staff create detailed job requests with field of work, specifications, estimated duration, and material requirements — all in a guided multi-step form.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Inspect & Approve",
    description: "GSU staff schedule inspections, assign personnel, record assessment results, and determine material availability — with full audit trail and digital sign-off.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-1.5 0h1.5m-18.375.75a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75H3m14.25 1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h1.5m-1.5 11.25h-9.75c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125zm-3.75-13.5h9a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25z" />
      </svg>
    ),
    title: "Order & Complete",
    description: "Convert approved requests to job orders, assign personnel, track execution progress, and generate completion reports with printable documentation.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
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
    <section id="features" className="relative py-16 sm:py-24 bg-white overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-72 bg-indigo-50 rounded-full blur-2xl animate-aurora" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-50 rounded-full blur-2xl animate-float-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
            Built for Your Workflow
          </h2>
          <p className="text-lg text-slate-600">
            Every feature designed around the actual GSU process — no forced workflows, no missing steps.
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
              className="group relative p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-colors duration-300"
            >
              {/* Top accent line on hover */}
              <span className="absolute top-0 left-6 right-6 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

              {/* Icon Wrapper */}
              <div className={`${feature.bgColor} ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed">
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
          <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center">Also Includes</h3>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
          >
            {[
              { label: "Role-based dashboards", icon: "👥" },
              { label: "Printable reports", icon: "📄" },
              { label: "Real-time status", icon: "⚡" },
              { label: "Audit logging", icon: "📋" },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group p-4 bg-slate-50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md hover:shadow-indigo-100 transition-all duration-200 cursor-default"
              >
                <span className="text-2xl mb-2 block group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300">{item.icon}</span>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}