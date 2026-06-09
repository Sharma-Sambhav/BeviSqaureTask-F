"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated
            if (!user) {
                router.push("/login");
                return;
            }

            // Authenticated but not admin when admin is required
            if (requireAdmin && user.role !== "admin") {
                router.push("/dashboard");
                return;
            }
        }
    }, [user, loading, requireAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <Loader size="lg" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (requireAdmin && user.role !== "admin") {
        return null;
    }

    return <>{children}</>;
}
