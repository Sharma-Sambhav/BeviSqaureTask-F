import { User } from './index';
export type { User };

// Project Types
export interface Project {
    _id: string;
    name: string;
    description?: string;
    createdBy: User;
    members: User[];
    status: "planning" | "active" | "on_hold" | "completed" | "cancelled" | "overdue" | "archived";
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: "planning" | "active" | "on_hold" | "completed" | "cancelled" | "overdue" | "archived";
    startDate?: string;
    endDate?: string;
}

export interface ProjectFilters {
    status?: "planning" | "active" | "on_hold" | "completed" | "cancelled" | "overdue" | "archived";
    sort?: string;
    limit?: number;
    page?: number;
}

export interface ProjectSearchFilters extends ProjectFilters {
    q?: string;
}

export interface ProjectsResponse {
    success: boolean;
    data: {
        projects: Project[];
        total: number;
        page: number;
        limit: number;
    };
    message: string;
}

export interface ProjectResponse {
    success: boolean;
    data: {
        project: Project;
    };
    message: string;
}

// Analytics Types
export interface ProjectOverview {
    project: {
        id: string;
        name: string;
        description?: string;
        status: string;
        startDate?: string;
        endDate?: string;
        createdAt: string;
    };
    members: {
        total: number;
        creator: {
            id: string;
            name: string;
            email: string;
        };
        list: Array<{
            id: string;
            name: string;
            email: string;
        }>;
    };
    tasks: {
        total: number;
        byStatus: {
            toDo: number;
            inProgress: number;
            done: number;
        };
        byPriority: {
            low: number;
            medium: number;
            high: number;
        };
        overdue: number;
    };
    completionRate: string;
    progress: string;
}

export interface HealthMetrics {
    projectInfo: {
        name: string;
        status: string;
        startDate?: string;
        endDate?: string;
        daysRemaining?: number;
    };
    taskMetrics: {
        total: number;
        completed: number;
        inProgress: number;
        toDo: number;
        overdue: number;
        completionRate: number;
        onTimeDeliveryRate: number;
    };
    healthScore: {
        overall: number;
        completionHealth: number;
        timelineHealth: number;
        teamHealth: number;
    };
    riskScore: number;
    isOnTrack: boolean;
    alerts: Array<{
        type: "info" | "warning" | "error";
        message: string;
    }>;
}

export interface MemberPerformance {
    userId: string;
    name: string;
    email: string;
    isCreator: boolean;
    stats: {
        totalAssigned: number;
        completed: number;
        inProgress: number;
        toDo: number;
        overdue: number;
        completionRate: number;
        averageCompletionTime: number;
        onTimeDeliveryRate: number;
        productivityScore: number;
        tasksCompletedThisWeek: number;
        tasksCompletedThisMonth: number;
        lastActivityDate?: string;
        isActive: boolean;
    };
}

export interface TeamPerformance {
    memberPerformance: MemberPerformance[];
    teamVelocity: {
        currentWeek: {
            tasksCompleted: number;
            tasksCreated: number;
            tasksInProgress: number;
        };
        lastWeek: {
            tasksCompleted: number;
            tasksCreated: number;
        };
        currentMonth: {
            tasksCompleted: number;
            tasksCreated: number;
        };
        averageWeeklyCompletion: number;
        velocityTrend: "increasing" | "stable" | "decreasing";
        burndownRate: number;
    };
    summary: {
        totalMembers: number;
        activeMembers: number;
        topPerformer?: {
            userId: string;
            name: string;
            score: number;
        };
        averageProductivity: number;
    };
}

export interface DailyBreakdown {
    period: string;
    startDate: string;
    endDate: string;
    data: Array<{
        date: string;
        tasksCreated: number;
        tasksCompleted: number;
        tasksInProgress: number;
        activeMembers: number;
        memberActivity: Array<{
            userId: string;
            name: string;
            tasksCompleted: number;
            tasksUpdated: number;
        }>;
    }>;
    summary: {
        totalTasksCreated: number;
        totalTasksCompleted: number;
        averageDailyCompletion: number;
        mostProductiveDay?: string;
    };
}

