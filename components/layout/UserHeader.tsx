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

interface UserHeaderProps {
    onMenuClick?: () => void;
}

export default function UserHeader({ onMenuClick }: UserHeaderProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border-theme sticky top-0 z-[50] px-4 sm:px-8 flex items-center justify-between transition-colors duration-300">
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-[#38bdf8] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-lg font-black text-text-primary tracking-tight">Aurora</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                {/* Search */}
                

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2.5 bg-surface border border-border-theme text-text-secondary hover:text-text-primary hover:border-accent/50 rounded-xl transition-all shadow-sm active:scale-95"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    )}

                </div>
            </div>
        </header>
    );
}
