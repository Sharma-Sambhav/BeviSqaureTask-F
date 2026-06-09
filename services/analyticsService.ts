import axiosInstance from '@/lib/axios';
import type {
    ProjectOverview,
    HealthMetrics,
    TeamPerformance,
    DailyBreakdown,
    WeeklyBreakdown,
    MonthlyBreakdown,
    EfficiencyMetrics,
    Forecast,
    RiskAssessment,
    TrendAnalysis,
    MemberAnalytics,
    PeriodComparison,
    AnalyticsResponse
} from '@/types/project';

class AnalyticsService {
    private baseUrl = '/projects';

    // 1. Overview Analytics
    async getOverviewAnalytics(projectId: string): Promise<ProjectOverview> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<ProjectOverview>>(
                `${this.baseUrl}/${projectId}/analytics/overview`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get overview analytics error:', error);
            throw error;
        }
    }

    // 2. Health Metrics
    async getHealthMetrics(projectId: string): Promise<HealthMetrics> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<HealthMetrics>>(
                `${this.baseUrl}/${projectId}/analytics/health`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get health metrics error:', error);
            throw error;
        }
    }

    // 3. Team Performance
    async getTeamPerformance(projectId: string): Promise<TeamPerformance> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<TeamPerformance>>(
                `${this.baseUrl}/${projectId}/analytics/team-performance`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get team performance error:', error);
            throw error;
        }
    }

    // 4. Daily Breakdown
    async getDailyBreakdown(projectId: string, days: number = 30): Promise<DailyBreakdown> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<DailyBreakdown>>(
                `${this.baseUrl}/${projectId}/analytics/daily?days=${days}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get daily breakdown error:', error);
            throw error;
        }
    }

    // 5. Weekly Breakdown
    async getWeeklyBreakdown(projectId: string, weeks: number = 12): Promise<WeeklyBreakdown> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<WeeklyBreakdown>>(
                `${this.baseUrl}/${projectId}/analytics/weekly?weeks=${weeks}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get weekly breakdown error:', error);
            throw error;
        }
    }

    // 6. Monthly Breakdown
    async getMonthlyBreakdown(projectId: string): Promise<MonthlyBreakdown> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<MonthlyBreakdown>>(
                `${this.baseUrl}/${projectId}/analytics/monthly`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get monthly breakdown error:', error);
            throw error;
        }
    }

    // 7. Efficiency Metrics
    async getEfficiencyMetrics(projectId: string): Promise<EfficiencyMetrics> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<EfficiencyMetrics>>(
                `${this.baseUrl}/${projectId}/analytics/efficiency`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get efficiency metrics error:', error);
            throw error;
        }
    }

    // 8. Forecast
    async getForecast(projectId: string): Promise<Forecast> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<Forecast>>(
                `${this.baseUrl}/${projectId}/analytics/forecast`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get forecast error:', error);
            throw error;
        }
    }

    // 9. Risk Assessment
    async getRiskAssessment(projectId: string): Promise<RiskAssessment> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<RiskAssessment>>(
                `${this.baseUrl}/${projectId}/analytics/risks`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get risk assessment error:', error);
            throw error;
        }
    }

    // 10. Trend Analysis
    async getTrendAnalysis(projectId: string): Promise<TrendAnalysis> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<TrendAnalysis>>(
                `${this.baseUrl}/${projectId}/analytics/trends`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get trend analysis error:', error);
            throw error;
        }
    }

    // 11. Member Analytics
    async getMemberAnalytics(projectId: string, memberId: string): Promise<MemberAnalytics> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<MemberAnalytics>>(
                `${this.baseUrl}/${projectId}/analytics/member/${memberId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get member analytics error:', error);
            throw error;
        }
    }

    // 12. Period Comparison
    async getPeriodComparison(projectId: string, period: 'week' | 'month' = 'week'): Promise<PeriodComparison> {
        try {
            const response = await axiosInstance.get<AnalyticsResponse<PeriodComparison>>(
                `${this.baseUrl}/${projectId}/analytics/compare?period=${period}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get period comparison error:', error);
            throw error;
        }
    }

    // Batch analytics for dashboard
    async getDashboardAnalytics(projectId: string): Promise<{
        overview: ProjectOverview;
        health: HealthMetrics;
        teamPerformance: TeamPerformance;
        trends: TrendAnalysis;
    }> {
        try {
            const [overview, health, teamPerformance, trends] = await Promise.all([
                this.getOverviewAnalytics(projectId),
                this.getHealthMetrics(projectId),
                this.getTeamPerformance(projectId),
                this.getTrendAnalysis(projectId)
            ]);

            return {
                overview,
                health,
                teamPerformance,
                trends
            };
        } catch (error) {
            console.error('Get dashboard analytics error:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;