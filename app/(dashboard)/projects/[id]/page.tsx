"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import projectService from '@/services/projectService';
import { Project } from '@/types/project';
import UserLayout from '@/components/layout/UserLayout';
import Loader from '@/components/common/Loader';
import StatusBadge from '@/components/common/StatusBadge';
import { 
    ChevronLeft, 
    Calendar, 
    User as UserIcon, 
    CheckSquare, 
    LayoutDashboard,
    Clock,
    Timer,
    BarChart3
} from 'lucide-react';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

const ProjectTimeline = ({ project }: { project: Project }) => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const progress = Math.min(Math.max(0, ((now - start) / total) * 100), 100);
    const isOverdue = now > end && project.status !== 'completed';
    
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${isOverdue ? 'text-error' : 'text-primary'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        {isOverdue ? 'Overdue' : 'Timeline Progress'}
                    </span>
                </div>
                <span className="text-xs font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border-theme">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-error' : 'bg-gradient-to-r from-primary to-accent'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-text-secondary">
                <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default function UserProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { setLabel } = useBreadcrumbs();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProjectById(projectId);
            setProject(data);
            if (data.name) {
                setLabel(projectId, data.name);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch project');
            router.push('/projects');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader size="lg" />
                    <p className="text-text-secondary animate-pulse font-medium">Loading Workspace...</p>
                </div>
            </UserLayout>
        );
    }

    if (!project) return null;

    return (
        <UserLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Navigation */}
                <Link 
                    href="/projects"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Projects</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/5">
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <StatusBadge status={project.status} size="lg" />
                                    <div className="hidden sm:block h-px w-8 bg-border-theme" />
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Due {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text-primary mb-6 tracking-tight leading-[1.1]">
                                    {project.name}
                                </h1>
                                
                                <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 font-medium">
                                    {project.description}
                                </p>

                                <div className="bg-background/40 border border-border-theme/50 rounded-2xl p-6">
                                    <ProjectTimeline project={project} />
                                </div>
                            </div>
                        </div>

                        {/* Roadmap Entry */}
                        <div className="bg-surface border border-border-theme rounded-[2.5rem] p-8 group hover:border-accent/30 transition-all shadow-xl shadow-black/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight">Project Roadmap</h3>
                                    <p className="text-sm text-text-secondary max-w-md">
                                        View the complete execution timeline, team objectives, and collective progress milestones.
                                    </p>
                                </div>
                                <Link href={`/projects/${projectId}/tasks`}>
                                    <button className="flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        <BarChart3 className="w-5 h-5" />
                                        View Roadmap
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <div className="bg-surface border border-border-theme rounded-3xl p-6">
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6">Project Metadata</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Created By</p>
                                        <p className="text-sm font-bold text-text-primary">{project.createdBy.firstName} {project.createdBy.lastName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Launched On</p>
                                        <p className="text-sm font-bold text-text-primary">{new Date(project.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-border-theme rounded-3xl p-6">
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-4">Team Synergy</h4>
                            <div className="flex -space-x-2">
                                {project.members.slice(0, 5).map((member: any) => (
                                    <div key={member._id} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-surface flex items-center justify-center" title={`${member.firstName} ${member.lastName}`}>
                                        <span className="text-[10px] font-bold text-primary">{member.firstName[0]}</span>
                                    </div>
                                ))}
                                {project.members.length > 5 && (
                                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-surface flex items-center justify-center text-[10px] font-bold text-text-secondary">
                                        +{project.members.length - 5}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-text-secondary mt-4 font-medium uppercase tracking-widest">
                                {project.members.length} Active Collaborators
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
