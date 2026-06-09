"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import projectService from '@/services/projectService';
import { Project } from '@/types/project';
import TaskBoard from '@/components/project/TaskBoard';
import AdminLayout from '@/components/layout/AdminLayout';
import Loader from '@/components/common/Loader';
import { ChevronLeft, CheckSquare } from 'lucide-react';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

export default function AdminProjectTasksPage() {
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
        } catch (error) {
            console.error('Fetch project error:', error);
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader size="lg" />
                <p className="text-text-secondary animate-pulse font-black uppercase tracking-[0.3em] text-xs">Syncing Roadmap</p>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                    <Link 
                        href={`/admin/projects/${projectId}`}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Workspace</span>
                    </Link>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight flex items-center gap-3 sm:gap-4">
                        <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        Objective Roadmap
                    </h1>
                    <p className="text-sm sm:text-base text-text-secondary font-medium">
                        Manage sequence and execution for <span className="text-primary font-bold">{project.name}</span>
                    </p>
                </div>
            </div>

            {/* Task Board */}
            <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl shadow-black/5">
                <TaskBoard projectId={projectId} project={project} />
            </div>
        </div>
    );
}
