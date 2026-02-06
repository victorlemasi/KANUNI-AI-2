"use client"

import { useState, useEffect } from "react"
import {
    TrendingUp,
    ShieldAlert,
    CheckCircle2,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"

import { getDashboardStatsAction, getAlertsAction } from "@/app/actions/procurement-actions"

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [realStats, setRealStats] = useState<any>(null)
    const [recentAlerts, setRecentAlerts] = useState<any[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, alertsRes] = await Promise.all([
                    getDashboardStatsAction(),
                    getAlertsAction()
                ])
                if (statsRes.success) setRealStats(statsRes.stats)
                if (alertsRes.success) setRecentAlerts(alertsRes.items?.slice(0, 3) || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const stats = [
        {
            name: "Total Procurement Value",
            value: realStats ? `KES ${(realStats.totalValue / 1000000).toFixed(1)}M` : "0",
            change: "+12.5%",
            trend: "up",
            icon: TrendingUp,
            description: "vs. last month"
        },
        {
            name: "Average Health Score",
            value: realStats?.avgScore || "0",
            change: "-4.2%",
            trend: "down",
            icon: ShieldAlert,
            description: "Higher is better"
        },
        {
            name: "Compliance Rate",
            value: realStats ? `${realStats.complianceRate}%` : "0%",
            change: "+2.1%",
            trend: "up",
            icon: CheckCircle2,
            description: "of audited items"
        },
        {
            name: "Active Alerts",
            value: realStats?.activeAlerts || "0",
            change: "-3",
            trend: "down",
            icon: Activity,
            description: "High priority"
        }
    ]

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Procurement Intelligence</h1>
                    <p className="text-zinc-500">Real-time risk assessment and compliance monitoring across your procurement lifecycle.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-10 w-10 bg-zinc-100 rounded-lg animate-pulse"></div>
                                <div className="h-4 w-12 bg-zinc-100 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse"></div>
                                <div className="h-8 w-32 bg-zinc-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid gap-8 lg:grid-cols-7">
                    <div className="lg:col-span-4 h-96 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm animate-pulse"></div>
                    <div className="lg:col-span-3 h-96 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm animate-pulse"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Procurement Intelligence</h1>
                <p className="text-zinc-500">Real-time risk assessment and compliance monitoring across your procurement lifecycle.</p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-zinc-100 p-2 text-zinc-900">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className={stat.trend === "up" ? "text-emerald-600" : "text-rose-600"}>
                                <span className="flex items-center text-xs sm:text-sm font-medium">
                                    {stat.change}
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="ml-1 h-3 w-3" />
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs sm:text-sm font-medium text-zinc-500">{stat.name}</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">{stat.value}</h3>
                            <p className="mt-1 text-[10px] sm:text-xs text-zinc-400 font-medium">{stat.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900">Procurement Value Trends</h3>
                            <p className="text-sm text-zinc-500">Monthly breakdown of procurement spend</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
                        {(realStats?.normalizedSpend || new Array(12).fill(5)).map((h: number, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-zinc-900 rounded-t-sm transition-all hover:bg-zinc-700 cursor-pointer"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <span className="text-[10px] text-zinc-400 font-medium">M{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">Risk Distribution</h3>
                    <div className="space-y-6">
                        {[
                            { label: "Low Risk", key: "Low", color: "bg-emerald-500" },
                            { label: "Medium Risk", key: "Medium", color: "bg-yellow-500" },
                            { label: "High Risk", key: "High", color: "bg-orange-500" },
                            { label: "Critical Risk", key: "Critical", color: "bg-rose-500" }
                        ].map((risk) => {
                            const value = realStats?.riskPercentages?.[risk.key] || 0;
                            return (
                                <div key={risk.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-zinc-700">{risk.label}</span>
                                        <span className="text-zinc-500">{value}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-zinc-100">
                                        <div
                                            className={`h-2 rounded-full ${risk.color}`}
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 rounded-lg bg-zinc-50 p-4 border border-zinc-100">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">AI Summary</h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Risk scores have stabilized this month with a <span className="text-emerald-600 font-semibold">4.2% decrease</span> across new tenders. Major contributing factor: Improved vendor certification compliance.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-zinc-100 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900">Recent High-Priority Alerts</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                    {recentAlerts.length === 0 ? (
                        <div className="p-10 text-center text-zinc-400 italic text-sm font-medium">
                            No high-priority alerts detected.
                        </div>
                    ) : (
                        recentAlerts.map((alert) => (
                            <div key={alert.docId} className="flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors">
                                <div className="flex gap-4 items-start">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${alert.severity === "Critical" ? "bg-rose-600" :
                                        alert.severity === "High" ? "bg-orange-600" : "bg-yellow-600"
                                        }`}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-zinc-900">{alert.type}</span>
                                            <span className="text-xs text-zinc-400 font-mono">{alert.procurementId}</span>
                                        </div>
                                        <p className="text-sm text-zinc-600 mt-1">{alert.title}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right min-w-[100px]">
                                    <span className="text-xs text-zinc-400 font-medium">New</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${alert.severity === "Critical" ? "bg-rose-100 text-rose-700" :
                                        alert.severity === "High" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="bg-zinc-50 p-4 text-center border-t border-zinc-100">
                    <button className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
                        View All Alerts
                    </button>
                </div>
            </div>
        </div>
    )
}
