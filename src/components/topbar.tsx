"use client"

import { Bell, Search, User } from "lucide-react"

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8">
            <div className="flex w-96 items-center gap-3 rounded-md bg-zinc-100 px-3 py-1.5 focus-within:ring-2 focus-within:ring-zinc-950">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search procurements, vendors, or alerts..."
                    className="bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 hover:bg-zinc-100">
                    <Bell className="h-5 w-5 text-zinc-600" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 border-2 border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-zinc-200"></div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-zinc-900">Admin User</span>
                        <span className="text-xs text-zinc-500 capitalize">Super Admin</span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 uppercase text-white shadow-sm hover:opacity-90 cursor-pointer">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    )
}
