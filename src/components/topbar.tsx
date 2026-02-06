"use client"

import { Bell, Search, User, Menu } from "lucide-react"

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 hover:bg-zinc-100 lg:hidden"
                >
                    <Menu className="h-5 w-5 text-zinc-600" />
                </button>
                <div className="hidden sm:flex w-64 lg:w-96 items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-1.5 focus-within:ring-4 focus-within:ring-zinc-100 transition-all">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400 w-full"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
                <button className="relative rounded-full p-2 hover:bg-zinc-50 transition-colors">
                    <Bell className="h-5 w-5 text-zinc-400" />
                    <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 border-2 border-white"></span>
                </button>
                <div className="h-6 w-[1px] bg-zinc-100 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[12px] font-black text-zinc-900">Admin User</span>
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Super Admin</span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    )
}
