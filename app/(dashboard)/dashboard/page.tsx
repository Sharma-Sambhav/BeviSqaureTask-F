"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    LayoutDashboard,
    CheckSquare,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Plus,
    FolderKanban,
    Loader2,
    Calendar,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    User,
    Check,
    Zap,
    Briefcase,
    ChevronRight,
    Clock3
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import UserLayout from "@/components/layout/UserLayout";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project } from "@/types/project";
import { Task, TaskStatus } from "@/types/task";

// Skeleton component for premium loading states
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-secondary dark:bg-slate-800/60 rounded-2xl ${className}`} />;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("pending");
    const [greeting, setGreeting] = useState({ text: "Welcome back", icon: "👋" });

    // Dynamic greeting based on time of day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting({ text: "Good morning", icon: "☀️" });
        } else if (hour < 17) {
            setGreeting({ text: "Good afternoon", icon: "🌤️" });
        } else {
            setGreeting({ text: "Good evening", icon: "🌙" });
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [projectsData, tasksData] = await Promise.all([
                projectService.getProjects({ limit: 6 }),
                taskService.getUserAllTasks({ assignedToMe: true })
            ]);
            setProjects(projectsData.projects);
            setTasks(tasksData);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
        toast.success("Dashboard data updated!");
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
        const newStatus: TaskStatus = currentStatus === "done" ? "in_progress" : "done";
        
        // Optimistic update
        const previousTasks = [...tasks];
        setTasks(prevTasks => 
            prevTasks.map(t => 
                t._id === taskId 
                    ? { ...t, status: newStatus, completedAt: newStatus === "done" ? new Date().toISOString() : undefined } 
                    : t
            )
        );

        try {
            await taskService.updateTask(taskId, { status: newStatus });
            toast.success(newStatus === "done" ? "Task completed! 🎉" : "Task updated successfully");
        } catch (error) {
            console.error("Failed to update task status:", error);
            toast.error("Failed to update task status");
            // Revert state
            setTasks(previousTasks);
        }
    };

    // Calculations
    const stats = {
        activeProjects: projects.filter(p => p.status === 'active').length,
        pendingTasks: tasks.filter(t => t.status !== 'done').length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        productivity: tasks.length > 0 
            ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) 
            : 0
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === "pending") return task.status !== "done";
        if (activeTab === "completed") return task.status === "done";
        return true;
    });

    // Priority colors helper
    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-error/10 text-error border-error/20";
            case "medium":
                return "bg-warning/10 text-warning border-warning/20";
            case "low":
            default:
                return "bg-accent/10 text-accent border-accent/20";
        }
    };

    // Status colors helper for Projects
    const getProjectStatusStyles = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-success/10 border-success/20 text-success";
            case "active":
                return "bg-accent/10 border-accent/20 text-accent";
            case "planning":
                return "bg-warning/10 border-warning/20 text-warning";
            case "on_hold":
                return "bg-slate-500/10 border-slate-500/20 text-slate-500";
            default:
                return "bg-secondary border-border-theme text-text-secondary";
        }
    };

    // Color generation for avatar initials based on email
    const getAvatarColor = (email: string = "") => {
        const colors = [
            "from-purple-500 to-indigo-500",
            "from-pink-500 to-rose-500",
            "from-blue-500 to-cyan-500",
            "from-emerald-500 to-teal-500",
            "from-amber-500 to-orange-500"
        ];
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Format relative due dates
    const formatDueDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const due = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true };
        if (diffDays === 0) return { text: "Due Today", isOverdue: false, isUrgent: true };
        if (diffDays === 1) return { text: "Due Tomorrow", isOverdue: false, isUrgent: true };
        return { 
            text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            isOverdue: false 
        };
    };

    // Urgent Tasks selector: overdue or high priority pending
    const urgentTasks = tasks
        .filter(t => t.status !== 'done' && (t.priority === 'high' || t.isOverdue || (t.dueDate && new Date(t.dueDate) < new Date())))
        .slice(0, 4);

    return (
        <UserLayout>
            <div className="space-y-8 pb-12 animate-in fade-in zoom-in duration-500">
                {/* Modern Greetings Hero Card */}
                <div className="relative overflow-hidden rounded-3xl border border-border-theme bg-surface/30 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5">
                    {/* Glowing Accent Blobs */}
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse duration-4000" />
                    <div className="absolute left-1/3 bottom-0 -mb-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl -z-10 animate-pulse duration-6000" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-sm font-semibold tracking-widest uppercase text-accent">
                                    {user?.role === "admin" ? "Administrator Portal" : "Workspace Hub"}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-none">
                                {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-[#38bdf8]">{user?.firstName}</span>
                            </h1>
                            <p className="text-sm sm:text-base text-text-secondary max-w-xl font-medium">
                                {stats.pendingTasks > 0
                                    ? `You have ${stats.pendingTasks} pending task${stats.pendingTasks > 1 ? "s" : ""} requiring attention. Let's make progress today!`
                                    : "All caught up! You have no pending tasks. Enjoy your day!"
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center justify-center p-3 bg-surface border border-border-theme text-text-secondary hover:text-text-primary hover:border-accent/50 rounded-2xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                                title="Sync Data"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin text-accent" : ""}`} />
                            </button>
                            
                            {user?.role === "admin" && (
                                <button
                                    onClick={() => router.push("/admin/projects/new")}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold text-sm active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Project
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upgraded Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))
                    ) : (
                        <>
                            <InteractiveStatCard
                                title="Active Projects"
                                value={stats.activeProjects}
                                description="Running scope"
                                icon={LayoutDashboard}
                                color="blue"
                                link="/projects"
                                router={router}
                            />
                            <InteractiveStatCard
                                title="Pending Tasks"
                                value={stats.pendingTasks}
                                description="Actions required"
                                icon={Clock}
                                color="amber"
                                link="/dashboard/tasks"
                                router={router}
                            />
                            <InteractiveStatCard
                                title="Completed Tasks"
                                value={stats.completedTasks}
                                description="Finished achievements"
                                icon={CheckCircle2}
                                color="emerald"
                                link="/dashboard/tasks"
                                router={router}
                            />
                            {/* Productivity Stat Card with Custom SVG Circular Gauge */}
                            <div className="p-6 bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-3 rounded-2xl text-primary bg-primary/10 border border-primary/20">
                                        <CheckSquare className="w-5 h-5" />
                                    </div>
                                    {/* SVG Ring Progress */}
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="18"
                                                className="stroke-secondary dark:stroke-slate-800"
                                                strokeWidth="3.5"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="18"
                                                className="stroke-primary transition-all duration-1000"
                                                strokeWidth="3.5"
                                                fill="transparent"
                                                strokeDasharray={113.1}
                                                strokeDashoffset={113.1 - (stats.productivity / 100) * 113.1}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute text-[10px] font-bold text-text-primary">
                                            {stats.productivity}%
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                                        Productivity
                                    </p>
                                    <h3 className="text-3xl font-black text-text-primary tracking-tight mt-1">
                                        {stats.productivity}%
                                    </h3>
                                    <p className="text-xs text-text-secondary mt-1">Completion efficiency</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content Grid: Split layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Projects & My Tasks */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recent Projects Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                        <FolderKanban className="w-5 h-5 text-accent" />
                                        Recent Projects
                                    </h2>
                                    <p className="text-xs text-text-secondary">Assigned workspaces you are active in</p>
                                </div>
                                <Link 
                                    href="/projects" 
                                    className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
                                >
                                    View all 
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Skeleton className="h-44" />
                                    <Skeleton className="h-44" />
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(project => {
                                        // Compute task progress for this project based on all loaded tasks
                                        const projTasks = tasks.filter(t => t.project?._id === project._id);
                                        const completed = projTasks.filter(t => t.status === "done").length;
                                        const total = projTasks.length;
                                        const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

                                        return (
                                            <Link 
                                                key={project._id}
                                                href={user?.role === 'admin' ? `/admin/projects/${project._id}` : `/projects/${project._id}`}
                                                className="group relative flex flex-col justify-between p-6 bg-surface/30 hover:bg-surface/80 border border-border-theme hover:border-accent/40 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
                                            >
                                                <div className="space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                                                <Briefcase className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                                                                    {project.name}
                                                                </h3>
                                                                <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-widest font-bold">
                                                                    {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${getProjectStatusStyles(project.status)}`}>
                                                            {project.status.replace('_', ' ')}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                                        {project.description || 'No description provided'}
                                                    </p>
                                                </div>

                                                {/* Project completion status bar */}
                                                <div className="mt-4 pt-4 border-t border-border-theme/60 space-y-2">
                                                    <div className="flex items-center justify-between text-[11px] font-semibold">
                                                        <span className="text-text-secondary">Project Progress</span>
                                                        <span className="text-text-primary">{progressPct}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-secondary dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full" 
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bottom members & details */}
                                                <div className="mt-4 flex items-center justify-between">
                                                    {/* Overlapping member circles */}
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {project.members.slice(0, 3).map((member) => (
                                                            <div 
                                                                key={member._id}
                                                                className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(member.email)} border-2 border-surface flex items-center justify-center text-[9px] font-bold text-white shadow-sm`}
                                                                title={`${member.firstName} ${member.lastName}`}
                                                            >
                                                                {member.firstName[0]}{member.lastName[0]}
                                                            </div>
                                                        ))}
                                                        {project.members.length > 3 && (
                                                            <div className="w-7 h-7 rounded-full bg-secondary border-2 border-surface flex items-center justify-center text-[9px] font-bold text-text-secondary shadow-sm">
                                                                +{project.members.length - 3}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {project.endDate && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl p-12 text-center shadow-inner">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                                        <FolderKanban className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary mb-1">No project assignments</h3>
                                    <p className="text-xs text-text-secondary max-w-xs mx-auto mb-6">
                                        You are not currently assigned to any active projects.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Interactive Task Checklist Board */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                        My Interactive Tasks
                                        {!loading && tasks.length > 0 && (
                                            <span className="px-2 py-0.5 bg-secondary text-text-secondary text-xs rounded-full border border-border-theme font-bold">
                                                {stats.pendingTasks} left
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-xs text-text-secondary">Track, update, and complete tasks directly</p>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex items-center gap-1 p-1 bg-secondary/80 dark:bg-slate-800/60 border border-border-theme rounded-2xl w-fit text-xs font-semibold">
                                    <button
                                        onClick={() => setActiveTab("pending")}
                                        className={`px-3.5 py-1.5 rounded-xl transition-all ${
                                            activeTab === "pending"
                                                ? "bg-surface shadow-sm border border-border-theme/40 text-text-primary font-bold"
                                                : "text-slate-700 dark:text-slate-200 hover:text-text-primary"
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("completed")}
                                        className={`px-3.5 py-1.5 rounded-xl transition-all ${
                                            activeTab === "completed"
                                                ? "bg-surface shadow-sm border border-border-theme/40 text-text-primary font-bold"
                                                : "text-slate-700 dark:text-slate-200 hover:text-text-primary"
                                        }`}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("all")}
                                        className={`px-3.5 py-1.5 rounded-xl transition-all ${
                                            activeTab === "all"
                                                ? "bg-surface shadow-sm border border-border-theme/40 text-text-primary font-bold"
                                                : "text-slate-700 dark:text-slate-200 hover:text-text-primary"
                                        }`}
                                    >
                                        All
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-16" />
                                    <Skeleton className="h-16" />
                                    <Skeleton className="h-16" />
                                </div>
                            ) : filteredTasks.length > 0 ? (
                                <div className="space-y-2.5">
                                    {filteredTasks.map(task => {
                                        const isDone = task.status === "done";
                                        const dueInfo = formatDueDate(task.dueDate);

                                        return (
                                            <div 
                                                key={task._id}
                                                className="flex items-center justify-between p-4 bg-surface/30 hover:bg-surface/70 border border-border-theme/80 hover:border-primary/20 rounded-2xl transition-all duration-200 group"
                                            >
                                                {/* Left section: Checkbox & title */}
                                                <div className="flex items-center gap-4 min-w-0 mr-4">
                                                    <button
                                                        onClick={() => toggleTaskStatus(task._id, task.status)}
                                                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                                                            isDone 
                                                                ? "bg-gradient-to-br from-primary to-accent border-transparent text-white" 
                                                                : "border-border-theme hover:border-accent bg-surface/60"
                                                        }`}
                                                    >
                                                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </button>
                                                    <div className="min-w-0">
                                                        <span className={`font-semibold text-text-primary group-hover:text-primary transition-colors block text-sm sm:text-base truncate ${
                                                            isDone ? "line-through text-text-secondary decoration-text-secondary/50 font-normal" : ""
                                                        }`}>
                                                            {task.title}
                                                        </span>
                                                        <span className="inline-flex items-center text-[10px] font-bold text-text-secondary mt-0.5">
                                                            {task.project?.name || "Global Scope"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right section: Info pills */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {/* Priority Badge */}
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border hidden sm:inline ${getPriorityStyles(task.priority)}`}>
                                                        {task.priority}
                                                    </span>

                                                    {/* Due Date Indicator */}
                                                    {dueInfo && !isDone && (
                                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                                            dueInfo.isOverdue 
                                                                ? "bg-error/10 border-error/20 text-error animate-pulse" 
                                                                : dueInfo.isUrgent 
                                                                    ? "bg-warning/10 border-warning/20 text-warning" 
                                                                    : "bg-secondary border-border-theme text-text-secondary"
                                                        }`}>
                                                            <Clock3 className="w-3 h-3" />
                                                            {dueInfo.text}
                                                        </span>
                                                    )}

                                                    {isDone && (
                                                        <span className="text-[10px] font-bold bg-success/10 border border-success/20 text-success px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-surface/20 border border-border-theme/80 border-dashed rounded-3xl p-10 text-center">
                                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 text-text-secondary">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-bold text-text-primary mb-1">
                                        {activeTab === "pending" ? "No pending tasks!" : activeTab === "completed" ? "No completed tasks yet" : "No tasks assigned"}
                                    </h3>
                                    <p className="text-xs text-text-secondary max-w-xs mx-auto">
                                        {activeTab === "pending" ? "Outstanding work will show up here. You are all set!" : "Tasks checked off will be stored under completed tab."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar Analytics & Urgent deadlines */}
                    <div className="space-y-8">
                        {/* Analytics Panel */}
                        <div className="p-6 bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl shadow-sm space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <TrendingUp className="w-4.5 h-4.5 text-primary" />
                                    Activity & Priority
                                </h2>
                                <p className="text-xs text-text-secondary">Breakdown of active workloads</p>
                            </div>

                            {/* Custom Visual bars for Task distribution */}
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10" />
                                    <Skeleton className="h-10" />
                                    <Skeleton className="h-10" />
                                </div>
                            ) : tasks.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Task Status Distribution */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Status Distribution</h3>
                                        <div className="space-y-2">
                                            {/* Done */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-text-secondary">Completed</span>
                                                    <span className="text-success">{tasks.filter(t => t.status === "done").length} tasks</span>
                                                </div>
                                                <div className="w-full h-2 bg-secondary dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-success rounded-full transition-all duration-700" 
                                                        style={{ width: `${(tasks.filter(t => t.status === "done").length / tasks.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* In Progress */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-text-secondary">In Progress</span>
                                                    <span className="text-warning">{tasks.filter(t => t.status === "in_progress").length} tasks</span>
                                                </div>
                                                <div className="w-full h-2 bg-secondary dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-warning rounded-full transition-all duration-700" 
                                                        style={{ width: `${(tasks.filter(t => t.status === "in_progress").length / tasks.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* To Do */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-text-secondary">To Do</span>
                                                    <span className="text-accent">{tasks.filter(t => t.status === "to_do").length} tasks</span>
                                                </div>
                                                <div className="w-full h-2 bg-secondary dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-accent rounded-full transition-all duration-700" 
                                                        style={{ width: `${(tasks.filter(t => t.status === "to_do").length / tasks.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Priority Load */}
                                    <div className="pt-4 border-t border-border-theme/60 space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Urgent Pending Backlog</h3>
                                        <div className="flex items-center gap-1.5 h-6">
                                            {tasks.filter(t => t.status !== "done").length === 0 ? (
                                                <span className="text-xs text-text-secondary italic">No pending tasks</span>
                                            ) : (
                                                <>
                                                    {/* Visual segmented bar representation */}
                                                    {tasks.filter(t => t.status !== 'done' && t.priority === 'high').length > 0 && (
                                                        <div 
                                                            style={{ flexGrow: tasks.filter(t => t.status !== 'done' && t.priority === 'high').length }} 
                                                            className="bg-error h-2.5 rounded-l-md hover:opacity-85 transition-opacity" 
                                                            title={`High: ${tasks.filter(t => t.status !== 'done' && t.priority === 'high').length}`}
                                                        />
                                                    )}
                                                    {tasks.filter(t => t.status !== 'done' && t.priority === 'medium').length > 0 && (
                                                        <div 
                                                            style={{ flexGrow: tasks.filter(t => t.status !== 'done' && t.priority === 'medium').length }} 
                                                            className="bg-warning h-2.5 hover:opacity-85 transition-opacity" 
                                                            title={`Medium: ${tasks.filter(t => t.status !== 'done' && t.priority === 'medium').length}`}
                                                        />
                                                    )}
                                                    {tasks.filter(t => t.status !== 'done' && t.priority === 'low').length > 0 && (
                                                        <div 
                                                            style={{ flexGrow: tasks.filter(t => t.status !== 'done' && t.priority === 'low').length }} 
                                                            className="bg-accent h-2.5 rounded-r-md hover:opacity-85 transition-opacity" 
                                                            title={`Low: ${tasks.filter(t => t.status !== 'done' && t.priority === 'low').length}`}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-text-secondary font-bold">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-error" />
                                                <span>High ({tasks.filter(t => t.status !== 'done' && t.priority === 'high').length})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-warning" />
                                                <span>Medium ({tasks.filter(t => t.status !== 'done' && t.priority === 'medium').length})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-accent" />
                                                <span>Low ({tasks.filter(t => t.status !== 'done' && t.priority === 'low').length})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-text-secondary italic text-center py-4">No data to analyze</p>
                            )}
                        </div>

                        {/* Urgent deadlines card */}
                        <div className="p-6 bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl shadow-sm space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4.5 h-4.5 text-error" />
                                    Urgent Checklist
                                </h2>
                                <p className="text-xs text-text-secondary">Critical items requiring instant attention</p>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12" />
                                    <Skeleton className="h-12" />
                                </div>
                            ) : urgentTasks.length > 0 ? (
                                <div className="space-y-2.5">
                                    {urgentTasks.map((task) => {
                                        const dueInfo = formatDueDate(task.dueDate);
                                        return (
                                            <div 
                                                key={task._id}
                                                className="flex items-center justify-between p-3 bg-error/5 hover:bg-error/10 border border-error/10 rounded-2xl transition-all cursor-pointer group"
                                                onClick={() => toggleTaskStatus(task._id, task.status)}
                                            >
                                                <div className="min-w-0 mr-3">
                                                    <span className="text-xs font-bold text-text-primary group-hover:text-error transition-colors block truncate">
                                                        {task.title}
                                                    </span>
                                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-error/80 mt-0.5 block">
                                                        {task.project?.name || "Global"} • {task.priority} Priority
                                                    </span>
                                                </div>
                                                {dueInfo && (
                                                    <span className="text-[9px] font-black shrink-0 px-2 py-1 bg-error/10 text-error border border-error/20 rounded-lg uppercase tracking-wider">
                                                        {dueInfo.text}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 bg-success/5 border border-success/15 rounded-2xl text-center">
                                    <p className="text-xs font-semibold text-success flex items-center justify-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                        No critical issues pending!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}

// Sub-component for interactive cards
interface InteractiveStatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<any>;
    color: "blue" | "amber" | "emerald" | "purple";
    link: string;
    router: any;
}

function InteractiveStatCard({ title, value, description, icon: Icon, color, link, router }: InteractiveStatCardProps) {
    const colors: Record<string, string> = {
        blue: "text-accent bg-accent/10 border-accent/20 hover:border-accent/40 hover:shadow-accent/5",
        amber: "text-warning bg-warning/10 border-warning/20 hover:border-warning/40 hover:shadow-warning/5",
        emerald: "text-success bg-success/10 border-success/20 hover:border-success/40 hover:shadow-success/5",
        purple: "text-primary bg-primary/10 border-primary/20 hover:border-primary/40 hover:shadow-primary/5",
    };

    return (
        <div 
            onClick={() => router.push(link)}
            className="p-6 bg-surface/30 backdrop-blur-md border border-border-theme rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-surface/75 group cursor-pointer relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl border transition-all ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <button className="p-1.5 text-text-secondary group-hover:text-text-primary bg-secondary/40 dark:bg-slate-800/40 rounded-xl transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
            <div>
                <p className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    {title}
                </p>
                <h3 className="text-3xl font-black text-text-primary tracking-tight mt-1">
                    {value}
                </h3>
                <p className="text-xs text-text-secondary mt-1">{description}</p>
            </div>
        </div>
    );
}
