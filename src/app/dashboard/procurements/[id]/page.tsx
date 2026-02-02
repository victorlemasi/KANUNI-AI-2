"use client"

import { useState } from "react"
import {
    ArrowLeft,
    ExternalLink,
    CheckCircle2,
    AlertTriangle,
    History,
    FileText,
    ShieldCheck,
    RefreshCw,
    AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function ProcurementDetails({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState("details")

    const tabs = [
        { id: "details", name: "Details", icon: FileText },
        { id: "risk", name: "Risk Assessment", icon: AlertTriangle },
        { id: "compliance", name: "Compliance", icon: ShieldCheck },
        { id: "audit", name: "Audit Trail", icon: History },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/procurements"
                    className="rounded-full border border-zinc-200 bg-white p-2 hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Supply of High-End Workstations
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                        <span className="font-mono text-zinc-400">PRQ-2024-001</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                        <span>Created March 1, 2024</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Approved
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
                {activeTab === "details" && <DetailsTab />}
                {activeTab === "risk" && <RiskTab />}
                {activeTab === "compliance" && <ComplianceTab />}
                {activeTab === "audit" && <AuditLogTab />}
            </div>
        </div>
    )
}

function DetailsTab() {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">General Information</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">Procurement Method</p>
                            <p className="font-semibold text-zinc-900">Open Tender</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">Contract Value</p>
                            <p className="font-semibold text-zinc-900">$450,000.00 USD</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-zinc-400 mb-1">Description</p>
                            <p className="text-zinc-600 leading-relaxed">
                                Supply and installation of 50 high-end graphic workstations for the design department.
                                Specifications include RTX 4090 GPUs, 128GB RAM, and 4TB NVMe storage.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">Vendor Information</h3>
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                            <span className="text-2xl font-bold text-zinc-400">GT</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-zinc-900">Global Tech Solutions Ltd</h4>
                            <p className="text-sm text-zinc-500">Tax ID: 90210-44-XPR</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-zinc-400">Performance Score</p>
                            <p className="text-2xl font-bold text-emerald-600">92/100</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">Related Documents</h3>
                    <div className="space-y-4">
                        {["RFP_Document.pdf", "Vendor_Technical_Bid.pdf", "Tax_Compliance.pdf"].map((doc) => (
                            <div key={doc} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                                    <span className="text-sm font-medium text-zinc-700">{doc}</span>
                                </div>
                                <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

function RiskTab() {
    return (
        <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-semibold text-zinc-900">AI Risk Assessment</h3>
                            <button className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
                                <RefreshCw className="h-4 w-4" />
                                Re-assess
                            </button>
                        </div>

                        <div className="flex items-center gap-12 p-8 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative h-32 w-32 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle cx="64" cy="64" r="58" fill="none" stroke="#e4e4e7" strokeWidth="8" />
                                        <circle cx="64" cy="64" r="58" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="291.5" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-3xl font-bold text-zinc-900 tracking-tight">20</span>
                                </div>
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Risk Score</span>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                    Low Risk Level
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900">Overall assessment is stable</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    The procurement method (Open Tender) aligns perfectly with the contract value. Global Tech Solutions has a strong history of fulfillment within budget. No significant red flags detected in document patterns.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Contributing Factors</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    "Standardized Procurement Method",
                                    "Elite Vendor Rating",
                                    "Clear Technical Specifications",
                                    "Verified Budget Allocation"
                                ].map((f) => (
                                    <div key={f} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-5 w-5 text-rose-600" />
                            <h3 className="text-lg font-semibold text-rose-900">Manual Override</h3>
                        </div>
                        <p className="text-sm text-rose-700 mb-6">
                            Compliance Officers can manually override the AI score if external factors change or if specific local regulations apply that were not captured.
                        </p>
                        <div className="flex gap-4">
                            <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm">
                                Override Assessment
                            </button>
                            <button className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition-colors">
                                Log Human Review
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Risk History</h3>
                        <div className="space-y-6">
                            {[
                                { type: "System", date: "Mar 1, 10:00 AM", score: 20, level: "Low" },
                                { type: "System", date: "Feb 28, 04:30 PM", score: 35, level: "Low" }
                            ].map((h, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 h-3 w-3 rounded-full border-2 border-zinc-300 bg-white"></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-zinc-900">{h.type} Assessment</p>
                                        <p className="text-xs text-zinc-400">{h.date}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono font-bold text-zinc-500">Score: {h.score}</span>
                                            <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">{h.level}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ComplianceTab() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">Automated Checks</h3>
                    <div className="space-y-4">
                        {[
                            { label: "PPDA Compliance", status: "Pass", details: "Value within threshold for Open Tender." },
                            { label: "PFM Act Check", status: "Pass", details: "Budget allocation verified in system." },
                            { label: "Vendor Eligibility", status: "Pass", details: "Active registration and no debarment found." },
                            { label: "Price Threshold", status: "Alert", details: "Unit price is 5% above guideline." }
                        ].map((check) => (
                            <div key={check.label} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all">
                                {check.status === "Pass" ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                )}
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900">{check.label}</h4>
                                    <p className="text-sm text-zinc-500 mt-1">{check.details}</p>
                                </div>
                                <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest ${check.status === "Pass" ? "text-emerald-600" : "text-yellow-600"
                                    }`}>
                                    {check.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">Document Verification Checklist</h3>
                    <div className="space-y-4">
                        {[
                            "Signed Tender Document",
                            "Valid Tax Compliance Certificate",
                            "Trade License",
                            "Manufacturer's Authorization",
                            "Certificate of Incorporation"
                        ].map((item) => (
                            <label key={item} className="flex items-center gap-4 cursor-pointer group p-3 rounded-lg hover:bg-zinc-50 transition-colors">
                                <input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950" defaultChecked={Math.random() > 0.3} />
                                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{item}</span>
                            </label>
                        ))}
                    </div>
                    <button className="w-full mt-8 rounded-lg border border-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all">
                        Verify Documents
                    </button>
                </section>
            </div>
        </div>
    )
}

function AuditLogTab() {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-zinc-100">
                {[
                    { user: "Super Admin", role: "Admin", action: "APPROVE_PROCUREMENT", details: "Changed status from Pending to Approved", time: "2 hours ago" },
                    { user: "Compliance Officer", role: "Compliance", action: "VERIFY_DOCUMENTS", details: "Verified manual checklist for 'Elite Stations'", time: "3 hours ago" },
                    { user: "System", role: "AI", action: "GENERATE_RISK_SCORE", details: "AI score generated: 20 (Low Risk)", time: "5 hours ago" },
                    { user: "Procurement Officer", role: "Officer", action: "CREATE_PROCUREMENT", details: "Initial procurement draft created", time: "1 day ago" }
                ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-6">
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 uppercase">
                                {log.user.substring(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-zinc-900">{log.user}</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">{log.role}</span>
                                </div>
                                <p className="text-sm font-semibold text-zinc-700 mt-1">{log.action}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{log.details}</p>
                            </div>
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
