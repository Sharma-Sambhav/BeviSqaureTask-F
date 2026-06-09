import Loader from "./Loader";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: "primary" | "secondary" | "outline";
    children: React.ReactNode;
}

export default function Button({
    loading = false,
    variant = "primary",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary text-white hover:opacity-90 active:scale-95",
        secondary: "bg-secondary text-text-primary hover:bg-secondary/80 active:scale-95",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader size="sm" /> : children}
        </button>
    );
}
