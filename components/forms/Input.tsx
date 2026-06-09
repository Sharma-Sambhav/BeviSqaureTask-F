"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    showPasswordToggle?: boolean;
}

export default function Input({ label, error, className = "", type, showPasswordToggle, ...props }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    type={inputType}
                    className={`w-full px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                        error ? "border-error" : "hover:border-text-secondary/30"
                    } ${className}`}
                    {...props}
                />
                {isPassword && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-secondary"
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
            {error && <span className="text-xs font-medium text-error animate-in fade-in slide-in-from-top-1">{error}</span>}
        </div>
    );
}
