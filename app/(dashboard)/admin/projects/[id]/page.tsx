'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';
import projectService from '@/services/projectService';
import analyticsService from '@/services/analyticsService';
import MemberList from '@/components/project/MemberList';
import AddMemberModal from '@/components/project/AddMemberModal';
import StatusBadge from '@/components/common/StatusBadge';
import Loader from '@/components/common/Loader';
import ConfirmModal from '@/components/common/ConfirmModal';
import TaskBoard from '@/components/project/TaskBoard';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';
import { 
    Calendar, 
    ChevronLeft, 
    BarChart3, 
    Settings, 
    Archive, 
    Trash2, 
    User as UserIcon,
    Clock,
    LayoutDashboard,
    AlertTriangle,
    Target,
    CheckCircle2,
    Timer,
    CheckSquare
} from 'lucide-react';

const ProjectTimeline = ({ project }: { project: Project }) => {
    if (!project.startDate || !project.endDate) return null;
    
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const progress = Math.min(Math.max(0, ((now - start) / total) * 100), 100);
    const isOverdue = now > end && project.status !== 'completed';
    const isHealthy = progress < 80 && !isOverdue;
    
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${isOverdue ? 'text-error' : 'text-primary'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isOverdue ? 'text-error' : 'text-text-secondary'}`}>
                        {isOverdue ? 'Overdue' : 'Timeline Progress'}
                    </span>
                </div>
                <span className={`text-xs font-bold ${isOverdue ? 'text-error' : 'text-text-primary'}`}>
                    {Math.round(progress)}%
                </span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border-theme">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                        isOverdue ? 'bg-error' : isHealthy ? 'bg-gradient-to-r from-primary to-accent' : 'bg-warning'
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-text-secondary">
                <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

const ProjectDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const { setLabel } = useBreadcrumbs();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    
    // Modal states
    const [showAddMember, setShowAddMember] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    
    // Action loading states
    const [memberActionLoading, setMemberActionLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [archiveLoading, setArchiveLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchAnalytics();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const projectData = await projectService.getProjectById(projectId);
            setProject(projectData);
            if (projectData.name) {
                setLabel(projectId, projectData.name);
            }
        } catch (error: any) {
            console.error('Fetch project error:', error);
            toast.error(error.message || 'Failed to fetch project');
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const analyticsData = await analyticsService.getOverviewAnalytics(projectId);
            setAnalytics(analyticsData);
        } catch (error: any) {
            console.error('Fetch analytics error:', error);
            // Don't show error toast for analytics - it's not critical
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Refresh analytics when tasks might have changed
    const refreshAnalytics = () => {
        fetchAnalytics();
    };

    const handleAddMember = async (email: string) => {
        try {
            setMemberActionLoading(true);
            const updatedProject = await projectService.addMember(projectId, email);
            setProject(updatedProject);
            toast.success('Member added successfully');
        } catch (error: any) {
            console.error('Add member error:', error);
            throw error;
        } finally {
            setMemberActionLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            const updatedProject = await projectService.removeMember(projectId, memberId);
            setProject(updatedProject);
            toast.success('Member removed successfully');
        } catch (error: any) {
            console.error('Remove member error:', error);
            toast.error(error.message || 'Failed to remove member');
        }
    };

    const handleDeleteProject = async () => {
        try {
            setDeleteLoading(true);
            await projectService.deleteProject(projectId);
            toast.success('Project terminated successfully');
            router.push('/admin/projects');
        } catch (error: any) {
            console.error('Delete project error:', error);
            toast.error(error.message || 'Failed to delete project');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleArchiveProject = async () => {
        try {
            setArchiveLoading(true);
            const updatedProject = await projectService.archiveProject(projectId);
            setProject(updatedProject);
            toast.success('Project archived successfully');
            setShowArchiveConfirm(false);
        } catch (error: any) {
            console.error('Archive project error:', error);
            toast.error(error.message || 'Failed to archive project');
        } finally {
            setArchiveLoading(false);
        }
    };

    const isCreator = () => {
        return user && project && project.createdBy._id === user._id;
    };

    const isAppAdmin = () => {
        return user?.role === 'admin';
    };

    const canManage = () => {
        return isCreator() || isAppAdmin();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader size="lg" />
                <p className="text-text-secondary animate-pulse font-medium tracking-wide">Retrieving Project Details...</p>
            </div>
        );
    }

    if (!project) return null;

    const overdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed';

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Link 
                        href="/admin/projects"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
                    >
                        <div className="p-1.5 bg-surface border border-border-theme rounded-lg group-hover:border-primary/30 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">
                            Back to Portfolio
                        </span>
                    </Link>

                    {canManage() && (
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/projects/${project._id}/edit`}>
                                <button className="p-2.5 bg-surface border border-border-theme rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </Link>
                            <button 
                                onClick={() => setShowArchiveConfirm(true)}
                                className="p-2.5 bg-surface border border-border-theme rounded-xl text-text-secondary hover:text-warning hover:border-warning/30 transition-all shadow-sm"
                            >
                                <Archive className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2.5 bg-surface border border-border-theme rounded-xl text-text-secondary hover:text-error hover:border-error/30 transition-all shadow-sm"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Overdue Alert */}
                {overdue && (
                    <div className="bg-error/10 border border-error/20 p-6 rounded-[2rem] flex items-center gap-6 text-error animate-pulse">
                        <div className="p-3 bg-error/20 rounded-2xl">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Project Deadline Exceeded</h3>
                            <p className="text-sm opacity-80">This project is currently overdue. Please update the timeline or status immediately.</p>
                        </div>
                    </div>
                )}

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Project Identity & Analytics */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Project Header Card */}
                        <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <StatusBadge status={project.status} size="lg" />
                                    <div className="hidden sm:block h-px w-8 bg-border-theme" />
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Est. {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text-primary mb-6 tracking-tight leading-[1.1]">
                                    {project.name}
                                </h1>
                                
                                {project.description && (
                                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mb-8 font-medium">
                                        {project.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="bg-background/40 border border-border-theme/50 rounded-2xl p-6">
                                        <ProjectTimeline project={project} />
                                    </div>
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border-theme shrink-0">
                                            <UserIcon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Project Lead</p>
                                            <p className="text-text-primary font-bold truncate">{project.createdBy.firstName} {project.createdBy.lastName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Management Entry Point */}
                        <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Objective Management</h3>
                                    <p className="text-sm text-text-secondary max-w-md font-medium">
                                        Access the full project roadmap to define objectives, track progress, and coordinate team execution.
                                    </p>
                                </div>
                                <Link href={`/admin/projects/${projectId}/tasks`} className="w-full md:w-auto">
                                    <button className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        <CheckSquare className="w-5 h-5" />
                                        Launch Roadmap
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Analytics Overview */}
                        {analytics && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-surface border border-border-theme rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Tasks</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-primary">{analytics.tasks?.total ?? 0}</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter mt-1 opacity-70">Total mission scope</p>
                                </div>

                                <div className="bg-surface border border-border-theme rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-success/10 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        </div>
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Resolved</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-primary">{analytics.tasks?.byStatus?.done ?? 0}</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter mt-1 opacity-70">Milestones hit</p>
                                </div>

                                <div className="bg-surface border border-border-theme rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-accent/10 rounded-xl">
                                            <LayoutDashboard className="w-5 h-5 text-accent" />
                                        </div>
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Velocity</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-primary">
                                        {typeof analytics.completionRate === 'string' 
                                            ? analytics.completionRate 
                                            : `${analytics.completionRate ?? 0}%`}
                                    </p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter mt-1 opacity-70">Completion rate</p>
                                </div>
                            </div>
                        )}

                        {analyticsLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-surface border border-border-theme rounded-3xl p-6 animate-pulse">
                                        <div className="h-4 bg-border-theme rounded mb-4"></div>
                                        <div className="h-8 bg-border-theme rounded mb-2"></div>
                                        <div className="h-3 bg-border-theme rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Team Management */}
                    <div className="space-y-8">
                        <MemberList
                            project={project}
                            onRemoveMember={handleRemoveMember}
                            onAddMember={() => setShowAddMember(true)}
                            isCreator={!!isCreator()}
                            isAppAdmin={!!isAppAdmin()}
                            loading={memberActionLoading}
                        />

                        {/* Quick Insights Card */}
                        <div className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20">
                            <h4 className="text-lg font-bold mb-4">Strategic Insight</h4>
                            <p className="text-sm opacity-90 leading-relaxed mb-6">
                                {overdue 
                                    ? "Critical: This project has exceeded its operational window. Prioritize immediate resolution of pending tasks."
                                    : "Status: Project is within the defined roadmap. Ensure team members are updating their progress frequently."
                                }
                            </p>
                            <Link href={`/admin/projects/${project._id}/analytics`}>
                                <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-sm transition-all">
                                    Detailed Analytics
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <AddMemberModal
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                onAddMember={handleAddMember}
                existingMemberIds={project.members.map((m: any) => m._id)}
                loading={memberActionLoading}
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteProject}
                title="Terminate Project"
                message={`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`}
                confirmText="Terminate Now"
                type="danger"
                loading={deleteLoading}
            />

            <ConfirmModal
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={handleArchiveProject}
                title="Archive Project"
                message={`Move "${project.name}" to archives? It will remain accessible for historical reporting.`}
                confirmText="Archive Project"
                type="warning"
                loading={archiveLoading}
            />
        </>
    );
};

export default ProjectDetailPage;