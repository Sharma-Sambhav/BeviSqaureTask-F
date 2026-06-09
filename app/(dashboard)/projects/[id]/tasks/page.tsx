"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import projectService from '@/services/projectService';
import { Project } from '@/types/project';
import TaskBoard from '@/components/project/TaskBoard';
import UserLayout from '@/components/layout/UserLayout';
import Loader from '@/components/common/Loader';
import { ChevronLeft, CheckSquare, ShieldCheck, XCircle } from 'lucide-react';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

export default function ProjectRoadmapPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setLabel } = useBreadcrumbs();
    const projectId = params.id as string;
    const userIdFilter = searchParams.get('userId');

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
        } catch (error) {
            console.error('Fetch project error:', error);
            router.push('/projects');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        router.push(`/projects/${projectId}/tasks`);
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader size="lg" />
                    <p className="text-text-secondary animate-pulse font-medium tracking-widest">Retrieving Roadmap Data...</p>
                </div>
            </UserLayout>
        );
    }

    if (!project) return null;

    return (
        <UserLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <Link 
                            href={`/projects/${projectId}`}
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Workspace</span>
                        </Link>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight flex items-center gap-3 sm:gap-4">
                            <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                            Objective Roadmap
                        </h1>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <ShieldCheck className="w-4 h-4 text-success" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                                Mission Command • Authorized Access
                                {userIdFilter && " • Filtering User Focus"}
                            </p>
                        </div>
                    </div>

                    {userIdFilter && (
                        <button
                            onClick={clearFilters}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-error/10 text-error rounded-2xl hover:bg-error hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-error/20 active:scale-95"
                        >
                            <XCircle className="w-5 h-5" />
                            Reset Analysis Filters
                        </button>
                    )}
                </div>

                {/* Task Board */}
                <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl shadow-black/5">
                    <TaskBoard projectId={projectId} project={project} readOnly={true} userId={userIdFilter || undefined} />
                </div>
            </div>
        </UserLayout>
    );
}
