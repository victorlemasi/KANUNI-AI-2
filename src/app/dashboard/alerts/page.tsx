"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    MoreVertical,
    Search,
    Filter,
    ArrowRight
} from "lucide-react"

import { getAlertsAction } from "@/app/actions/procurement-actions"

export default function AlertsPage() {
    const [alertList, setAlertList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const result = await getAlertsAction()
                if (result.success) {
                    setAlertList(result.items || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAlerts()
    }, [])

    const updateStatus = (id: string, newStatus: string) => {
        // In a real app, this would be a server action
        setAlertList(prev => prev.map(a => a.docId === id ? { ...a, status: newStatus } : a))
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Alerts Center</h1>
                <p className="text-zinc-500">Monitor and resolve system-generated risk and compliance alerts.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { label: "New Alerts", count: alertList.filter(a => a.status === "New").length, color: "bg-rose-600" },
                    { label: "Acknowledged", count: alertList.filter(a => a.status === "Acknowledged").length, color: "bg-yellow-500" },
                    { label: "Resolved Today", count: alertList.filter(a => a.status === "Resolved").length, color: "bg-emerald-500" }
                ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-500">{s.label}</p>
                            <p className="text-3xl font-bold text-zinc-900 tracking-tight">{s.count}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-full ${s.color} opacity-10 flex items-center justify-center`}>
                            <div className={`h-6 w-6 rounded-full ${s.color}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search alerts by ID, type, or procurement..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                        <Filter className="h-4 w-4" />
                        Filter By Severity
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm animate-pulse" />
                    ))
                ) : alertList.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-zinc-100 p-20 text-center">
                        <AlertTriangle className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-500 italic font-medium">No alerts detected. All systems are compliant.</p>
                    </div>
                ) : (
                    alertList.map((alert) => (
                        <div
                            key={alert.docId}
                            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center ${alert.severity === "Critical" ? "bg-rose-100 text-rose-600" :
                                        alert.severity === "High" ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-zinc-900 group-hover:text-zinc-950">{alert.title}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${alert.status === "New" ? "bg-blue-100 text-blue-700" :
                                                alert.status === "Acknowledged" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm mt-1">
                                            <span className="font-mono text-xs font-bold text-zinc-400">{alert.procurementId}</span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                                            <span className="text-zinc-500 font-medium">Condition Detected</span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                                            <span className="text-zinc-400 text-xs">{new Date(alert.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {alert.status === "New" && (
                                        <button
                                            onClick={() => updateStatus(alert.docId, "Acknowledged")}
                                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                        >
                                            Acknowledge
                                        </button>
                                    )}
                                    {alert.status !== "Resolved" && (
                                        <button
                                            onClick={() => updateStatus(alert.docId, "Resolved")}
                                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 flex items-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Resolve
                                        </button>
                                    )}
                                    <button className="rounded-lg p-2 hover:bg-zinc-100">
                                        <MoreVertical className="h-5 w-5 text-zinc-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-zinc-100 pt-6">
                                <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
                                    {alert.description}
                                </p>
                                <div className="mt-6 flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                                        <MessageSquare className="h-4 w-4" />
                                        Add Observation (2)
                                    </button>
                                    <Link
                                        href={`/dashboard/procurements/PRQ-2024-001`}
                                        className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:underline"
                                    >
                                        View Procurement Details
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    )
}
