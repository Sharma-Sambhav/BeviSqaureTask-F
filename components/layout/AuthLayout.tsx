"use client";

import { CheckCircle2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen flex bg-background transition-colors duration-300">
            {/* Theme Toggle (Top Right) */}
            {mounted && (
                <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="absolute top-6 right-6 z-50 p-3 bg-surface border border-border-theme text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-2xl transition-all shadow-xl active:scale-95 backdrop-blur-md bg-opacity-50"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>
            )}

            {/* Left Side: Decorative (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#050505] dark:bg-[#050505] bg-secondary transition-colors duration-300">
                {/* Mesh Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full" />
                
                <div className="relative z-10 max-w-lg px-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        The Future of Task Management
                    </div>
                    
                    <h1 className="text-5xl font-bold text-text-primary dark:text-[#F8FAFC] leading-[1.1] mb-6">
                        Empower your team with <span className="text-primary">Aurora</span>.
                    </h1>
                    
                    <p className="text-xl text-text-secondary dark:text-[#94A3B8] leading-relaxed mb-12">
                        Experience a seamless workflow with our premium, high-performance task management system.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Role-based access control",
                            "Real-time team collaboration",
                            "Advanced project insights",
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-text-primary dark:text-[#F8FAFC]">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                <span className="text-lg">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Abstract Background Element */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" className="text-border-theme" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-primary/5 blur-[100px] rounded-full" />
                </div>

                <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-4xl font-bold text-text-primary mb-3">{title}</h2>
                        <p className="text-text-secondary text-lg">{subtitle}</p>
                    </div>
                    
                    <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-3xl p-8 shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
