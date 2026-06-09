"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import type { User, AuthContextType, LoginData, RegisterData, AuthResponse } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check authentication status by calling backend
    const checkAuth = async () => {
        try {
            // Backend will check httpOnly cookie automatically
            const response = await axiosInstance.get<AuthResponse>("/user/me");
            setUser(response.data.data.user);
        } catch (error: any) {
            // If 401, user is not authenticated
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Register function - NO auto-login
    const register = async (data: RegisterData) => {
        try {
            const response = await axiosInstance.post("/user/register", data);
            toast.success(response.data.message || "Registration successful!");
            router.push("/login?registered=true");
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
            throw error;
        }
    };

    // Login function - redirect based on role
    const login = async (data: LoginData) => {
        try {
            // Backend sets httpOnly cookie automatically
            const response = await axiosInstance.post<AuthResponse>("/user/login", data);
            
            const { user: userData } = response.data.data;
            
            setUser(userData);
            toast.success(response.data.message || "Login successful!");
            
            // Redirect based on role
            if (userData.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Backend clears httpOnly cookie
            await axiosInstance.post("/user/logout");
            setUser(null);
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error: any) {
            console.error("Logout error:", error);
            // Force logout on frontend even if API fails
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
