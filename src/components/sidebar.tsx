"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    Users,
    Settings,
    ShieldCheck,
    LogOut,
    X
} from "lucide-react"

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Procurements", icon: FileText, href: "/dashboard/procurements" },
    { name: "Audit Reports", icon: ShieldCheck, href: "/dashboard/reports" },
    { name: "Alerts Center", icon: AlertTriangle, href: "/dashboard/alerts" },
    { name: "User Management", icon: Users, href: "/dashboard/users" },
    { name: "Compliance Rules", icon: ShieldCheck, href: "/dashboard/compliance" },
]

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-zinc-950 text-zinc-100 transition-transform duration-300 lg:relative lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
                    <span className="text-xl font-bold tracking-tight text-white uppercase italic">Kanuni AI</span>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 hover:bg-zinc-800 lg:hidden"
                    >
                        <X className="h-5 w-5 text-zinc-400" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-white text-zinc-950 shadow-lg shadow-white/5 scale-[1.02]"
                                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-zinc-950" : "text-zinc-600")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="mt-auto border-t border-zinc-800 p-4">
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-500 transition-all hover:bg-rose-500/10 hover:text-rose-400 group">
                        <LogOut className="h-4 w-4 text-zinc-600 group-hover:text-rose-400" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}
