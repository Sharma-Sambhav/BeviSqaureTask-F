'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
    BarChart3, 
    ChevronLeft, 
    Target, 
    CheckCircle2, 
    LayoutDashboard,
    AlertTriangle,
    Zap,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Clock,
    ShieldAlert,
    Timer,
    Flame,
    Info
} from 'lucide-react';

import analyticsService from '@/services/analyticsService';
import Loader from '@/components/common/Loader';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';
import { 
    ProjectOverview, 
    HealthMetrics, 
    TeamPerformance, 
    TrendAnalysis 
} from '@/types/project';

// --- Sub-components for Visuals ---

const StatCard = ({ title, value, subtext, icon, trend, colorClass = "primary" }: any) => {
    const trendColor = trend?.type === 'up' ? 'text-success' : trend?.type === 'down' ? 'text-error' : 'text-text-secondary';
    const TrendIcon = trend?.type === 'up' ? TrendingUp : trend?.type === 'down' ? TrendingDown : Activity;

    return (
        <div className="bg-surface border border-border-theme rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 bg-${colorClass}/10 rounded-xl`}>
                    {React.cloneElement(icon, { className: `w-5 h-5 text-${colorClass}` })}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        {trend.value}%
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <p className="text-3xl font-black text-text-primary mb-1">{value || '0'}</p>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{title}</p>
                {subtext && <p className="text-[10px] text-text-secondary/70 mt-2">{subtext}</p>}
            </div>
        </div>
    );
};

const HealthRing = ({ value, label, color = "#7c3aed" }: { value: number, label: string, color?: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-secondary"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-text-primary">{Math.round(value)}%</span>
                </div>
            </div>
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{label}</span>
        </div>
    );
};

