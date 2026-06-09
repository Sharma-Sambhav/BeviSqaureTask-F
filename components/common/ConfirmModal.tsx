import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { AlertTriangle, Info, Trash2, X, UserCheck } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false
}) => {
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

    const getStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <Trash2 className="w-6 h-6 text-error" />,
                    bg: 'bg-error/10',
                    button: 'bg-error hover:bg-error/90 text-white shadow-lg shadow-error/20',
                    border: 'border-error/20'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-warning" />,
                    bg: 'bg-warning/10',
                    button: 'bg-warning hover:bg-warning/90 text-white shadow-lg shadow-warning/20',
                    border: 'border-warning/20'
                };
            case 'success':
                return {
                    icon: <UserCheck className="w-6 h-6 text-success" />,
                    bg: 'bg-success/10',
                    button: 'bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20',
                    border: 'border-success/20'
                };
            case 'info':
                return {
                    icon: <Info className="w-6 h-6 text-primary" />,
                    bg: 'bg-primary/10',
                    button: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20',
                    border: 'border-primary/20'
                };
            default:
                return {
                    icon: <Info className="w-6 h-6 text-primary" />,
                    bg: 'bg-primary/10',
                    button: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20',
                    border: 'border-primary/20'
                };
        }
    };

    const styles = getStyles();

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with premium glassmorphism */}
            <div 
                className="fixed inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative bg-surface border border-border-theme rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
                {/* Decorative background element */}
                <div className={`absolute top-0 left-0 w-full h-1 ${type === 'danger' ? 'bg-error' : type === 'warning' ? 'bg-warning' : type === 'success' ? 'bg-success' : 'bg-primary'} opacity-50`} />
                
                <div className="p-8">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`mb-6 p-4 rounded-2xl ${styles.bg} ${styles.border} border flex items-center justify-center`}>
                            {styles.icon}
                        </div>
                        
                        <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">
                            {title}
                        </h3>
                        
                        <p className="text-text-secondary leading-relaxed mb-8">
                            {message}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 order-2 sm:order-1 py-4 rounded-2xl border border-border-theme bg-surface hover:bg-secondary text-text-primary"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                loading={loading}
                                disabled={loading}
                                className={`flex-1 order-1 sm:order-2 py-4 rounded-2xl font-bold ${styles.button}`}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ConfirmModal;