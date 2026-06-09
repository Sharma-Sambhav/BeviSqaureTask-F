import { User } from './index';

// Task Types
export type TaskStatus = "to_do" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    _id: string;
    title: string;
    description?: string;
    project: {
        _id: string;
        name: string;
    };
    assignedTo?: User;
    createdBy: User;
    status: "to_do" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    dueDate?: string;
    completedAt?: string;
    isOverdue: boolean;
    overdueNotificationSent: boolean;
    statusHistory: Array<{
        status: string;
        changedBy: string;
        changedAt: string;
        reason?: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    assignedTo?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    assignedTo?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    status?: "to_do" | "in_progress" | "done";
}

export interface TaskFilters {
    status?: "to_do" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    assignedTo?: string;
    assignedToMe?: boolean;
    overdue?: boolean;
    sort?: string;
    limit?: number;
    page?: number;
}

// API Response Types
export interface TaskResponse {
    success: boolean;
    data: {
        task: Task;
    };
    message: string;
}

export interface TasksResponse {
    success: boolean;
    data: {
        tasks?: Task[];
        allTasks?: Task[];
        tasksByProject?: Array<{
            project: {
                _id: string;
                name: string;
                status: string;
            };
            tasks: Task[];
        }>;
        total: number;
        page: number;
        limit: number;
    };
    message: string;
}

export interface TasksByProjectResponse {
    success: boolean;
    data: {
        tasks: Task[];
        total: number;
        page: number;
        limit: number;
    };
    message: string;
}