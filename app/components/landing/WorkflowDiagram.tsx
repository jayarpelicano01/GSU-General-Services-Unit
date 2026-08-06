"use client";

import { motion, type Variants } from "framer-motion";

interface WorkflowStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  role: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    number: 1,
    title: "Submit Request",
    description: "Unit staff creates detailed job request with field of work, specifications, and estimated duration",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-500/15",
    borderColor: "border-amber-200 dark:border-amber-500/30",
    role: "UNIT STAFF",
  },
  {
    number: 2,
    title: "Schedule Inspection",
    description: "GSU staff reviews request, assigns inspection personnel, and sets scheduled date",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: "text-blue-600 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-500/15",
    borderColor: "border-blue-200 dark:border-blue-500/30",
    role: "GSU STAFF",
  },
  {
    number: 3,
    title: "Conduct Inspection",
    description: "Assigned personnel performs on-site inspection, records assessment results and duration estimates",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-blue-600 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-500/15",
    borderColor: "border-blue-200 dark:border-blue-500/30",
    role: "PERSONNEL",
  },
  {
    number: 4,
    title: "Assess Materials",
    description: "Based on inspection, determine if materials are available or if purchase request is needed",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-1.5 0h1.5m-18.375.75a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75H3m14.25 1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h1.5m-1.5 11.25h-9.75c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125zm-3.75-13.5h9a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25z" />
      </svg>
    ),
    color: "text-orange-600 dark:text-orange-300",
    bgColor: "bg-orange-50 dark:bg-orange-500/15",
    borderColor: "border-orange-200 dark:border-orange-500/30",
    role: "SUPPLY OFFICER",
  },
  {
    number: 5,
    title: "Create Job Order",
    description: "Approved requests convert to job orders with assigned personnel and printable documentation",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H6a3.375 3.375 0 00-3.375 3.375v11.25A3.375 3.375 0 006 19.5h7.5" />
      </svg>
    ),
    color: "text-indigo-600 dark:text-indigo-300",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/15",
    borderColor: "border-indigo-200 dark:border-indigo-500/30",
    role: "GSU STAFF",
  },
  {
    number: 6,
    title: "Execute Work",
    description: "Assigned personnel performs the work, tracks progress, and updates completion status",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/15",
    borderColor: "border-emerald-200 dark:border-emerald-500/30",
    role: "PERSONNEL",
  },
  {
    number: 7,
    title: "Complete & Report",
    description: "Work marked complete, unit head signs off, accomplishment report generated and archived",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    role: "UNIT HEAD",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const circleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function WorkflowDiagram() {
  return (
    <section id="workflow" className="relative py-16 sm:py-24 bg-[#f8f9ff] dark:bg-slate-950 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            The Complete GSU Workflow
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Seven connected steps, each with clear ownership, an audit trail, and digital documentation.
          </p>
        </motion.div>

        {/* Desktop: Horizontal Stepper */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting line with draw animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute top-10 left-0 right-0 h-0.5 origin-left bg-slate-200 dark:bg-slate-800"
            />
            {/* Animated progress fill on the line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
              className="absolute top-10 left-0 right-0 h-0.5 origin-left bg-indigo-400"
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex items-start justify-between gap-2"
            >
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center relative z-10 w-full group"
                >
                  {/* Step Circle & Number */}
                  <motion.div
                    variants={circleVariants}
                    className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center ${step.bgColor} ${step.borderColor} shadow-sm transition-shadow duration-300 group-hover:shadow-md`}
                  >
                    <span className={`text-2xl font-display ${step.color}`}>
                      {step.number}
                    </span>
                    {/* Pulse animation for first step */}
                    {index === 0 && (
                      <div className="absolute inset-0 rounded-full border-4 border-current animate-ping opacity-75" style={{ borderColor: step.color.replace('text-', '') }} />
                    )}
                    {/* Hover ring */}
                    <div className="absolute -inset-2 rounded-full border-2 border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors duration-300" />
                  </motion.div>

                  {/* Role Badge */}
                  <span className={`mt-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${step.bgColor} ${step.color}`}>
                    {step.role}
                  </span>

                  {/* Title */}
                  <h3 className="mt-3 text-center text-sm font-bold text-slate-900 dark:text-slate-100 max-w-[140px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 max-w-[140px] leading-snug">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile: Vertical Cards */}
        <div className="lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.number}
                variants={itemVariants}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-colors duration-200 group dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/30 dark:hover:shadow-none"
              >
                {/* Step Indicator */}
                <div className="flex flex-col items-center shrink-0">
                  <motion.div
                    variants={circleVariants}
                    className={`relative w-12 h-12 rounded-full border-3 flex items-center justify-center ${step.bgColor} ${step.borderColor}`}
                  >
                    <span className={`text-xl font-display ${step.color}`}>
                      {step.number}
                    </span>
                  </motion.div>
                  {index < workflowSteps.length - 1 && (
                    <div className="w-0.5 h-16 bg-slate-200 dark:bg-slate-800 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${step.bgColor} ${step.color}`}>
                      {step.role}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Roles Involved", value: "4", color: "indigo" },
            { label: "Workflow Steps", value: "7", color: "blue" },
            { label: "Status States", value: "7", color: "emerald" },
            { label: "Document Types", value: "5+", color: "amber" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className={`p-4 rounded-xl text-center bg-${stat.color}-50 border border-${stat.color}-100 hover:shadow-md transition-shadow duration-200 dark:bg-${stat.color}-500/15 dark:border-${stat.color}-500/30 dark:hover:shadow-none`}
            >
              <div className={`text-3xl font-display text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}