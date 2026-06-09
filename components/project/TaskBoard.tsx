import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, CreateTaskData, UpdateTaskData } from '@/types/task';
import { User } from '@/types/index';
import { Project } from '@/types/project';
import taskService from '@/services/taskService';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { toast } from 'sonner';
import { 
    Plus, 
    Filter, 
    Search, 
    LayoutGrid, 
    List, 
    Loader2,
    CheckCircle2,
    Circle,
    Clock
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import ConfirmModal from '@/components/common/ConfirmModal';

interface TaskBoardProps {
    projectId: string;
    project: Project;
    readOnly?: boolean;
    userId?: string;
    onTaskChange?: () => void; // Callback to refresh analytics
}

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, project, readOnly = false, userId, onTaskChange }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

    // Confirm Modal states
    const [confirmingStatus, setConfirmingStatus] = useState<{ taskId: string, status: TaskStatus } | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getProjectTasks(projectId);
            setTasks(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (data: CreateTaskData | UpdateTaskData) => {
        try {
            setActionLoading(true);
            const newTask = await taskService.createTask(projectId, data as CreateTaskData);
            setTasks(prev => [newTask, ...prev]);
            toast.success('Task created successfully');
            setIsModalOpen(false);
            onTaskChange?.(); // Refresh analytics
        } catch (error: any) {
            toast.error(error.message || 'Failed to create task');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateTask = async (taskId: string, data: UpdateTaskData) => {
        try {
            setActionLoading(true);
            const updatedTask = await taskService.updateTask(taskId, data);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
            toast.success('Task updated successfully');
            setEditingTask(undefined);
            setIsModalOpen(false);
            onTaskChange?.(); // Refresh analytics
        } catch (error: any) {
            toast.error(error.message || 'Failed to update task');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        setConfirmingDelete(taskId);
    };

    const confirmDeleteTask = async () => {
        if (!confirmingDelete) return;
        try {
            setActionLoading(true);
            await taskService.deleteTask(confirmingDelete);
            setTasks(prev => prev.filter(t => t._id !== confirmingDelete));
            toast.success('Task deleted');
            setConfirmingDelete(null);
            onTaskChange?.(); // Refresh analytics
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete task');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        const task = tasks.find(t => t._id === taskId);
        if (task?.status === 'done') return; // Double check for complete lock
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
            onTaskChange?.(); // Refresh analytics
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesUser = !userId || task.assignedTo?._id === userId;
        return matchesSearch && matchesStatus && matchesUser;
    });

    const tasksByStatus = {
        to_do: filteredTasks.filter(t => t.status === 'to_do'),
        in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
        done: filteredTasks.filter(t => t.status === 'done'),
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-text-secondary font-medium animate-pulse">Syncing Task Database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Task Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border-theme rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center bg-surface border border-border-theme rounded-2xl p-1 overflow-x-auto no-scrollbar">
                        {(['all', 'to_do', 'in_progress', 'done'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${statusFilter === status ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text-primary hover:bg-secondary/50'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {!readOnly && (
                    <button
                        onClick={() => {
                            setEditingTask(undefined);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                )}
            </div>

            {/* Kanban Board Layout */}
            {tasks.length === 0 ? (
                <div className="py-20 bg-surface/30 border border-border-theme border-dashed rounded-[3rem]">
                    <EmptyState
                        title="No tasks initiated"
                        description="Start building your project roadmap by adding the first task to the sequence."
                        icon={<Plus className="w-8 h-8" />}
                        action={!readOnly && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
                            >
                                Create First Task
                            </button>
                        )}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* To Do Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-text-secondary" />
                                <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">Backlog</h3>
                                <span className="bg-secondary text-text-secondary px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {tasksByStatus.to_do.length}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {tasksByStatus.to_do.map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onEdit={(t) => {
                                        setEditingTask(t);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                    hideActions={readOnly}
                                />
                            ))}
                            {tasksByStatus.to_do.length === 0 && (
                                <div className="border-2 border-dashed border-border-theme/30 rounded-3xl p-8 text-center">
                                    <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">No backlog items</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-warning" />
                                <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">In Progress</h3>
                                <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {tasksByStatus.in_progress.length}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {tasksByStatus.in_progress.map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onEdit={(t) => {
                                        setEditingTask(t);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                    hideActions={readOnly}
                                />
                            ))}
                            {tasksByStatus.in_progress.length === 0 && (
                                <div className="border-2 border-dashed border-border-theme/30 rounded-3xl p-8 text-center">
                                    <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">No active tasks</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Done Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-success" />
                                <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">Completed</h3>
                                <span className="bg-success/10 text-success px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {tasksByStatus.done.length}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {tasksByStatus.done.map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onEdit={(t) => {
                                        setEditingTask(t);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                    hideActions={readOnly}
                                />
                            ))}
                            {tasksByStatus.done.length === 0 && (
                                <div className="border-2 border-dashed border-border-theme/30 rounded-3xl p-8 text-center">
                                    <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">No completed tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(undefined);
                }}
                onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
                initialData={editingTask}
                members={project.members}
                loading={actionLoading}
                mode={editingTask ? 'edit' : 'create'}
            />

            <ConfirmModal
                isOpen={!!confirmingStatus}
                onClose={() => setConfirmingStatus(null)}
                onConfirm={confirmStatusChange}
                title="Change Objective Status?"
                message={`Are you sure you want to move this task to "${confirmingStatus?.status.replace('_', ' ')}"?`}
                confirmText="Proceed"
                loading={actionLoading}
            />

            <ConfirmModal
                isOpen={!!confirmingDelete}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={confirmDeleteTask}
                title="Erase Objective?"
                message="This action is irreversible. All task data will be permanently purged from the project roadmap."
                confirmText="Erase Now"
                type="danger"
                loading={actionLoading}
            />
        </div>
    );
};

export default TaskBoard;
