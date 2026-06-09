import axiosInstance from '@/lib/axios';
import { User } from '@/types/project';

interface UsersResponse {
    success: boolean;
    data: {
        users: User[];
        stats: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            admins: number;
            members: number;
        };
    };
    message: string;
}

class UserService {
    private adminBaseUrl = '/admin';

    // Get all users (requires admin/manager access in some contexts, but here hitting admin endpoint)
    async getAllUsers(): Promise<{ data: User[] }> {
        try {
            const response = await axiosInstance.get<UsersResponse>(`${this.adminBaseUrl}/users`);
            // The AddMemberModal expects { data: User[] } based on how it's used
            return { data: response.data.data.users };
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    }

    // Get current user info
    async getCurrentUser(): Promise<User> {
        try {
            const response = await axiosInstance.get('/users/me');
            return response.data.data.user;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }
}

export const userService = new UserService();
export default userService;
