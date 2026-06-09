"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile sidebar on navigation
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="min-h-screen bg-background flex transition-colors duration-300">
                {/* Mobile Overlay */}
                {isMobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] animate-in fade-in duration-300 lg:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Desktop Sidebar - Always visible on lg+ */}
                <div className="hidden lg:block w-64 h-screen sticky top-0">
                    <AdminSidebar />
                </div>

                {/* Mobile Sidebar - Toggleable */}
                <div className={`
                    fixed top-0 left-0 h-full w-64 z-[70] transition-transform duration-500 ease-in-out lg:hidden
                    ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <AdminSidebar onClose={() => setIsMobileSidebarOpen(false)} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-500">
                    <AdminHeader onMenuClick={toggleMobileSidebar} />
                    
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-background/50">
                        <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
