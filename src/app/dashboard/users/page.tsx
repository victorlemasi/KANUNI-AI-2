"use client"

import { UserPlus, Search, Shield, Edit2, Trash2, MoreHorizontal } from "lucide-react"

import { useState, useEffect } from "react"
import { getUsersAction } from "@/app/actions/user-actions"

export default function UsersPage() {
    const [userList, setUserList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const result = await getUsersAction()
                if (result.success) {
                    setUserList(result.users || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Management</h1>
                    <p className="text-zinc-500">Manage system users, assign roles, and monitor access levels.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800">
                    <UserPlus className="h-4 w-4" />
                    Invite New User
                </button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">User</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Role</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Last Login</th>
                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-10 w-40 bg-zinc-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded" /></td>
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-zinc-100 rounded ml-auto" /></td>
                                </tr>
                            ))
                        ) : userList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 italic">
                                    No users found in the system.
                                </td>
                            </tr>
                        ) : (
                            userList.map((user) => (
                                <tr key={user.id} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 uppercase">
                                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-900">{user.name}</span>
                                                <span className="text-xs text-zinc-500 font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-zinc-400" />
                                            <span className="text-sm font-semibold text-zinc-700">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500 font-medium">{user.lastLogin}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button title="Edit User" className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button title="Delete User" className="p-2 hover:bg-rose-100 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-400">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
