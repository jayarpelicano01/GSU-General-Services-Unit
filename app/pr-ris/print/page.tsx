"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface Item {
  stock: string | null;
  unit: string | null;
  description: string;
  qty: number | null;
  remarks: string | null;
  cost: number | null;
  amount: number | null;
}

interface Document {
  id: number;
  document_type: "PR" | "RIS";
  doc_no: string | null;
  office: string | null;
  division: string | null;
  date: string;
  purpose: string | null;
  status: string;
  total: number | null;
  items: Item[];
  job_request?: {
    id: number;
    specific_work: string;
    field_work: string;
    unit?: { unit_name: string; unit_acronym: string } | null;
  } | null;
}

const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const toNumber = (value: number | string | null | undefined) => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n ?? 0;
};

const PrintPrRis = () => {
  const [doc] = useState<Document | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("pr-ris-document");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [origin] = useState<"tab" | "inspection">(() => {
    if (typeof window === "undefined") return "tab";
    return localStorage.getItem("pr-ris-origin") === "inspection" ? "inspection" : "tab";
  });

  const isPR = doc?.document_type === "PR";
  const title = isPR ? "PURCHASE REQUEST" : "REQUISITION AND ISSUE SLIP";
  const docLabel = isPR ? "PR No." : "RIS No.";
  const itemCols = isPR ? 6 : 8;

  return (
    <DashboardLayout>
      <ProtectedRoute>
        <div className="space-y-4 print:space-y-0">
          {/* Breadcrumb */}
          <nav className="no-print flex flex-wrap items-center gap-2 text-sm">
            {origin === "inspection" ? (
              <>
                <Link href="/schedule-inspection" className="text-slate-400 hover:text-indigo-600 font-medium transition-colors">
                  Inspections
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 hover:text-indigo-600 font-medium transition-colors">
                  {doc?.document_type === "PR" ? "PR" : "RIS"}
                </span>
              </>
            ) : (
              <>
                <Link href="/pr-ris" className="text-slate-400 hover:text-indigo-600 font-medium transition-colors">
                  PR / RIS
                </Link>
                <span className="text-slate-300">/</span>
              </>
            )}
            <span className="text-slate-700 font-semibold">Print</span>
          </nav>

          <div className="no-print flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{title} — Print Preview</h1>
              <p className="text-sm text-slate-400 mt-0.5">Review the document before printing</p>
            </div>
          </div>

          <div className="print-area bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-200 overflow-x-auto print:border-0 print:shadow-none print:overflow-visible">
            <div
              style={{ padding: "15mm 20mm 15mm 20mm" }}
              className="print-header text-black font-sans w-[210mm] min-h-[297mm] mx-auto overflow-hidden bg-white flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-center items-center relative mb-2">
                <Image
                  src="/UEP-Logo.png"
                  loading="eager"
                  alt="UEP Logo"
                  width={90}
                  height={90}
                  className="absolute left-0"
                />
                <div className="text-center text-[13px] leading-snug">
                  <p>Republic of the Philippines</p>
                  <p className="font-bold">UNIVERSITY OF EASTERN PHILIPPINES</p>
                  <p className="italic">University Town, Northern Samar</p>
                  <p className="text-[11px]">
                    Website: <span style={{ color: '#0056b3' }}>http://uep.edu.ph</span>{' '}
                    Email: <span style={{ color: '#0056b3' }}>uepnsofficial@gmail.com</span>
                  </p>
                </div>
                <div className="absolute right-0 flex items-center gap-1">
                  <Image src="/socotec.jpg" alt="Socotec Logo" width={70} height={70} />
                  <Image src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" width={70} height={70} />
                </div>
              </div>

              {/* Blue divider */}
              <div style={{ backgroundColor: '#0056b3' }} className="bg-blue-header h-1.75 mt-4 mb-0.5" />

              {/* Title */}
              <div className="text-center mb-4 mt-3">
                <p className="font-bold text-[13px] tracking-widest uppercase">General Services Unit</p>
                <p className="font-bold text-[24px] tracking-wide uppercase mt-1">{title}</p>
              </div>

              {/* Top section */}
              <div className="grid grid-cols-2 gap-8 mb-4 text-[12px]">
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="font-bold w-20 shrink-0">Division:</span>
                    <span className="flex-1 border-b border-black block">{doc?.division ?? ""}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-bold w-20 shrink-0">Office:</span>
                    <span className="flex-1 border-b border-black block font-semibold">{doc?.office ?? ""}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="font-bold w-20 shrink-0">{docLabel}:</span>
                    <span className="flex-1 border-b border-black block">{doc?.doc_no ?? ""}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-bold w-20 shrink-0">Date:</span>
                    <span className="flex-1 border-b border-black block">{doc ? formatDate(doc.date) : ""}</span>
                  </div>
                </div>
              </div>

              {/* Main section: items + flex spacer + bottom, fills page height */}
              <div className="flex-1 flex flex-col">
                {/* Items table */}
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    {isPR ? (
                      <>
                        <col style={{ width: '10%' }} /><col style={{ width: '10%' }} /><col style={{ width: '45%' }} /><col style={{ width: '10%' }} /><col style={{ width: '12%' }} /><col style={{ width: '13%' }} />
                      </>
                    ) : (
                      <>
                        <col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '34%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '10%' }} /><col style={{ width: '16%' }} />
                      </>
                    )}
                  </colgroup>
                  <thead>
                    {isPR ? (
                      <tr className="text-[10px] font-bold uppercase">
                        <th className="border border-black px-2 py-1.5">Stock</th>
                        <th className="border border-black px-2 py-1.5">Unit</th>
                        <th className="border border-black px-2 py-1.5">Description</th>
                        <th className="border border-black px-2 py-1.5">Qty</th>
                        <th className="border border-black px-2 py-1.5">Cost</th>
                        <th className="border border-black px-2 py-1.5">Amount</th>
                      </tr>
                    ) : (
                      <>
                        <tr className="text-[10px] font-bold uppercase">
                          <th className="border border-black px-2 py-1" colSpan={4}>REQUISITION</th>
                          <th className="border border-black px-2 py-1" colSpan={2}>Stock Available</th>
                          <th className="border border-black px-2 py-1" colSpan={2}>Issue</th>
                        </tr>
                        <tr className="text-[10px] font-bold uppercase">
                          <th className="border border-black px-2 py-1">Stock</th>
                          <th className="border border-black px-2 py-1">Unit</th>
                          <th className="border border-black px-2 py-1">Description</th>
                          <th className="border border-black px-2 py-1">Qty</th>
                          <th className="border border-black px-2 py-1">Yes</th>
                          <th className="border border-black px-2 py-1">No</th>
                          <th className="border border-black px-2 py-1">Qty</th>
                          <th className="border border-black px-2 py-1">Remarks</th>
                        </tr>
                      </>
                    )}
                  </thead>
                  <tbody>
                    {(doc?.items ?? []).map((item, index) => {
                      const isLast = index === (doc?.items ?? []).length - 1;
                      return (
                        <tr key={index}>
                          <td className={`px-2 py-2 text-[11px] border-x border-t border-black ${isLast ? '' : 'border-b'}`}>{item.stock ?? ""}</td>
                          <td className={`px-2 py-2 text-[11px] border-x border-t border-black ${isLast ? '' : 'border-b'}`}>{item.unit ?? ""}</td>
                          <td className={`px-2 py-2 text-[11px] border-x border-t border-black ${isLast ? '' : 'border-b'}`}>{item.description}</td>
                          <td className={`px-2 py-2 text-[11px] text-center border-x border-t border-black ${isLast ? '' : 'border-b'}`}>{toNumber(item.qty)}</td>
                          {isPR ? (
                            <>
                              <td className={`px-2 py-2 text-[11px] text-right border-x border-t border-black ${isLast ? '' : 'border-b'}`}>
                                {item.cost != null ? toNumber(item.cost).toFixed(2) : ""}
                              </td>
                              <td className={`px-2 py-2 text-[11px] text-right border-x border-t border-black ${isLast ? '' : 'border-b'}`}>
                                {item.amount != null ? toNumber(item.amount).toFixed(2) : ""}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={`px-2 py-2 text-[11px] text-center border-x border-t border-black ${isLast ? '' : 'border-b'}`} />
                              <td className={`px-2 py-2 text-[11px] text-center border-x border-t border-black ${isLast ? '' : 'border-b'}`} />
                              <td className={`px-2 py-2 text-[11px] text-center border-x border-t border-black ${isLast ? '' : 'border-b'}`} />
                              <td className={`px-2 py-2 text-[11px] text-center border-x border-t border-black ${isLast ? '' : 'border-b'}`}>{item.remarks ?? ""}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Flex spacer — column dividers extend through to the bottom section */}
                <div
                  className="flex-1"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isPR
                      ? '10% 10% 45% 10% 12% 13%'
                      : '8% 8% 34% 8% 8% 8% 10% 16%',
                  }}
                >
                  {Array.from({ length: itemCols }).map((_, i) => (
                    <div
                      key={i}
                      className="border-l border-black"
                      style={i === itemCols - 1 ? { borderRight: '1px solid black' } : undefined}
                    />
                  ))}
                </div>

                {/* Bottom section: TOTAL (PR) + Purpose + Signatories */}
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    {isPR ? (
                      <>
                        <col style={{ width: '10%' }} /><col style={{ width: '10%' }} /><col style={{ width: '45%' }} /><col style={{ width: '10%' }} /><col style={{ width: '12%' }} /><col style={{ width: '13%' }} />
                      </>
                    ) : (
                      <>
                        <col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '34%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '10%' }} /><col style={{ width: '16%' }} />
                      </>
                    )}
                  </colgroup>
                  <tbody>
                    {/* PR: TOTAL */}
                    {isPR && (
                      <tr>
                        <td colSpan={5} className="border border-black px-2 py-2 text-[11px] font-bold text-right">TOTAL</td>
                        <td className="border border-black px-2 py-2 text-[11px] font-bold text-right">
                          {toNumber(doc?.total).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Purpose */}
                    <tr>
                      <td colSpan={itemCols} className="border-l border-t border-r border-black px-2 py-2 text-[12px]">
                        <div className="flex items-end gap-2">
                          <span className="font-bold w-20 shrink-0">Purpose:</span>
                          <span className="flex-1 block">{doc?.purpose ?? ""}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatories — separate table for equal 33/34/33 distribution */}
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-black px-2 py-2 text-[12px] text-center" style={{ width: '33%' }}>
                        <div className="h-10 flex items-end justify-center">
                          <div className="border-b border-black w-36 text-[11px] font-semibold whitespace-nowrap">Nenita P. Baldado, PhD</div>
                        </div>
                        <p className="mt-1.5 text-[11px]">Vice President</p>
                      </td>
                      <td className="border border-black px-2 py-2 text-[12px] text-center" style={{ width: '34%' }}>
                        <div className="h-10 flex items-end justify-center">
                          <div className="border-b border-black w-36 text-[11px] font-semibold whitespace-nowrap">Arnold A. Sales, LPT, MAED-PE</div>
                        </div>
                        <p className="mt-1.5 text-[11px]">General Services Unit Head</p>
                      </td>
                      <td className="border border-black px-2 py-2 text-[12px] text-center" style={{ width: '33%' }}>
                        <div className="h-10 flex items-end justify-center">
                          <div className="border-b border-black w-36 text-[11px] font-semibold whitespace-nowrap">Cherry I. Ultra, PhD</div>
                        </div>
                        <p className="mt-1.5 text-[11px]">President</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer table (the blue box) */}
              <div style={{ borderWidth: '2px' }} className="mt-8 border border-blue-400 grid grid-cols-3 tex text-[11px] font-bold uppercase overflow-hidden">
                <div className="p-2 border-r border-blue-400 text-[11px]">
                  DOCUMENT NO: <br />
                  <div className="flex justify-center text-center w-full">
                    <span className="border-b border-black w-40">UEP-GSU-FM-010</span>
                  </div>
                </div>
                <div style={{ borderWidth: '0 1px 0 1px' }} className="border-r p-2 border-blue-400 flex text-[11px] flex-col justify-center">
                  REVISION NO: <br />
                  <div className="flex justify-center text-center w-full">
                    <span className="border-b border-black w-40">00</span>
                  </div>
                </div>
                <div style={{ borderWidth: '0 0 0 1px ' }} className="p-2 border-blue-400 text-[11px]">
                  EFFECTIVITY DATE: <br />
                  <div className="flex justify-center text-center">
                    <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating print button */}
          <button
            onClick={() => window.print()}
            className="no-print fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 text-sm font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>

          <style jsx global>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; margin: 0 !important; }
              main, #main-content { margin-left: 0 !important; padding: 0 !important; }
              .print-area { border: none !important; box-shadow: none !important; overflow: visible !important; }
              .bg-blue-header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          `}</style>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export default PrintPrRis;
