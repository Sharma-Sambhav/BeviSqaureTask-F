import React from 'react';

interface StatusBadgeProps {
    status: 'active' | 'archived' | 'completed' | 'pending' | 'approved' | 'rejected' | 'planning' | 'on_hold' | 'cancelled' | 'overdue';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
    status, 
    size = 'md', 
    className = '' 
}) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'active':
            case 'approved':
                return {
                    color: 'text-success bg-success/10 border-success/20',
                    dot: 'bg-success'
                };
            case 'completed':
                return {
                    color: 'text-accent bg-accent/10 border-accent/20',
                    dot: 'bg-accent'
                };
            case 'pending':
            case 'planning':
                return {
                    color: 'text-warning bg-warning/10 border-warning/20',
                    dot: 'bg-warning'
                };
            case 'rejected':
            case 'cancelled':
            case 'overdue':
                return {
                    color: 'text-error bg-error/10 border-error/20',
                    dot: 'bg-error'
                };
            case 'archived':
            case 'on_hold':
                return {
                    color: 'text-text-secondary bg-secondary border-border-theme',
                    dot: 'bg-text-secondary'
                };
            default:
                return {
                    color: 'text-text-secondary bg-secondary border-border-theme',
                    dot: 'bg-text-secondary'
                };
        }
    };

    const getSizeClasses = (size: string) => {
        switch (size) {
            case 'sm':
                return 'px-2 py-0.5 text-[10px]';
            case 'lg':
                return 'px-4 py-1.5 text-sm';
            default:
                return 'px-3 py-1 text-xs';
        }
    };

    const config = getStatusConfig(status);
    const sizeClasses = getSizeClasses(size);

    return (
        <span className={`
            inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border
            ${config.color}
            ${sizeClasses}
            ${className}
        `}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status.replace('_', ' ')}
        </span>
    );
};

export default StatusBadge;