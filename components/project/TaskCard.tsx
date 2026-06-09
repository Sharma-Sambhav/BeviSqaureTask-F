import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { 
    Clock, 
    MoreVertical, 
    AlertCircle, 
    CheckCircle2, 
    Circle,
    User as UserIcon,
    Calendar,
    ArrowUpRight,
    Trash2
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    hideActions?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onEdit = () => {},
    onDelete = () => {},
    onStatusChange,
    hideActions = false
}) => {
    const isOverdue = task.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done');

    const priorityColors = {
        low: 'text-success bg-success/10 border-success/20',
        medium: 'text-warning bg-warning/10 border-warning/20',
        high: 'text-error bg-error/10 border-error/20'
    };

    const statusIcons = {
        to_do: <Circle className="w-5 h-5 text-text-secondary" />,
        in_progress: <Clock className="w-5 h-5 text-warning animate-pulse" />,
        done: <CheckCircle2 className="w-5 h-5 text-success" />
    };

    return (
        <div className="group bg-surface border border-border-theme rounded-3xl p-5 hover:shadow-xl hover:shadow-black/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            if (task.status === 'done') return;
                            const nextStatus: Record<TaskStatus, TaskStatus> = {
                                to_do: 'in_progress',
                                in_progress: 'done',
                                done: 'to_do'
                            };
                            onStatusChange(task._id, nextStatus[task.status]);
                        }}
                        disabled={task.status === 'done'}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${
                            task.status === 'done' 
                                ? 'bg-success/10 border-success/20 text-success cursor-not-allowed opacity-80' 
                                : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white active:scale-95 hover:shadow-lg hover:shadow-primary/20'
                        }`}
                        title={task.status === 'done' ? "Objective Completed" : `Move to ${task.status === 'to_do' ? 'In Progress' : 'Completed'}`}
                    >
                        {task.status === 'done' ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Done
                            </>
                        ) : (
                            <>
                                {task.status === 'to_do' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                {task.status === 'to_do' ? 'Start Task' : 'Complete'}
                            </>
                        )}
                    </button>
                </div>
                
                {!hideActions && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEdit(task)}
                            className="p-1.5 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition-all"
                            title="Edit Task"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onDelete(task._id)}
                            className="p-1.5 hover:bg-error/10 rounded-lg text-text-secondary hover:text-error transition-all"
                            title="Delete Task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <h4 className={`font-bold text-text-primary mb-2 line-clamp-1 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                {task.title}
            </h4>
            
            {task.description && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-theme/50">
                <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-[10px] font-bold text-primary">
                                    {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-text-secondary">
                                {task.assignedTo.firstName}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-text-secondary/50 italic">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-[10px]">Unassigned</span>
                        </div>
                    )}
                </div>

                {task.dueDate && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isOverdue ? 'text-error bg-error/5 border-error/10' : 'text-text-secondary bg-secondary/50 border-border-theme'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
