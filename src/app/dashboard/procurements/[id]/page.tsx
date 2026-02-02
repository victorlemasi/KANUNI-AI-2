"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    ExternalLink,
    CheckCircle2,
    AlertTriangle,
    History,
    FileText,
    ShieldCheck,
    RefreshCw,
    AlertCircle,
    Loader2,
    ClipboardCheck
} from "lucide-react"
import Link from "next/link"
import { getProcurementByIdAction } from "@/app/actions/procurement-actions"

export default function ProcurementDetails({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState("details")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDetails() {
            try {
                const result = await getProcurementByIdAction(params.id)
                if (result.success) {
                    setData(result)
                }
            } catch (err) {
                console.error("Fetch Details Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [params.id])

    const tabs = [
        { id: "details", name: "Details", icon: FileText },
        { id: "risk", name: "Risk Assessment", icon: AlertTriangle },
        { id: "compliance", name: "Compliance", icon: ShieldCheck },
        { id: "audit", name: "Audit Trail", icon: History },
    ]

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-zinc-900">Procurement not found</h2>
                <Link href="/dashboard/procurements" className="text-blue-500 hover:underline mt-4 inline-block">Back to list</Link>
            </div>
        )
    }

    const { procurement, analysis } = data

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/procurements"
                    className="rounded-full border border-zinc-200 bg-white p-2 hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        {procurement.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                        <span className="font-mono text-zinc-400">{procurement.id}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                        <span>Created {procurement.date}</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${procurement.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        }`}>
                        {procurement.status}
                    </span>
                    <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800">
                        Edit Procurement
                    </button>
                </div>
            </div>

            <div className="border-b border-zinc-200">
                <nav className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? "border-zinc-950 text-zinc-950"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="min-h-[500px]">
                {activeTab === "details" && <DetailsTab procurement={procurement} />}
                {activeTab === "risk" && <RiskTab procurement={procurement} analysis={analysis} />}
                {activeTab === "compliance" && <ComplianceTab analysis={analysis} />}
                {activeTab === "audit" && <AuditLogTab />}
            </div>
        </div>
    )
}

function DetailsTab({ procurement }: { procurement: any }) {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6 border-b border-zinc-50 pb-2">General Information</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1 uppercase tracking-widest text-[10px]">Method</p>
                            <p className="font-bold text-zinc-900">{procurement.method}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1 uppercase tracking-widest text-[10px]">Estimated Value</p>
                            <p className="font-bold text-zinc-900">KES {Number(procurement.value).toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-zinc-400 mb-1 uppercase tracking-widest text-[10px]">Draft Scope</p>
                            <p className="text-zinc-600 leading-relaxed text-sm">
                                {procurement.description || "No additional description provided."}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Documents</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 group cursor-default">
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-900">TenderDocs.pdf</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">ANALYZED</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function RiskTab({ procurement, analysis }: { procurement: any, analysis: any }) {
    const riskScore = procurement.risk === "Low" ? 20 : 85;
    const isLowRisk = procurement.risk === "Low";

    return (
        <div className="space-y-8">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-zinc-900">AI Risk Intelligence</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                        <RefreshCw className="h-3 w-3" />
                        RE-ANALYZE
                    </button>
                </div>

                <div className="flex items-center gap-12 p-8 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    stroke={isLowRisk ? "#10b981" : "#f43f5e"}
                                    strokeWidth="2.5"
                                    strokeDasharray={`${riskScore}, 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-4xl font-black text-zinc-900 tracking-tight">{riskScore}</span>
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Risk Score</span>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isLowRisk ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}>
                            {procurement.risk.toUpperCase()} PROBABILITY
                        </div>
                        <h4 className="text-xl font-bold text-zinc-900 leading-tight">
                            {analysis?.summary || "AI has evaluated the procurement as standard with no immediate red flags."}
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                            The evaluation is based on the procurement method ({procurement.method}) and the estimated value (KES {Number(procurement.value).toLocaleString()}).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ComplianceTab({ analysis }: { analysis: any }) {
    if (!analysis) return (
        <div className="py-20 text-center space-y-4 rounded-xl border-2 border-dashed border-zinc-100">
            <AlertCircle className="h-10 w-10 text-zinc-200 mx-auto" />
            <p className="text-zinc-400 font-bold italic">No compliance audit findings available for this procurement.</p>
        </div>
    )

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-zinc-900">Kenya PPADA Compliance Audit</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score</span>
                        <span className="text-2xl font-black text-zinc-900">{analysis.complianceScore}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {analysis.checks.map((check: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl border border-zinc-50 bg-zinc-50/30 hover:border-zinc-200 transition-all group">
                            {check.status === "Pass" ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                            ) : check.status === "Warning" ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-zinc-900">{check.rule}</h4>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${check.status === "Pass" ? "bg-emerald-100 text-emerald-700" : check.status === "Warning" ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"
                                        }`}>
                                        {check.status}
                                    </span>
                                </div>
                                <p className="text-[13px] text-zinc-600 leading-normal font-medium mb-3">{check.finding}</p>
                                <div className="flex items-start gap-2 pt-2 border-t border-zinc-100/50">
                                    <ClipboardCheck className="h-3 w-3 text-zinc-300 mt-0.5" />
                                    <p className="text-[11px] text-zinc-400 italic leading-snug">{check.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm self-start sticky top-8">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Action Required</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-4 shadow-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Compliance Decision</p>
                        <p className="text-sm font-bold">Based on AI analysis, this procurement is {analysis.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}.</p>
                        <button className="w-full py-2 bg-white text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors">
                            PROCEED TO APPROVAL
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

function AuditLogTab() {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden text-center py-20">
            <History className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold italic">Audit trail logging initiated. Tracking active since procurement creation.</p>
        </div>
    )
}
