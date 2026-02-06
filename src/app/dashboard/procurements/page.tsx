"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, FileDown } from "lucide-react"
import Link from "next/link"
import { getProcurementsAction } from "@/app/actions/procurement-actions"

export default function ProcurementsPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProcurements() {
            try {
                const result = await getProcurementsAction()
                if (result.success) {
                    setItems(result.items || [])
                }
            } catch (err) {
                console.error("Failed to fetch procurements:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProcurements()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Procurements</h1>
                    <p className="text-zinc-500">Manage and track all procurement requests and their risk assessments.</p>
                </div>
                <Link
                    href="/dashboard/procurements/new"
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-black text-white shadow-xl hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    New Request
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap">
                        <FileDown className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
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
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-12 bg-zinc-50/20">
                                            <div className="h-4 bg-zinc-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                                        No procurements found. Create one to get started.
                                    </td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.docId} className="group hover:bg-zinc-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-medium text-zinc-500">{item.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">{item.title}</span>
                                            <span className="text-xs text-zinc-500">{item.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{typeof item.value === 'number' ? `KES ${item.value.toLocaleString()}` : item.value}</td>
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
                                        <Link href={`/dashboard/procurements/${item.docId}`} className="rounded-md p-1.5 hover:bg-zinc-200 transition-colors inline-block">
                                            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>Showing {items.length} procurements</span>
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
