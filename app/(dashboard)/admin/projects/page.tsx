'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Project, ProjectFilters } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';
import projectService from '@/services/projectService';
import ProjectCard from '@/components/project/ProjectCard';
import ConfirmModal from '@/components/common/ConfirmModal';
import { 
    Search, 
    Filter, 
    Plus, 
    FolderKanban,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Briefcase
} from 'lucide-react';

// Card skeleton loader matching new ProjectCard proportions
function ProjectCardSkeleton() {
    return (
        <div className="animate-pulse bg-surface/30 border border-border-theme rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 h-72">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-20 bg-secondary dark:bg-slate-800/80 rounded-full" />
                </div>
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-secondary dark:bg-slate-800/80 rounded-xl" />
                    <div className="h-4 w-full bg-secondary dark:bg-slate-800/80 rounded-lg" />
                    <div className="h-4 w-5/6 bg-secondary dark:bg-slate-800/80 rounded-lg" />
                </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border-theme/60">
                <div className="h-3.5 w-1/2 bg-secondary dark:bg-slate-800/80 rounded" />
                <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-secondary dark:bg-slate-800/80" />
                        <div className="w-8 h-8 rounded-full bg-secondary dark:bg-slate-800/80" />
                        <div className="w-8 h-8 rounded-full bg-secondary dark:bg-slate-800/80" />
                    </div>
                    <div className="h-8 w-24 bg-secondary dark:bg-slate-800/80 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

const ProjectsPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'overdue' | 'archived'>('all');
    const [sortBy, setSortBy] = useState('-createdAt');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    
    // Action states
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [archivingProject, setArchivingProject] = useState<Project | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const limit = 8; // Multiples of 4/2 layout consistency

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            
            const filters: ProjectFilters = {
                sort: sortBy,
                limit,
                page
            };

            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            let result;
            if (searchQuery.trim()) {
                result = await projectService.searchProjects({
                    ...filters,
                    q: searchQuery.trim()
                });
            } else {
                result = await projectService.getProjects(filters);
            }

            setProjects(result.projects);
            setTotal(result.total);
            setTotalPages(Math.ceil(result.total / limit));
        } catch (error: any) {
            console.error('Fetch projects error:', error);
            toast.error(error.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, sortBy, page]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Reset page when filters change
    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        }
    }, [searchQuery, statusFilter, sortBy]);

    const handleCreateProject = () => {
        router.push('/admin/projects/new');
    };

    const handleEditProject = (project: Project) => {
        router.push(`/admin/projects/${project._id}/edit`);
    };

    const handleDeleteProject = async () => {
        if (!deletingProject) return;

        try {
            setActionLoading(true);
            await projectService.deleteProject(deletingProject._id);
            toast.success('Project deleted successfully');
            setDeletingProject(null);
            fetchProjects();
        } catch (error: any) {
            console.error('Delete project error:', error);
            toast.error(error.message || 'Failed to delete project');
        } finally {
            setActionLoading(false);
        }
    };

    const handleArchiveProject = async () => {
        if (!archivingProject) return;

        try {
            setActionLoading(true);
            await projectService.archiveProject(archivingProject._id);
            toast.success('Project archived successfully');
            setArchivingProject(null);
            fetchProjects();
        } catch (error: any) {
            console.error('Archive project error:', error);
            toast.error(error.message || 'Failed to archive project');
        } finally {
            setActionLoading(false);
        }
    };

    const isCreator = (project: Project) => {
        return user && project.createdBy._id === user._id;
    };

    const isAppAdmin = () => {
        return user?.role === 'admin';
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
                {/* Header with Gradient Accent */}
                <div className="relative overflow-hidden rounded-3xl border border-border-theme bg-surface/30 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5">
                    {/* Glowing Accent Blobs */}
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl -z-10 animate-pulse duration-4000" />
                    <div className="absolute left-1/3 bottom-0 -mb-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse duration-6000" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <FolderKanban className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold tracking-widest uppercase text-primary">
                                    System Portfolio
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-none">
                                Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-[#38bdf8]">Management</span>
                            </h1>
                            <p className="text-sm sm:text-base text-text-secondary max-w-xl font-medium">
                                Orchestrate team initiatives, manage active assignments, and review timelines.
                            </p>
                        </div>

                        <button 
                            onClick={handleCreateProject}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold text-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                <div className="bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="sm:col-span-2 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search project title or description..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full bg-background/50 border border-border-theme rounded-2xl pl-12 pr-4 py-3.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-semibold"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full bg-background/50 border border-border-theme rounded-2xl pl-10 pr-8 py-3.5 text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer font-bold text-sm"
                            >
                                <option value="all">All Statuses</option>
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="overdue">Overdue</option>
                                <option value="archived">Archived</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-text-secondary" />
                        </div>

                        {/* Sort Selector */}
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-background/50 border border-border-theme rounded-2xl pl-10 pr-8 py-3.5 text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer font-bold text-sm"
                            >
                                <option value="-createdAt">Recently Created</option>
                                <option value="createdAt">Oldest First</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="-name">Name (Z-A)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-text-secondary" />
                        </div>
                    </div>
                </div>

                {/* Results Count Summary */}
                {!loading && (
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-primary">{total}</span> 
                            <span>project{total !== 1 ? 's' : ''} found</span>
                            {searchQuery && (
                                <>
                                    <span className="mx-1.5 text-border-theme opacity-50">•</span>
                                    <span>Search: "<span className="text-accent">{searchQuery}</span>"</span>
                                </>
                            )}
                        </div>
                        {total > 0 && (
                            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Page {page} of {totalPages}
                            </div>
                        )}
                    </div>
                )}

                {/* Projects Grid / Loading States */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProjectCardSkeleton key={i} />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onEdit={handleEditProject}
                                    onDelete={setDeletingProject}
                                    onArchive={setArchivingProject}
                                    isCreator={!!isCreator(project)}
                                    isAppAdmin={!!isAppAdmin()}
                                    href={`/admin/projects/${project._id}`}
                                />
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 pt-8">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-3 bg-surface border border-border-theme rounded-2xl text-text-secondary disabled:opacity-35 disabled:cursor-not-allowed hover:text-primary hover:bg-primary/5 transition-all hover:border-primary/45 active:scale-90 shadow-sm hover:shadow"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div className="px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl text-sm font-bold text-text-primary shadow-sm">
                                    Page <span className="text-primary">{page}</span> <span className="text-text-secondary mx-1">of</span> <span className="text-primary">{totalPages}</span>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-3 bg-surface border border-border-theme rounded-2xl text-text-secondary disabled:opacity-35 disabled:cursor-not-allowed hover:text-primary hover:bg-primary/5 transition-all hover:border-primary/45 active:scale-90 shadow-sm hover:shadow"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl p-12 text-center shadow-inner">
                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                            <FolderKanban className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-base font-bold text-text-primary mb-1">
                            {searchQuery ? "No matching projects" : "Portfolio is empty"}
                        </h3>
                        <p className="text-xs text-text-secondary max-w-xs mx-auto mb-6">
                            {searchQuery 
                                ? `We couldn't locate any projects matching "${searchQuery}". Try adjusting your filters.`
                                : "You have not initialized any projects. Start by creating a workspace for your team."
                            }
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all"
                            >
                                Clear Search
                            </button>
                        ) : (
                            <button 
                                onClick={handleCreateProject}
                                className="px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-95"
                            >
                                Create First Project
                            </button>
                        )}
                    </div>
                )}

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                onConfirm={handleDeleteProject}
                title="Terminate Project"
                message={`Are you sure you want to permanently delete "${deletingProject?.name}"? All associated data will be purged.`}
                confirmText="Terminate Now"
                type="danger"
                loading={actionLoading}
            />

            <ConfirmModal
                isOpen={!!archivingProject}
                onClose={() => setArchivingProject(null)}
                onConfirm={handleArchiveProject}
                title="Archive Project"
                message={`Move "${archivingProject?.name}" to archives? You can still access it later in the filters.`}
                confirmText="Archive Project"
                type="warning"
                loading={actionLoading}
            />
        </div>
    );
};

export default ProjectsPage;