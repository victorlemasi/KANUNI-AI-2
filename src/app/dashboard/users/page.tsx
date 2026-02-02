"use client"

import { UserPlus, Search, Shield, Edit2, Trash2, MoreHorizontal } from "lucide-react"

const users = [
    {
        id: "U-882",
        name: "John Doe",
        email: "john.doe@procurement.gov",
        role: "Super Admin",
        status: "Active",
        lastLogin: "2024-03-12 10:45 AM"
    },
    {
        id: "U-125",
        name: "Jane Smith",
        email: "jane.smith@procurement.gov",
        role: "Compliance Officer",
        status: "Active",
        lastLogin: "2024-03-12 09:12 AM"
    },
    {
        id: "U-456",
        name: "Michael Chen",
        email: "m.chen@procurement.gov",
        role: "Procurement Officer",
        status: "Active",
        lastLogin: "2024-03-11 04:30 PM"
    },
    {
        id: "U-789",
        name: "Sarah Williams",
        email: "s.williams@audit.gov",
        role: "Auditor",
        status: "Inactive",
        lastLogin: "2024-02-28 11:20 AM"
    }
]

export default function UsersPage() {
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
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 uppercase">
                                            {user.name.split(' ').map(n => n[0]).join('')}
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
