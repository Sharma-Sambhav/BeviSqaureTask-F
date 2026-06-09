import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    FileSpreadsheet, 
    Download, 
    BarChart3, 
    ArrowUpRight,
    X 
} from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExportCSV: (includeStats: boolean) => void;
    onExportJSON: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    onExportCSV,
    onExportJSON
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

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative bg-surface border border-border-theme rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
                {/* Decorative bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-50" />
                
                <div className="p-8">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <FileSpreadsheet className="w-8 h-8 text-primary" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-text-primary mb-2 tracking-tight">
                            Export Data
                        </h3>
                        
                        <p className="text-text-secondary leading-relaxed">
                            Choose your preferred export format to download user data
                        </p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => onExportCSV(false)}
                            className="w-full flex items-center justify-between p-4 bg-surface/50 hover:bg-primary/5 border border-border-theme hover:border-primary/30 rounded-2xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-xl">
                                    <FileSpreadsheet className="w-5 h-5 text-success" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Basic CSV Export</p>
                                    <p className="text-xs text-text-secondary">User data only</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </button>

                        <button
                            onClick={() => onExportCSV(true)}
                            className="w-full flex items-center justify-between p-4 bg-surface/50 hover:bg-primary/5 border border-border-theme hover:border-primary/30 rounded-2xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Advanced CSV Report</p>
                                    <p className="text-xs text-text-secondary">Includes statistics & metadata</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </button>

                        <button
                            onClick={onExportJSON}
                            className="w-full flex items-center justify-between p-4 bg-surface/50 hover:bg-primary/5 border border-border-theme hover:border-primary/30 rounded-2xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 rounded-xl">
                                    <Download className="w-5 h-5 text-accent" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">JSON Export</p>
                                    <p className="text-xs text-text-secondary">Structured data for API integration</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-secondary hover:bg-border-theme text-text-primary rounded-2xl text-sm font-bold transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ExportModal;