export interface WeeklyBreakdown {
    period: string;
    data: Array<{
        weekNumber: number;
        weekStart: string;
        weekEnd: string;
        tasksCompleted: number;
        tasksCreated: number;
        averageCompletionTime: number;
        activeMembers: number;
        productivityScore: number;
    }>;
    summary: {
        totalTasksCompleted: number;
        averageWeeklyCompletion: number;
        bestWeek?: {
            weekNumber: number;
            tasksCompleted: number;
        };
        trend: "improving" | "stable" | "declining";
    };
}

export interface MonthlyBreakdown {
    period: string;
    totalMonths: number;
    data: Array<{
        month: string;
        year: number;
        monthName: string;
        tasksCompleted: number;
        tasksCreated: number;
        averageCompletionTime: number;
        completionRate: number;
        topPerformer?: {
            userId: string;
            name: string;
            tasksCompleted: number;
        };
    }>;
    summary: {
        totalTasksCompleted: number;
        averageMonthlyCompletion: number;
        bestMonth?: {
            month: string;
            tasksCompleted: number;
        };
    };
}

export interface EfficiencyMetrics {
    overallScore: number;
    breakdown: {
        velocityScore: number;
        qualityScore: number;
        collaborationScore: number;
        consistencyScore: number;
    };
    cycleTime: {
        average: number;
        median: number;
        percentile90: number;
        trend: "improving" | "stable" | "degrading";
    };
    workloadDistribution: {
        balanced: boolean;
        giniCoefficient: number;
        members: Array<{
            userId: string;
            name: string;
            currentLoad: number;
            loadPercentage: number;
            isOverloaded: boolean;
            isUnderloaded: boolean;
        }>;
        recommendations: string[];
    };
}

export interface Forecast {
    forecast: {
        estimatedCompletionDate: string;
        confidenceLevel: number;
        basedOn: {
            currentVelocity: number;
            remainingTasks: number;
            historicalAccuracy: number;
        };
        scenarios: {
            optimistic: string;
            realistic: string;
            pessimistic: string;
        };
    };
}

export interface RiskAssessment {
    overallRisk: "low" | "medium" | "high" | "critical";
    riskScore: number;
    factors: Array<{
        factor: string;
        severity: "low" | "medium" | "high";
        impact: number;
        description: string;
        mitigation: string;
    }>;
    recommendations: string[];
}

export interface TrendAnalysis {
    completionRate: {
        current: number;
        lastWeek: number;
        lastMonth: number;
        trend: "up" | "down" | "stable";
        changePercentage: number;
    };
    velocity: {
        current: number;
        lastWeek: number;
        trend: "up" | "down" | "stable";
        changePercentage: number;
    };
    teamActivity: {
        current: number;
        lastWeek: number;
        trend: "up" | "down" | "stable";
    };
}

export interface MemberAnalytics {
    member: {
        id: string;
        name: string;
        email: string;
        isCreator: boolean;
    };
    stats: {
        totalAssigned: number;
        completed: number;
        inProgress: number;
        toDo: number;
        overdue: number;
        completionRate: number;
        averageCompletionTime: number;
        productivityScore: number;
    };
    recentActivity: Array<{
        date: string;
        action: string;
        taskName: string;
    }>;
    performance: {
        rank: number;
        percentile: number;
        comparedToTeamAverage: number;
    };
}

export interface PeriodComparison {
    period: "week" | "month";
    current: {
        tasksCompleted: number;
        tasksCreated: number;
        velocity: number;
        activeMembers: number;
    };
    previous: {
        tasksCompleted: number;
        tasksCreated: number;
        velocity: number;
        activeMembers: number;
    };
    changes: {
        tasksCompleted: {
            value: number;
            percentage: number;
            trend: "up" | "down" | "stable";
        };
        tasksCreated: {
            value: number;
            percentage: number;
            trend: "up" | "down" | "stable";
        };
        velocity: {
            value: number;
            percentage: number;
            trend: "up" | "down" | "stable";
        };
        activeMembers: {
            value: number;
            percentage: number;
            trend: "up" | "down" | "stable";
        };
    };
}

// Generic API Response Types
export interface AnalyticsResponse<T> {
    success: boolean;
    data: T;
    message: string;
}