"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Button from "@/components/common/Button";
import Input from "@/components/forms/Input";
import AuthLayout from "@/components/layout/AuthLayout";

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await register(formData);
        } catch (error) {
            console.error("Register error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Join Aurora and streamline your team workflow"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        autoComplete="given-name"
                    />

                    <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        autoComplete="family-name"
                    />
                </div>

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoComplete="new-password"
                    showPasswordToggle
                />

                <div className="pt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                    >
                        Create Account
                    </Button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border-theme text-center">
                <p className="text-text-secondary">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
