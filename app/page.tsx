"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Redirect based on role
                if (user.role === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            } else {
                router.push("/login");
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
            <Loader size="lg" />
        </div>
    );
}
