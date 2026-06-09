export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "member";
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
    };
    message: string;
}

export interface RegisterResponse {
    success: boolean;
    data: {
        user: User;
    };
    message: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    errors?: string[];
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}
