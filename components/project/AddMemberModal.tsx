import React, { useState, useEffect } from 'react';
import { User } from '@/types/project';
import { userService } from '@/services/userService';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';
import { UserPlus, X, Search, Info, Check, AlertCircle, Loader2 } from 'lucide-react';

interface UserWithEngagement extends User {
  projectCount: number;
  activeProjects: string[];
}

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMember: (email: string) => Promise<void>;
    existingMemberIds: string[];
    loading?: boolean;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    onAddMember,
    existingMemberIds,
    loading = false
}) => {
    const [users, setUsers] = useState<UserWithEngagement[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchUsersWithEngagement();
            setSelectedUserId('');
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchUsersWithEngagement = async () => {
        try {
            setFetchingUsers(true);
            const [usersResponse, projectsResponse] = await Promise.all([
                userService.getAllUsers(),
                projectService.getAllProjects()
            ]);
            
            const allUsers = usersResponse.data;
            const allProjects = projectsResponse.projects;
            
            const usersWithEngagement = allUsers.map(user => {
                const userProjects = allProjects.filter(project => 
                    project.members.some(member => {
                        const memberId = typeof member === 'string' ? member : member._id;
                        return memberId === user._id;
                    })
                );
                
                return {
                    ...user,
                    projectCount: userProjects.length,
                    activeProjects: userProjects
                        .filter(p => p.status === 'active')
                        .map(p => p.name)
                };
            });
            
            setUsers(usersWithEngagement);
        } catch (error) {
            toast.error('Failed to retrieve intelligence on available personnel');
        } finally {
            setFetchingUsers(false);
        }
    };

    const filteredUsers = users.filter(user => 
        !existingMemberIds.includes(user._id) &&
        (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUserId) {
            toast.error('Please select an agent to deploy');
            return;
        }

        const userToSelect = users.find(u => u._id === selectedUserId);
        if (!userToSelect) return;

        try {
            await onAddMember(userToSelect.email);
            setSelectedUserId('');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to deploy agent');
        }
    };

    if (!isOpen) return null;

    const selectedUser = users.find(u => u._id === selectedUserId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Glassmorphic Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-surface/90 backdrop-blur-2xl border border-border-theme rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                <UserPlus className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-primary tracking-tight">Deploy Personnel</h3>
                                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Recruit for project squad</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Search & Selection */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or intelligence tag..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-background border border-border-theme group-hover:border-primary/50 rounded-2xl pl-12 pr-4 py-4 text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>

                            <div className="bg-secondary/50 rounded-[2rem] border border-border-theme overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {fetchingUsers ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Scanning Personnel...</p>
                                        </div>
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <button
                                                key={user._id}
                                                type="button"
                                                onClick={() => setSelectedUserId(user._id)}
                                                className={`
                                                    w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left
                                                    ${selectedUserId === user._id 
                                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 ring-1 ring-primary' 
                                                        : 'hover:bg-background/80 text-text-primary'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                                                        ${selectedUserId === user._id ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                                                    `}>
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm leading-none mb-1">{user.firstName} {user.lastName}</p>
                                                        <p className={`text-[10px] font-medium opacity-70 ${selectedUserId === user._id ? 'text-white' : 'text-text-secondary'}`}>
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                {selectedUserId === user._id ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${user.activeProjects.length > 0 ? 'text-warning' : 'text-success'}`}>
                                                            {user.activeProjects.length > 0 ? `${user.activeProjects.length} Active` : 'Available'}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Info className="w-8 h-8 text-text-secondary opacity-30 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No Agents Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Engagement Warning */}
                        {selectedUser && selectedUser.activeProjects.length > 0 && (
                            <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl flex gap-4 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-warning uppercase tracking-widest mb-1">Multi-Project Engagement</p>
                                    <p className="text-[11px] text-warning/90 font-medium leading-relaxed">
                                        Agent is currently assigned to: <span className="font-bold">{selectedUser.activeProjects.join(', ')}</span>. Their bandwidth may be limited.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-secondary text-text-primary rounded-2xl font-bold hover:bg-border-theme transition-all active:scale-95"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedUserId}
                                className="flex-2 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 px-12"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Deploy Agent
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;