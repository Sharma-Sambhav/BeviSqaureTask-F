"use client";

import { 
    Search, 
    Sun,
    Moon,
    Menu
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border-theme sticky top-0 z-[50] px-4 sm:px-8 flex items-center justify-between">
            {/* Menu & Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Menu Button - Only visible on mobile */}
                <button 
                    onClick={onMenuClick}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-xl transition-all lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Mobile Logo/Brand */}
                <div className="flex items-center gap-2 px-2 lg:hidden">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[#7C3AED] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-lg font-black text-text-primary tracking-tight">Aurora <span className="text-primary">Admin</span></span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
                {/* Search */}
                <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input 
                        type="text" 
                        placeholder="Search anything..."
                        className="bg-surface border border-border-theme rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all w-64"
                    />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2.5 bg-surface border border-border-theme text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-xl transition-all shadow-sm active:scale-95"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-5 h-5 animate-in zoom-in duration-300" />
                            ) : (
                                <Moon className="w-5 h-5 animate-in zoom-in duration-300" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
