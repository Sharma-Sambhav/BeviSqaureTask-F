import axiosInstance from '@/lib/axios';
import type {
    Project,
    CreateProjectData,
    UpdateProjectData,
    ProjectFilters,
    ProjectSearchFilters,
    ProjectsResponse,
    ProjectResponse,
    AnalyticsResponse
} from '@/types/project';

class ProjectService {
    private baseUrl = '/projects';

    // Create project
    async createProject(data: CreateProjectData): Promise<Project> {
        try {
            const response = await axiosInstance.post<ProjectResponse>(this.baseUrl, data);
            return response.data.data.project;
        } catch (error) {
            console.error('Create project error:', error);
            throw error;
        }
    }

    // Get user projects with filters
    async getProjects(filters?: ProjectFilters): Promise<{
        projects: Project[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const params = new URLSearchParams();
            
            if (filters?.status) params.append('status', filters.status);
            if (filters?.sort) params.append('sort', filters.sort);
            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.page) params.append('page', filters.page.toString());

            const response = await axiosInstance.get<ProjectsResponse>(
                `${this.baseUrl}?${params.toString()}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get projects error:', error);
            throw error;
        }
    }

    // Helper to get all projects for utility (e.g. checking engagement)
    async getAllProjects(): Promise<{ projects: Project[] }> {
        try {
            const response = await axiosInstance.get<ProjectsResponse>(`${this.baseUrl}?limit=1000`);
            return { projects: response.data.data.projects };
        } catch (error) {
            console.error('Get all projects error:', error);
            throw error;
        }
    }

    // Search projects
    async searchProjects(filters?: ProjectSearchFilters): Promise<{
        projects: Project[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const params = new URLSearchParams();
            
            if (filters?.q) params.append('q', filters.q);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.sort) params.append('sort', filters.sort);
            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.page) params.append('page', filters.page.toString());

            const response = await axiosInstance.get<ProjectsResponse>(
                `${this.baseUrl}/search?${params.toString()}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Search projects error:', error);
            throw error;
        }
    }

    // Get project by ID
    async getProjectById(projectId: string): Promise<Project> {
        try {
            const response = await axiosInstance.get<ProjectResponse>(`${this.baseUrl}/${projectId}`);
            return response.data.data.project;
        } catch (error) {
            console.error('Get project by ID error:', error);
            throw error;
        }
    }

    // Update project
    async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
        try {
            const response = await axiosInstance.put<ProjectResponse>(`${this.baseUrl}/${projectId}`, data);
            return response.data.data.project;
        } catch (error) {
            console.error('Update project error:', error);
            throw error;
        }
    }

    // Delete project
    async deleteProject(projectId: string): Promise<void> {
        try {
            await axiosInstance.delete(`${this.baseUrl}/${projectId}`);
        } catch (error) {
            console.error('Delete project error:', error);
            throw error;
        }
    }

    // Add member to project
    async addMember(projectId: string, email: string): Promise<Project> {
        try {
            const response = await axiosInstance.post<ProjectResponse>(
                `${this.baseUrl}/${projectId}/members`,
                { email }
            );
            return response.data.data.project;
        } catch (error) {
            console.error('Add member error:', error);
            throw error;
        }
    }

    // Remove member from project
    async removeMember(projectId: string, memberId: string): Promise<Project> {
        try {
            const response = await axiosInstance.delete<ProjectResponse>(
                `${this.baseUrl}/${projectId}/members/${memberId}`
            );
            return response.data.data.project;
        } catch (error) {
            console.error('Remove member error:', error);
            throw error;
        }
    }

    // Get basic project analytics
    async getBasicAnalytics(projectId: string): Promise<any> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<any>>(
                `${this.baseUrl}/${projectId}/analytics`
            );
            return response.data.data.analytics;
        } catch (error) {
            console.error('Get basic analytics error:', error);
            throw error;
        }
    }

    // Archive project
    async archiveProject(projectId: string): Promise<Project> {
        try {
            const response = await axiosInstance.patch<ProjectResponse>(
                `${this.baseUrl}/${projectId}/archive`
            );
            return response.data.data.project;
        } catch (error) {
            console.error('Archive project error:', error);
            throw error;
        }
    }
}

export const projectService = new ProjectService();
export default projectService;