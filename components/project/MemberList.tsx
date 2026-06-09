import React, { useState } from 'react';
import { Project, User } from '@/types/project';
import ConfirmModal from '../common/ConfirmModal';
import { UserPlus, UserMinus, ShieldCheck, Mail } from 'lucide-react';

interface MemberListProps {
    project: Project;
    onRemoveMember?: (memberId: string) => Promise<void>;
    onAddMember?: () => void;
    isCreator?: boolean;
    isAppAdmin?: boolean;
    loading?: boolean;
    className?: string;
}

const MemberList: React.FC<MemberListProps> = ({
    project,
    onRemoveMember,
    onAddMember,
    isCreator = false,
    isAppAdmin = false,
    loading = false,
    className = ''
}) => {
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<User | null>(null);

    const canManage = isCreator || isAppAdmin;

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const handleRemoveClick = (member: User) => {
        setMemberToRemove(member);
    };

    const handleConfirmRemove = async () => {
        if (!memberToRemove || !onRemoveMember) return;

        try {
            setRemovingMemberId(memberToRemove._id);
            await onRemoveMember(memberToRemove._id);
            setMemberToRemove(null);
        } catch (error) {
            console.error('Remove member error:', error);
        } finally {
            setRemovingMemberId(null);
        }
    };

    const isCreatorMember = (member: User) => {
        return member._id === project.createdBy._id;
    };

    return (
        <div className={`bg-surface/50 backdrop-blur-xl border border-border-theme rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 ${className}`}>
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-text-primary">
                            Project Squad
                        </h3>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">
                            {project.members.length} Active Agents
                        </p>
                    </div>
                    {canManage && onAddMember && (
                        <button
                            onClick={onAddMember}
                            disabled={loading}
                            className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                            title="Recruit Member"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {project.members.map((member) => (
                        <div
                            key={member._id}
                            className="group flex items-center justify-between p-4 bg-background/40 hover:bg-background/60 border border-border-theme/50 rounded-2xl transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border-theme flex items-center justify-center shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-sm font-bold text-primary relative z-10">
                                        {getInitials(member.firstName, member.lastName)}
                                    </span>
                                </div>

                                {/* Member Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-text-primary">
                                            {member.firstName} {member.lastName}
                                        </h4>
                                        {isCreatorMember(member) && (
                                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary">
                                        <Mail className="w-3 h-3" />
                                        <p className="text-[10px] font-medium truncate max-w-[120px]">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {canManage && !isCreatorMember(member) && onRemoveMember && (
                                <button
                                    onClick={() => handleRemoveClick(member)}
                                    disabled={loading || removingMemberId === member._id}
                                    className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                    title="Discharge Member"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    {project.members.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-border-theme rounded-2xl">
                            <p className="text-sm text-text-secondary font-medium">
                                No agents deployed to this mission.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Remove Member Confirmation Modal */}
            <ConfirmModal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleConfirmRemove}
                title="Discharge Squad Member"
                message={`Are you sure you want to remove ${memberToRemove?.firstName} ${memberToRemove?.lastName} from this project mission?`}
                confirmText="Confirm Discharge"
                type="danger"
                loading={!!removingMemberId}
            />
        </div>
    );
};

export default MemberList;