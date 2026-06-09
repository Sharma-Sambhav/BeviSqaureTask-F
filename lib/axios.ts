import axios from "axios";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const API_BASE_URL = "http://localhost:8080/api/v1"

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for cookies
});

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            // Don't auto-redirect on 401 - let components handle it
            // This allows proper auth checking without infinite redirects

            // Return formatted error
            return Promise.reject({
                message: data?.message || "Something went wrong",
                status,
                errors: data?.errors || [],
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: "Network error - please check your connection",
                status: 0,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || "An unexpected error occurred",
                status: 0,
            });
        }
    }
);

export default axiosInstance;
