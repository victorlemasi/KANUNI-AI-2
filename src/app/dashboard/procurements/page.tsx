"use client"

import { Plus, Search, Filter, MoreHorizontal, FileDown } from "lucide-react"
import Link from "next/link"

const procurements = [
    {
        id: "PRQ-2024-001",
        title: "Supply of High-End Workstations",
        method: "Open Tender",
        value: "$450,000",
        status: "Approved",
        risk: "Low",
        date: "2024-03-01"
    },
    {
        id: "PRQ-2024-002",
        title: "Network Infrastructure Upgrade",
        method: "Restricted",
        value: "$1.2M",
        status: "Pending",
        risk: "Medium",
        date: "2024-03-05"
    },
    {
        id: "PRQ-2024-003",
        title: "Cloud Services Subscription",
        method: "Direct Procurement",
        value: "$280,000",
        status: "Queried",
        risk: "High",
        date: "2024-03-10"
    },
    {
        id: "PRQ-2024-004",
        title: "Security System Maintenance",
        method: "Open Tender",
        value: "$150,000",
        status: "Rejected",
        risk: "Critical",
        date: "2024-03-12"
    }
]

export default function ProcurementsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Procurements</h1>
                    <p className="text-zinc-500">Manage and track all procurement requests and their risk assessments.</p>
                </div>
                <Link
                    href="/dashboard/procurements/new"
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800"
                >
                    <Plus className="h-4 w-4" />
                    New Procurement
                </Link>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, title, or vendor..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                        <FileDown className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Procurement ID</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Title & Method</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Value</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Risk Level</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Created At</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {procurements.map((item) => (
                            <tr key={item.id} className="group hover:bg-zinc-50 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs font-medium text-zinc-500">{item.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">{item.title}</span>
                                        <span className="text-xs text-zinc-500">{item.method}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{item.value}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                                        item.status === "Pending" ? "bg-blue-100 text-blue-700" :
                                            item.status === "Queried" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-rose-100 text-rose-700"
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${item.risk === "Low" ? "bg-emerald-500" :
                                            item.risk === "Medium" ? "bg-yellow-500" :
                                                item.risk === "High" ? "bg-orange-500" : "bg-rose-500"
                                            }`}></div>
                                        <span className="text-sm text-zinc-700">{item.risk}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-500 font-medium">{item.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="rounded-md p-1.5 hover:bg-zinc-200 transition-colors">
                                        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>Showing 4 of 48 procurements</span>
                        <div className="flex items-center gap-2">
                            <button disabled className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-400">Previous</button>
                            <button className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
