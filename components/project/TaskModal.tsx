import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreateTaskData, UpdateTaskData, Task, TaskStatus, TaskPriority } from '@/types/task';
import { User } from '@/types/index';
import { X, Check, Type, FileText, User as UserIcon, AlertCircle, Calendar, CheckSquare, Loader2 } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
    initialData?: Task;
    members: User[];
    loading?: boolean;
    mode?: 'create' | 'edit';
}

const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    members,
    loading = false,
    mode = 'create'
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        status: 'to_do' as TaskStatus,
        priority: 'medium' as TaskPriority,
        dueDate: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                assignedTo: initialData.assignedTo?._id || '',
                status: initialData.status || 'to_do',
                priority: initialData.priority || 'medium',
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                status: 'to_do',
                priority: 'medium',
                dueDate: ''
            });
        }
    }, [initialData, isOpen]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData: CreateTaskData | UpdateTaskData = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            assignedTo: formData.assignedTo || undefined,
            status: formData.status,
            priority: formData.priority,
            dueDate: formData.dueDate || undefined
        };

        try {
            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Task form submission error:', error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
            <div className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2.5 bg-secondary/50 hover:bg-secondary rounded-xl transition-all text-text-secondary hover:text-text-primary active:scale-90 border border-border-theme/50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-10 space-y-8">
                        {/* Compact Header */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                                <CheckSquare className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Objective</span>
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-text-primary tracking-tight leading-tight">
                                    {mode === 'create' ? 'Define Objective' : 'Refine Protocol'}
                                </h2>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-md">
                                    {mode === 'create' 
                                        ? 'Establish a new milestone in the project roadmap.' 
                                        : 'Adjust operational parameters for this objective.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Identity */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <Type className="w-3.5 h-3.5" />
                                        Task Identifier
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="Objective title..."
                                        className={`w-full bg-background/50 border-2 rounded-2xl px-6 py-4 text-lg font-bold text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary transition-all ${errors.title ? 'border-error/50' : 'border-border-theme/50'}`}
                                    />
                                    {errors.title && <p className="text-xs font-bold text-error ml-1">{errors.title}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        Execution Context
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Context and deliverables..."
                                        rows={3}
                                        className="w-full bg-background/50 border-2 border-border-theme/50 rounded-2xl px-6 py-4 text-sm font-medium text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <UserIcon className="w-3.5 h-3.5" />
                                        Assignee
                                    </label>
                                    <select
                                        value={formData.assignedTo}
                                        onChange={(e) => handleChange('assignedTo', e.target.value)}
                                        className="w-full bg-background/50 border-2 border-border-theme/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map(member => (
                                            <option key={member._id} value={member._id}>
                                                {member.firstName} {member.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Target Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => handleChange('dueDate', e.target.value)}
                                        className="w-full bg-background/50 border-2 border-border-theme/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Phase
                                    </label>
                                    <div className="flex bg-background/50 p-1.5 rounded-xl border-2 border-border-theme/50">
                                        {(['to_do', 'in_progress', 'done'] as TaskStatus[]).map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleChange('status', s)}
                                                disabled={initialData?.status === 'done' && s !== 'done'}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                                    formData.status === s 
                                                        ? 'bg-surface border border-border-theme shadow-md text-primary scale-105 z-10' 
                                                        : 'text-text-secondary hover:text-text-primary'
                                                } ${(initialData?.status === 'done' && s !== 'done') ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                        <Type className="w-3.5 h-3.5" />
                                        Priority
                                    </label>
                                    <div className="flex bg-background/50 p-1.5 rounded-xl border-2 border-border-theme/50">
                                        {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => handleChange('priority', p)}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                                    formData.priority === p 
                                                        ? p === 'high' ? 'bg-error text-white shadow-md shadow-error/20 scale-105 z-10' 
                                                        : p === 'medium' ? 'bg-warning text-white shadow-md shadow-warning/20 scale-105 z-10'
                                                        : 'bg-success text-white shadow-md shadow-success/20 scale-105 z-10'
                                                        : 'text-text-secondary hover:text-text-primary'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 border-t border-border-theme/50 bg-secondary/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-surface border border-border-theme rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary transition-all active:scale-95 shadow-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex-[2] px-6 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                            {mode === 'create' ? 'Create Task' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default TaskModal;
