"use client"

import { useState, useEffect } from "react"
import { FileText, Search, Filter, ArrowRight, ShieldCheck, Download } from "lucide-react"
import Link from "next/link"
import { getAuditReportsAction } from "@/app/actions/procurement-actions"

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReports() {
            try {
                const result = await getAuditReportsAction()
                if (result.success) {
                    setReports(result.items || [])
                }
            } catch (err) {
                console.error("Failed to fetch reports:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Saved Audit Reports</h1>
                    <p className="text-zinc-500">View and export AI-generated compliance audit reports for all analyzed documents.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50">
                    <Download className="h-4 w-4" />
                    Export All Reports
                </button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search reports by title or ID..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm animate-pulse" />
                    ))
                ) : reports.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-zinc-100 p-20 text-center">
                        <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-500 italic font-medium">No saved reports found. Analyze a document to create one.</p>
                        <Link href="/dashboard/procurements/new" className="text-blue-600 font-bold mt-4 inline-block hover:underline">
                            Start Analysis
                        </Link>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.docId} className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-zinc-300">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-inner shrink-0 group-hover:bg-zinc-100 transition-colors">
                                    <span className={`text-2xl font-black ${report.overall_compliance_score > 70 ? "text-emerald-600" :
                                            report.overall_compliance_score > 40 ? "text-yellow-600" : "text-rose-600"
                                        }`}>
                                        {report.overall_compliance_score}
                                    </span>
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Health</span>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight">{report.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-zinc-400 font-medium px-2 py-0.5 rounded bg-zinc-50 border border-zinc-100">{report.id}</span>
                                            {report.provider && (
                                                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                                                    report.provider === 'genkit' ? 'bg-blue-100 text-blue-700' :
                                                    report.provider === 'openrouter' ? 'bg-purple-100 text-purple-700' :
                                                    report.provider === 'basic' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {report.provider === 'genkit' ? 'Google AI' :
                                                     report.provider === 'openrouter' ? 'OpenRouter' :
                                                     report.provider === 'basic' ? 'Basic Analysis' : 'AI'}
                                                </span>
                                            )}
                                            {report.fallback && (
                                                <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                                    Fallback
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            {report.method}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                                        <span>Audited {report.date}</span>
                                    </div>
                                    {report.summary && (
                                        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                            <p className="text-[13px] text-zinc-600 leading-snug font-medium mb-1">AI Analysis Summary:</p>
                                            <p className="text-[13px] text-zinc-700 line-clamp-3">{report.summary}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-6 shrink-0">
                                <Link
                                    href={`/dashboard/procurements/${report.docId}?tab=compliance`}
                                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-black text-white shadow-xl transition-all hover:bg-zinc-800 active:scale-95"
                                >
                                    VIEW FULL REPORT
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
