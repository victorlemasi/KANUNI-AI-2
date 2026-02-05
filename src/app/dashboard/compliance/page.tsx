"use client"

import { ShieldCheck, Scale, BookOpen, AlertCircle, CheckCircle2, Gavel } from "lucide-react"

export default function ComplianceRulesPage() {
    const mainRules = [
        {
            title: "Local Preference (2024 Amendment)",
            section: "Section 155",
            description: "All procurement contracts with an estimated value below KES 1 Billion must be awarded exclusively to local citizen firms.",
            icon: Scale,
            color: "blue"
        },
        {
            title: "AGPO Reservation",
            section: "Section 157",
            description: "At least 30% of the total procurement budget must be reserved for enterprises owned by Women, Youth, and Persons with Disabilities (PWDs).",
            icon: ShieldCheck,
            color: "emerald"
        },
        {
            title: "Local Content Requirement",
            section: "Section 155(5)",
            description: "A minimum of 40% local content is mandatory for all large-scale projects to promote domestic manufacturing and value addition.",
            icon: BookOpen,
            color: "amber"
        },
        {
            title: "Advance Payment Caps",
            section: "Section 147-148",
            description: "Advance payments are strictly capped at 20% of the total contract value and must be secured by a bank guarantee.",
            icon: AlertCircle,
            color: "rose"
        },
        {
            title: "Non-Corruption Declaration",
            section: "Section 62",
            description: "Every tender document must include a signed declaration by the bidder that they will not engage in any corrupt or fraudulent practices.",
            icon: CheckCircle2,
            color: "indigo"
        },
        {
            title: "Method Thresholds",
            section: "Second Schedule",
            description: "Open Tenders (> KES 3M), Request for Quotation (KES 50k - 3M), and Low-Value Procurement (< KES 50k).",
            icon: Gavel,
            color: "zinc"
        }
    ]

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Scale className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Kenya Compliance Framework</h1>
                </div>
                <p className="text-zinc-500 max-w-3xl">
                    A summary of the **Public Procurement and Asset Disposal Act (PPADA) 2015 (Rev. 2022)**
                    and the **2024 Amendments** used as the foundation for our AI Audit Engine.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mainRules.map((rule, idx) => (
                    <div key={idx} className="group relative bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                        <div className={`absolute top-0 right-0 p-12 -mr-12 -mt-12 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-10 bg-${rule.color}-600`} />

                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-3 rounded-2xl bg-${rule.color}-50 text-${rule.color}-600`}>
                                <rule.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full">{rule.section}</span>
                        </div>

                        <h3 className="text-lg font-black text-zinc-900 mb-3 group-hover:text-blue-600 transition-colors">{rule.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                            {rule.description}
                        </p>

                        <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">Verified by AI</span>
                            <div className={`h-1.5 w-1.5 rounded-full bg-${rule.color}-500 animate-pulse`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-900 rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-40 bg-blue-500 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-blue-400" />
                        <h2 className="text-2xl font-black tracking-tight">AI Compliance Monitoring</h2>
                    </div>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                        Our AI models ingest the full text of the **PPADA** and its gazetted amendments to provide
                        real-time checks on every procurement document you analyze. It automatically detects
                        violations in thresholds, reservation groups, and mandatory declarations.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold">
                            PPADA 2015 (Rev. 2022)
                        </div>
                        <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold">
                            2024 Amendments
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
