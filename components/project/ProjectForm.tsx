import React, { useState, useEffect } from 'react';
import { CreateProjectData, UpdateProjectData, Project } from '@/types/project';
import { Rocket, FileText, Calendar, X, Check } from 'lucide-react';

interface ProjectFormProps {
    initialData?: Project;
    onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    mode?: 'create' | 'edit';
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    loading = false,
    mode = 'create'
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : ''
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Project name must be at least 3 characters';
        }

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData: CreateProjectData | UpdateProjectData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined
        };

        try {
            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Project Identity */}
            <div className="space-y-6">
                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 ml-1 group-focus-within:text-primary transition-colors">
                        Project Mission Name
                    </label>
                    <div className="relative">
                        <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g. Project Aurora 2.0"
                            className={`
                                w-full bg-background border rounded-2xl pl-12 pr-4 py-4 text-text-primary 
                                placeholder:text-text-secondary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 
                                transition-all duration-300
                                ${errors.name ? 'border-error/50' : 'border-border-theme group-hover:border-primary/50'}
                            `}
                            required
                        />
                    </div>
                    {errors.name && <p className="mt-2 text-xs font-bold text-error ml-1">{errors.name}</p>}
                </div>

                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 ml-1 group-focus-within:text-primary transition-colors">
                        Mission Objective (Description)
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="What are we aiming to achieve?"
                            rows={4}
                            className="w-full bg-background border border-border-theme group-hover:border-primary/50 rounded-2xl pl-12 pr-4 py-4 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none"
                        />
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-text-secondary text-right">
                        {formData.description.length} / 500 characters
                    </p>
                </div>
            </div>

            {/* Timeline Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary rounded-[2rem] border border-border-theme">
                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 ml-1 group-focus-within:text-primary transition-colors">
                        Commencement Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="w-full bg-background border border-border-theme group-hover:border-primary/50 rounded-2xl pl-12 pr-4 py-3.5 text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 ml-1 group-focus-within:text-primary transition-colors">
                        Estimated Completion
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className={`
                                w-full bg-background border rounded-2xl pl-12 pr-4 py-3.5 text-text-primary 
                                focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300
                                ${errors.endDate ? 'border-error/50' : 'border-border-theme group-hover:border-primary/50'}
                            `}
                        />
                    </div>
                    {errors.endDate && <p className="mt-2 text-xs font-bold text-error ml-1">{errors.endDate}</p>}
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border-theme/50">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-text-primary rounded-2xl font-bold hover:bg-border-theme transition-all disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Check className="w-5 h-5" />
                    )}
                    {mode === 'create' ? 'Initiate Project' : 'Apply Changes'}
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;