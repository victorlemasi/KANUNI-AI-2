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
    LogOut
} from "lucide-react"

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Procurements", icon: FileText, href: "/dashboard/procurements" },
    { name: "Alerts Center", icon: AlertTriangle, href: "/dashboard/alerts" },
    { name: "User Management", icon: Users, href: "/dashboard/users" },
    { name: "Compliance Rules", icon: ShieldCheck, href: "/dashboard/compliance" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-950 text-zinc-100">
            <div className="flex h-16 items-center border-b border-zinc-800 px-6">
                <span className="text-xl font-bold tracking-tight text-white">KANUNI AI</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="mt-auto border-t border-zinc-800 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