const MemberContributionRow = ({ member }: { member: any }) => {
    if (!member) return null;
    const name = member.name || 'Anonymous Agent';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const productivity = member.stats?.productivityScore || 0;
    const completed = member.stats?.completed || 0;

    return (
        <div className="flex items-center justify-between p-4 bg-background/40 border border-border-theme/50 rounded-2xl hover:bg-background/60 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border-theme flex items-center justify-center font-bold text-primary text-xs">
                    {initials}
                </div>
                <div>
                    <p className="text-sm font-bold text-text-primary">{name}</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Productivity: {productivity}%</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-text-primary">{completed}</p>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Tasks Done</p>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const ProjectAnalyticsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { setLabel } = useBreadcrumbs();
    const projectId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        overview: ProjectOverview;
        health: HealthMetrics;
        teamPerformance: TeamPerformance;
        trends: TrendAnalysis;
    } | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchAnalytics();
        }
    }, [projectId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const analyticsData = await analyticsService.getDashboardAnalytics(projectId);
            setData(analyticsData);
            if (analyticsData.overview.project.name) {
                setLabel(projectId, analyticsData.overview.project.name);
            }
        } catch (error: any) {
            console.error('Fetch analytics error:', error);
            toast.error('Failed to fetch project analytics');
        } finally {
            setLoading(false);
        }
    };

    const refreshAnalytics = async () => {
        await fetchAnalytics();
        toast.success('Analytics refreshed successfully');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader size="lg" />
                <p className="text-text-secondary animate-pulse font-medium tracking-wide">Synthesizing Project Intelligence...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary">Data Missing</h2>
                <p className="text-text-secondary mt-2">We couldn't retrieve analytics for this project.</p>
                <Link href={`/admin/projects/${projectId}`} className="mt-6 inline-block text-primary font-bold">
                    Back to Project
                </Link>
            </div>
        );
    }

    const { overview, health, teamPerformance, trends } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Navigation */}
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link 
                    href={`/admin/projects/${projectId}`}
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
                >
                    <div className="p-1.5 bg-surface border border-border-theme rounded-lg group-hover:border-primary/30 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Back to Project</span>
                </Link>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={refreshAnalytics}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white border border-primary/20 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-bold"
                    >
                        <Activity className="w-4 h-4" />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <div className="hidden sm:flex px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-full">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3 h-3" /> System Live
                        </span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight">Project Intelligence</h1>
                <p className="text-sm sm:text-base text-text-secondary max-w-2xl font-medium">
                    Deep dive into <span className="text-primary font-bold">{overview.project.name}</span> performance metrics and team velocity.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Tasks Total" 
                    value={overview.tasks.total} 
                    subtext="Project mission scope"
                    icon={<Target />}
                    colorClass="primary"
                />
                <StatCard 
                    title="Completion Rate" 
                    value={`${overview.completionRate}%`} 
                    subtext="Overall milestone progress"
                    icon={<Zap />}
                    trend={{ type: trends.completionRate.trend, value: Math.abs(trends.completionRate.changePercentage) }}
                    colorClass="success"
                />
                <StatCard 
                    title="Active Agents" 
                    value={teamPerformance.summary.activeMembers} 
                    subtext="Deployments in progress"
                    icon={<Users />}
                    colorClass="accent"
                />
                <StatCard 
                    title="Risk Score" 
                    value={health.riskScore} 
                    subtext="Threat level assessment"
                    icon={<ShieldAlert />}
                    colorClass={health.riskScore > 50 ? "error" : "warning"}
                />
            </div>

            {/* Second Row: Health & Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Assessment */}
                <div className="lg:col-span-2 bg-surface border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 hidden sm:block">
                        <Timer className="w-12 h-12 text-border-theme/20" />
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary" /> Health Assessment
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-12">
                            <HealthRing value={health.healthScore.overall} label="Overall" color="var(--primary)" />
                            <HealthRing value={health.healthScore.timelineHealth} label="Timeline" color="var(--accent)" />
                            <HealthRing value={health.healthScore.teamHealth} label="Collaboration" color="var(--success)" />
                            <HealthRing value={health.healthScore.completionHealth} label="Velocity" color="var(--warning)" />
                        </div>

                        {/* Alert Items */}
                        <div className="space-y-4">
                            {health.alerts.length > 0 ? (
                                health.alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border flex items-start gap-4 ${
                                        alert.type === 'error' ? 'bg-error/5 border-error/10 text-error' : 
                                        alert.type === 'warning' ? 'bg-warning/5 border-warning/10 text-warning' : 
                                        'bg-primary/5 border-primary/10 text-primary'
                                    }`}>
                                        <div className="mt-0.5 shrink-0">
                                            {alert.type === 'error' ? <Flame className="w-5 h-5" /> : 
                                             alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                                             <Info className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{alert.type} signal</p>
                                            <p className="text-sm font-bold opacity-90 leading-relaxed">{alert.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-success/5 border border-success/10 rounded-3xl text-success">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
                                    <p className="font-bold uppercase tracking-widest text-xs">System Nominal</p>
                                    <p className="text-[10px] opacity-70 mt-1">No critical mission risks detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Performance */}
                <div className="bg-surface border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5 flex flex-col h-full">
                    <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-3">
                        <Users className="w-6 h-6 text-accent" /> Agent Intelligence
                    </h3>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] lg:max-h-none pr-2 custom-scrollbar">
                        {teamPerformance.memberPerformance.map((member) => (
                            <MemberContributionRow key={member.userId} member={member} />
                        ))}
                    </div>

                    {teamPerformance.summary.topPerformer && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-primary to-accent rounded-[2rem] text-white shadow-xl shadow-primary/20">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">MVP Deployment</p>
                            <h4 className="text-lg font-black tracking-tight">{teamPerformance.summary.topPerformer.name}</h4>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Efficiency</span>
                                <span className="text-2xl font-black">{teamPerformance.summary.topPerformer.score}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Row: Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Velocity Insights */}
                <div className="bg-surface border border-border-theme rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black text-text-primary mb-6">Velocity Trend</h3>
                    <div className="flex items-center justify-between p-6 bg-background rounded-3xl border border-border-theme/50 mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Weekly Velocity</p>
                            <p className="text-3xl font-black text-text-primary">{teamPerformance.teamVelocity.currentWeek.tasksCompleted} <span className="text-xs font-normal text-text-secondary">tasks/wk</span></p>
                        </div>
                        <div className={`p-4 rounded-2xl ${teamPerformance.teamVelocity.velocityTrend === 'increasing' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {teamPerformance.teamVelocity.velocityTrend === 'increasing' ? <TrendingUp className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-background/40 rounded-2xl border border-border-theme/30 text-center">
                            <p className="text-2xl font-bold text-text-primary">{teamPerformance.teamVelocity.burndownRate}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Burndown Rate</p>
                        </div>
                        <div className="p-4 bg-background/40 rounded-2xl border border-border-theme/30 text-center">
                            <p className="text-2xl font-bold text-text-primary">{teamPerformance.teamVelocity.averageWeeklyCompletion}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Avg Completion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalyticsPage;
