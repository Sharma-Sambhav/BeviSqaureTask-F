import axiosInstance from '@/lib/axios';
import type {
    Task,
    CreateTaskData,
    UpdateTaskData,
    TasksResponse,
    TaskResponse
} from '@/types/task';

class TaskService {
    private baseUrl = '/tasks';

    // Create task
    async createTask(projectId: string, data: CreateTaskData): Promise<Task> {
        try {
            const response = await axiosInstance.post<TaskResponse>(`/projects/${projectId}/tasks`, data);
            return response.data.data.task;
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    }

    // Get all tasks for a project
    async getProjectTasks(projectId: string): Promise<Task[]> {
        try {
            const response = await axiosInstance.get<TasksResponse>(`/projects/${projectId}/tasks`);
            return response.data.data.tasks || [];
        } catch (error) {
            console.error('Get project tasks error:', error);
            throw error;
        }
    }

    // Get user's all tasks
    async getUserAllTasks(params: any = {}): Promise<Task[]> {
        try {
            const response = await axiosInstance.get<TasksResponse>(this.baseUrl, { params });
            return response.data.data.allTasks || [];
        } catch (error) {
            console.error('Get user all tasks error:', error);
            throw error;
        }
    }

    // Get task by ID
    async getTaskById(taskId: string): Promise<Task> {
        try {
            const response = await axiosInstance.get<TaskResponse>(`${this.baseUrl}/${taskId}`);
            return response.data.data.task;
        } catch (error) {
            console.error('Get task by ID error:', error);
            throw error;
        }
    }

    // Update task
    async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
        try {
            const response = await axiosInstance.put<TaskResponse>(`${this.baseUrl}/${taskId}`, data);
            return response.data.data.task;
        } catch (error) {
            console.error('Update task error:', error);
            throw error;
        }
    }

    // Delete task
    async deleteTask(taskId: string): Promise<void> {
        try {
            await axiosInstance.delete(`${this.baseUrl}/${taskId}`);
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        }
    }
}

export const taskService = new TaskService();
export default taskService;
