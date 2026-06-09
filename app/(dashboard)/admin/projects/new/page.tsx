'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateProjectData } from '@/types/project';
import projectService from '@/services/projectService';
import ProjectForm from '@/components/project/ProjectForm';
import Loader from '@/components/common/Loader';
import { ChevronLeft, Rocket } from 'lucide-react';

const NewProjectPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setLoading(true);
            const project = await projectService.createProject(data);
            toast.success('Project mission initiated successfully');
            router.push(`/admin/projects/${project._id}`);
        } catch (error: any) {
            console.error('Create project error:', error);
            toast.error(error.message || 'Failed to initiate project');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/projects');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="space-y-6">
                    <button 
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
                    >
                        <div className="p-1.5 bg-surface border border-border-theme rounded-lg group-hover:border-primary/30 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Cancel Deployment</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl sm:rounded-[1.5rem] border border-primary/20 shadow-xl shadow-primary/5 flex items-center justify-center shrink-0">
                            <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight">
                                New Project Mission
                            </h1>
                            <p className="text-text-secondary font-medium mt-1">
                                Configure the operational parameters for your team's next objective.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <ProjectForm
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            loading={loading}
                            mode="create"
                        />
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-secondary/50 border border-border-theme rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="p-2 bg-background rounded-xl border border-border-theme shrink-0">
                        <Rocket className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-primary mb-0.5">Mission Ready?</p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Once initiated, you can deploy team members and start allocating tasks. All mission data is tracked in real-time.
                        </p>
                    </div>
            </div>
        </div>
    );
};

export default NewProjectPage;