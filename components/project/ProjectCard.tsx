import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import StatusBadge from '../common/StatusBadge';
import { 
    Calendar, 
    Users, 
    Edit2, 
    Archive, 
    Trash2, 
    ArrowUpRight,
    Clock,
    Briefcase
} from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onArchive?: (project: Project) => void;
    isCreator?: boolean;
    isAppAdmin?: boolean;
    className?: string;
    href?: string;
    currentUserId?: string;
    showMyFocus?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    onEdit,
    onDelete,
    onArchive,
    isCreator = false,
    isAppAdmin = false,
    className = '',
    href,
    currentUserId,
    showMyFocus = false
}) => {
    const canManage = isCreator || isAppAdmin;
    const memberAvatars = project.members.slice(0, 4);
    const remainingMembers = Math.max(0, project.members.length - 4);

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Status colors helper
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
            case "archived":
                return "bg-secondary border-border-theme text-text-secondary";
            default:
                return "bg-secondary border-border-theme text-text-secondary";
        }
    };

    // Calculate time elapsed percentage
    const calculateTimeProgress = (start?: string, end?: string) => {
        if (!start || !end) return 0;
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const nowTime = new Date().getTime();
        if (nowTime <= startTime) return 0;
        if (nowTime >= endTime) return 100;
        const total = endTime - startTime;
        const elapsed = nowTime - startTime;
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    };

    const timeProgress = calculateTimeProgress(project.startDate, project.endDate);

    return (
        <div className={`
            group relative bg-surface/30 backdrop-blur-md border border-border-theme hover:border-accent/40 rounded-3xl 
            transition-all duration-300 hover:shadow-lg hover:shadow-accent/5
            flex flex-col justify-between overflow-hidden
            ${className}
        `}>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Top Section */}
                <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                {href ? (
                                    <Link href={href}>
                                        <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                                            {project.name}
                                        </h3>
                                    </Link>
                                ) : (
                                    <h3 className="font-bold text-text-primary truncate">
                                        {project.name}
                                    </h3>
                                )}
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
                    {project.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {project.description}
                        </p>
                    )}
                </div>

                {/* Timeline Progress Bar */}
                {project.startDate && project.endDate && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-text-secondary">Time Progress</span>
                            <span className="text-text-primary">{timeProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary dark:bg-slate-800/80 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full" 
                                style={{ width: `${timeProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom Section */}
                <div className="space-y-3 pt-3 border-t border-border-theme/60">
                    {/* Dates Row */}
                    {(project.startDate || project.endDate) && (
                        <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary">
                            {project.startDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(project.startDate)}</span>
                                </div>
                            )}
                            {project.startDate && project.endDate && (
                                <span className="text-border-theme">→</span>
                            )}
                            {project.endDate && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(project.endDate)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Members & Actions Row */}
                    <div className="flex items-center justify-between">
                        {/* Overlapping member circles */}
                        <div className="flex -space-x-2 overflow-hidden">
                            {memberAvatars.map((member) => (
                                <div 
                                    key={member._id}
                                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(member.email)} border-2 border-surface flex items-center justify-center text-[9px] font-bold text-white shadow-sm`}
                                    title={`${member.firstName} ${member.lastName}`}
                                >
                                    {getInitials(member.firstName, member.lastName)}
                                </div>
                            ))}
                            {remainingMembers > 0 && (
                                <div className="w-7 h-7 rounded-full bg-secondary border-2 border-surface flex items-center justify-center text-[9px] font-bold text-text-secondary shadow-sm">
                                    +{remainingMembers}
                                </div>
                            )}
                        </div>

                        {/* View Button */}
                        {href && (
                            <Link href={href}>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95">
                                    <span>View</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </Link>
                        )}

                        {/* My Focus Button for regular users */}
                        {showMyFocus && currentUserId && !href && (
                            <Link href={`/projects/${project._id}/tasks?userId=${currentUserId}`}>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95">
                                    My Tasks
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Admin Actions - Show on hover */}
                {canManage && (onEdit || onArchive || onDelete) && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(project)}
                                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                title="Edit Project"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        
                        {onArchive && project.status === 'active' && (
                            <button
                                onClick={() => onArchive(project)}
                                className="p-2 text-text-secondary hover:text-warning hover:bg-warning/10 rounded-xl transition-all"
                                title="Archive Project"
                            >
                                <Archive className="w-4 h-4" />
                            </button>
                        )}
                        
                        {onDelete && (
                            <button
                                onClick={() => onDelete(project)}
                                className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all"
                                title="Delete Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;