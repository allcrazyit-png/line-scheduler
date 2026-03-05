"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Settings } from "lucide-react";

const navItems = [
    { href: "/", label: "主控台", icon: LayoutDashboard },
    { href: "/history", label: "發送紀錄", icon: History },
    { href: "/settings", label: "設定", icon: Settings },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
            <div className="max-w-md mx-auto flex items-stretch">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-item ${isActive
                                    ? "text-[#06C755]"
                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="relative">
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={isActive ? "drop-shadow-sm" : ""}
                                />
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#06C755]" />
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "" : ""}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
