import React from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    action,
    icon,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {icon && (
                <div className="mb-4 text-gray-400 dark:text-gray-600">
                    {icon}
                </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            
            {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    {description}
                </p>
            )}
            
            {action && (
                <div className="mt-6">
                    {React.isValidElement(action) ? (
                        action
                    ) : typeof action === 'object' && (action as any).label ? (
                        <button
                            onClick={(action as any).onClick}
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            {(action as any).label}
                        </button>
                    ) : (
                        action as React.ReactNode
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;