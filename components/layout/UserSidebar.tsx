"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    CheckSquare, 
    FolderKanban, 
    LogOut,
    User,
    X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
    { label: "Projects", icon: FolderKanban, href: "/projects" },
];

interface UserSidebarProps {
    onClose?: () => void;
}

export default function UserSidebar({ onClose }: UserSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 h-screen bg-sidebar-bg border-r border-border-theme flex flex-col fixed left-0 top-0 z-[70] transition-all duration-300">
            {/* Logo & Close Button */}
            <div className="p-6 mb-2 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[#38bdf8] flex items-center justify-center shadow-xl shadow-accent/30 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <span className="text-xl font-bold text-text-primary tracking-tight">Aurora <span className="text-accent">User</span></span>
                </Link>

                {/* Close Button - Only visible on mobile */}
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-lg transition-all lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                                    : "text-text-secondary hover:text-text-primary hover:bg-surface/80 hover:shadow-sm"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-accent"}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 mt-auto border-t border-border-theme bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden ring-2 ring-accent/5">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-text-secondary truncate">Team Member</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all active:scale-90"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
