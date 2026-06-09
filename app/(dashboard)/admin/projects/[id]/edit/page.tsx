'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Project, UpdateProjectData } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';
import projectService from '@/services/projectService';
import ProjectForm from '@/components/project/ProjectForm';
import Loader from '@/components/common/Loader';
import { ChevronLeft, Settings2, ShieldAlert } from 'lucide-react';

const EditProjectPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const projectData = await projectService.getProjectById(projectId);
            setProject(projectData);
        } catch (error: any) {
            console.error('Fetch project error:', error);
            toast.error(error.message || 'Failed to fetch project');
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setSubmitLoading(true);
            const updatedProject = await projectService.updateProject(projectId, data);
            toast.success('Project configuration updated');
            router.push(`/admin/projects/${updatedProject._id}`);
        } catch (error: any) {
            console.error('Update project error:', error);
            toast.error(error.message || 'Failed to update project');
            throw error;
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const canEdit = () => {
        if (!user || !project) return false;
        return user.role === 'admin' || project.createdBy._id === user._id;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader size="lg" />
                <p className="text-text-secondary animate-pulse font-medium">Retrieving Project Configuration...</p>
            </div>
        );
    }

    if (!project || !canEdit()) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-error" />
                </div>
                <h2 className="text-2xl font-black text-text-primary mb-2">Access Restrained</h2>
                <p className="text-text-secondary mb-8">You do not have the necessary clearance to modify this project configuration.</p>
                <Link href="/admin/projects">
                    <button className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                        Return to Portfolio
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="space-y-6">
                    <button 
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
                    >
                        <div className="p-1.5 bg-surface border border-border-theme rounded-lg group-hover:border-primary/30 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Back to Mission Details</span>
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-accent/10 rounded-[1.5rem] border border-accent/20 shadow-xl shadow-accent/5">
                            <Settings2 className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-text-primary tracking-tight">
                                Edit Mission Parameters
                            </h1>
                            <p className="text-text-secondary font-medium">
                                Adjusting configuration for <span className="text-text-primary font-bold">{project.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <ProjectForm
                            initialData={project}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            loading={submitLoading}
                            mode="edit"
                        />
                    </div>

            </div>
        </div>
    );
};

export default EditProjectPage;