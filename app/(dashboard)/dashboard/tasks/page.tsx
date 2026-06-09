"use client";

import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import taskService from '@/services/taskService';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from '@/components/project/TaskCard';
import { 
    CheckSquare, 
    Search, 
    Filter, 
    Loader2,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    LayoutGrid,
    List
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [confirmingStatus, setConfirmingStatus] = useState<{ taskId: string, status: TaskStatus } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getUserAllTasks({ assignedToMe: true });
            setTasks(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch your tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        const task = tasks.find(t => t._id === taskId);
        if (task?.status === 'done') return;
        setConfirmingStatus({ taskId, status });
    };

    const confirmStatusChange = async () => {
        if (!confirmingStatus) return;
        try {
            setActionLoading(true);
            const updatedTask = await taskService.updateTask(confirmingStatus.taskId, { status: confirmingStatus.status });
            setTasks(prev => prev.map(t => t._id === confirmingStatus.taskId ? updatedTask : t));
            toast.success(`Status updated to ${confirmingStatus.status.replace('_', ' ')}`);
            setConfirmingStatus(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'to_do').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: tasks.filter(t => t.isOverdue).length
    };

    return (
        <UserLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
                            <CheckSquare className="w-8 h-8 text-accent" />
                            My Objectives
                        </h1>
                        <p className="text-text-secondary mt-1 font-medium">
                            Manage and track all tasks assigned to you across projects.
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TaskStat mini title="Backlog" value={stats.todo} color="blue" icon={Clock} />
                    <TaskStat mini title="Active" value={stats.inProgress} color="amber" icon={AlertCircle} />
                    <TaskStat mini title="Resolved" value={stats.done} color="emerald" icon={CheckCircle2} />
                    <TaskStat mini title="Overdue" value={stats.overdue} color="error" icon={Calendar} />
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by title or project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border-theme rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                        />
                    </div>
                    <div className="flex items-center bg-surface border border-border-theme rounded-2xl p-1 self-start">
                        {(['all', 'to_do', 'in_progress', 'done'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === status ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <p className="text-text-secondary font-medium animate-pulse">Retrieving your roadmap...</p>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map(task => (
                            <div key={task._id} className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary rounded-[2rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                                <div className="relative">
                                    <TaskCard
                                        task={task}
                                        onEdit={() => {}} // User can't edit tasks here (maybe later)
                                        onDelete={() => {}} // User can't delete tasks here
                                        onStatusChange={handleStatusChange}
                                        hideActions={true}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 bg-surface/30 border border-border-theme border-dashed rounded-[3rem] text-center">
                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                            <CheckSquare className="w-8 h-8 text-text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No objectives found</h3>
                        <p className="text-text-secondary max-w-sm mx-auto text-sm">
                            {searchQuery || statusFilter !== 'all' 
                                ? "No tasks match your current filters. Try adjusting them."
                                : "You don't have any tasks assigned to you at the moment."}
                        </p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!confirmingStatus}
                onClose={() => setConfirmingStatus(null)}
                onConfirm={confirmStatusChange}
                title="Update Objective Status?"
                message={`Ready to transition this task to "${confirmingStatus?.status.replace('_', ' ')}"?`}
                confirmText="Update Now"
                loading={actionLoading}
            />
        </UserLayout>
    );
}

function TaskStat({ title, value, color, icon: Icon, mini = false }: any) {
    const colors: any = {
        blue: "text-accent bg-accent/10 border-accent/20",
        amber: "text-warning bg-warning/10 border-warning/20",
        emerald: "text-success bg-success/10 border-success/20",
        error: "text-error bg-error/10 border-error/20",
    };

    return (
        <div className="p-4 bg-surface border border-border-theme rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{title}</p>
                    <h3 className="text-xl font-black text-text-primary">{value}</h3>
                </div>
            </div>
        </div>
    );
}
