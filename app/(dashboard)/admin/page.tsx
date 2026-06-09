"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";
import ConfirmModal from "@/components/common/ConfirmModal";
import ExportModal from "@/components/common/ExportModal";
import projectService from "@/services/projectService";
import { 
    Users, 
    UserCheck, 
    UserX, 
    UserPlus,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    FolderKanban,
    BarChart3,
    Unlock
} from "lucide-react";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

interface UsersResponse {
    success: boolean;
    data: {
        users: User[];
        stats: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            admins: number;
            members: number;
        };
    };
    message: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [projectsCount, setProjectsCount] = useState(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Confirmation modal states
    const [approvingUser, setApprovingUser] = useState<User | null>(null);
    const [rejectingUser, setRejectingUser] = useState<User | null>(null);
    const [unblockingUser, setUnblockingUser] = useState<User | null>(null);
    
    // Export modal state
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchProjectsCount();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get<UsersResponse>("/admin/users");
            setUsers(response.data.data.users);
            setStats(response.data.data.stats);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectsCount = async () => {
        try {
            const result = await projectService.getProjects({ limit: 1, page: 1 });
            setProjectsCount(result.total);
        } catch (error) {
            console.error('Failed to fetch projects count:', error);
        }
    };

    const handleApprove = async () => {
        if (!approvingUser) return;
        
        setActionLoading(approvingUser._id);
        try {
            await axiosInstance.patch(`/admin/users/${approvingUser._id}/approve`);
            toast.success(`${approvingUser.firstName} ${approvingUser.lastName} has been approved`);
            setApprovingUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Failed to approve user");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectingUser) return;
        
        setActionLoading(rejectingUser._id);
        try {
            await axiosInstance.patch(`/admin/users/${rejectingUser._id}/reject`);
            toast.success(`${rejectingUser.firstName} ${rejectingUser.lastName} has been rejected`);
            setRejectingUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Failed to reject user");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnblock = async () => {
        if (!unblockingUser) return;
        
        setActionLoading(unblockingUser._id);
        try {
            await axiosInstance.patch(`/admin/users/${unblockingUser._id}/unblock`);
            toast.success(`${unblockingUser.firstName} ${unblockingUser.lastName} has been unblocked and set to pending status`);
            setUnblockingUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Failed to unblock user");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch = 
            u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;
        const matchesRole = roleFilter === "all" || u.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const handleExport = () => {
        setShowExportModal(true);
    };

    const generateCSVExport = (includeStats: boolean = false) => {
        if (filteredUsers.length === 0) {
            toast.error("No data to export");
            return;
        }

        const timestamp = new Date().toISOString();
        const dateStr = new Date().toISOString().split('T')[0];
        let csvContent = "";

        // Add metadata header
        csvContent += `"BeviSquare Company - User Management Report"\n`;
        csvContent += `"Generated:","${new Date().toLocaleString()}"\n`;
        csvContent += `"Total Records:","${filteredUsers.length}"\n`;
        csvContent += `"Filters Applied:","Status: ${statusFilter}, Role: ${roleFilter}"\n`;
        csvContent += `\n`;

        // Add statistics summary if requested
        if (includeStats && stats) {
            csvContent += `"=== STATISTICS SUMMARY ==="\n`;
            csvContent += `"Metric","Count","Percentage"\n`;
            csvContent += `"Total Users","${stats.total}","100%"\n`;
            csvContent += `"Approved Users","${stats.approved}","${((stats.approved/stats.total)*100).toFixed(1)}%"\n`;
            csvContent += `"Pending Approvals","${stats.pending}","${((stats.pending/stats.total)*100).toFixed(1)}%"\n`;
            csvContent += `"Rejected Users","${stats.rejected}","${((stats.rejected/stats.total)*100).toFixed(1)}%"\n`;
            csvContent += `"Administrators","${stats.admins}","${((stats.admins/stats.total)*100).toFixed(1)}%"\n`;
            csvContent += `"Team Members","${stats.members}","${((stats.members/stats.total)*100).toFixed(1)}%"\n`;
            csvContent += `"Total Projects","${projectsCount}","-"\n`;
            csvContent += `\n`;
        }

        // Add user details
        csvContent += `"=== USER DETAILS ==="\n`;
        const headers = [
            "User ID",
            "First Name", 
            "Last Name", 
            "Email", 
            "Role", 
            "Status", 
            "Joined Date",
            "Joined Time",
            "Days Since Joined",
            "Account Age"
        ];
        
        csvContent += headers.join(",") + "\n";
        
        csvContent += filteredUsers.map(u => {
            const joinedDate = new Date(u.createdAt);
            const daysSince = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
            const accountAge = daysSince > 30 ? `${Math.floor(daysSince/30)} months` : `${daysSince} days`;
            
            return [
                `"${u._id}"`,
                `"${u.firstName}"`,
                `"${u.lastName}"`,
                `"${u.email}"`,
                `"${u.role.toUpperCase()}"`,
                `"${u.status.toUpperCase()}"`,
                `"${joinedDate.toLocaleDateString()}"`,
                `"${joinedDate.toLocaleTimeString()}"`,
                `"${daysSince}"`,
                `"${accountAge}"`
            ].join(",");
        }).join("\n");

        // Add footer
        csvContent += `\n\n"Report End"\n`;
        csvContent += `"Exported by: BeviSquare Admin Panel"\n`;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bevisquare_users_report_${dateStr}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Comprehensive report exported successfully");
        setShowExportModal(false);
    };

    const generateJSONExport = () => {
        if (filteredUsers.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalRecords: filteredUsers.length,
                filters: {
                    status: statusFilter,
                    role: roleFilter,
                    search: searchQuery
                }
            },
            statistics: stats ? {
                total: stats.total,
                approved: stats.approved,
                pending: stats.pending,
                rejected: stats.rejected,
                admins: stats.admins,
                members: stats.members,
                projects: projectsCount
            } : null,
            users: filteredUsers.map(u => ({
                id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                daysSinceJoined: Math.floor((new Date().getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bevisquare_users_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("JSON data exported successfully");
        setShowExportModal(false);
    };

    const applyStatusFilter = (status: string) => {
        setStatusFilter(status);
        setShowFilters(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader size="lg" />
                <p className="text-text-secondary font-medium animate-pulse">Loading system data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl border border-border-theme bg-surface/30 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5">
                {/* Glowing Accent Blobs */}
                <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse duration-4000" />
                <div className="absolute left-1/3 bottom-0 -mb-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl -z-10 animate-pulse duration-6000" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
                                Administrator Portal
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-none">
                            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-[#38bdf8]">Overview</span>
                        </h1>
                        <p className="text-sm sm:text-base text-text-secondary max-w-xl font-medium">
                            Real-time statistics, user management, and system analytics.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-3 border rounded-2xl transition-all text-sm font-bold shadow-sm active:scale-95 ${
                                showFilters 
                                    ? "bg-primary/10 border-primary text-primary" 
                                    : "bg-surface border-border-theme text-text-primary hover:bg-secondary"
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:opacity-95 transition-all text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid with Click Actions */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard 
                        title="Total Users" 
                        value={stats.total} 
                        icon={Users} 
                        color="indigo" 
                        trend="All registered users"
                        onClick={() => applyStatusFilter("all")}
                    />
                    <StatCard 
                        title="Pending Requests" 
                        value={stats.pending} 
                        icon={UserPlus} 
                        color="amber" 
                        trend="Awaiting approval"
                        onClick={() => applyStatusFilter("pending")}
                    />
                    <StatCard 
                        title="Approved Members" 
                        value={stats.approved} 
                        icon={UserCheck} 
                        color="emerald" 
                        trend="Active community"
                        onClick={() => applyStatusFilter("approved")}
                    />
                    <StatCard 
                        title="Rejected Users" 
                        value={stats.rejected} 
                        icon={UserX} 
                        color="rose" 
                        trend="Can be unblocked"
                        onClick={() => applyStatusFilter("rejected")}
                    />
                    <StatCard 
                        title="Total Projects" 
                        value={projectsCount} 
                        icon={FolderKanban} 
                        color="violet" 
                        trend="Active workspaces"
                        onClick={() => router.push('/admin/projects')}
                    />
                </div>
            )}

            {/* Filters Bar */}
            {showFilters && (
                <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">Role</label>
                            <select 
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Administrators</option>
                                <option value="member">Team Members</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setRoleFilter("all");
                                }}
                                className="w-full px-4 py-2.5 text-sm font-bold text-text-secondary hover:text-error transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Section */}
            <div className="bg-surface/50 backdrop-blur-xl border border-border-theme rounded-3xl overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50">
                <div className="p-6 border-b border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">User Directory</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border border-border-theme rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-all w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                <th className="px-8 py-4">User Details</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-theme">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="group hover:bg-secondary/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-surface border border-border-theme flex items-center justify-center text-text-primary font-bold shrink-0">
                                                {u.firstName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-text-primary truncate">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-text-secondary truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            u.role === "admin" 
                                                ? "bg-primary/10 text-primary border border-primary/20" 
                                                : "bg-accent/10 text-accent border border-accent/20"
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            u.status === "approved"
                                                ? "bg-success/10 text-success border border-success/20"
                                                : u.status === "pending"
                                                ? "bg-warning/10 text-warning border border-warning/20"
                                                : "bg-error/10 text-error border border-error/20"
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                u.status === "approved" ? "bg-success" : u.status === "pending" ? "bg-warning" : "bg-error"
                                            }`} />
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-text-secondary whitespace-nowrap">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {u.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => setApprovingUser(u)}
                                                        disabled={actionLoading === u._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-success text-white border border-success rounded-xl text-xs font-bold hover:bg-success/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-success/20"
                                                        title="Approve user access"
                                                    >
                                                        {actionLoading === u._id ? (
                                                            <Loader size="sm" />
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-4 h-4" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingUser(u)}
                                                        disabled={actionLoading === u._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-error text-white border border-error rounded-xl text-xs font-bold hover:bg-error/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-error/20"
                                                        title="Reject user access"
                                                    >
                                                        {actionLoading === u._id ? (
                                                            <Loader size="sm" />
                                                        ) : (
                                                            <>
                                                                <UserX className="w-4 h-4" />
                                                                Reject
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            {u.status === "approved" && (
                                                <div className="flex items-center gap-1.5 text-xs text-success font-bold px-4 py-2 bg-success/10 rounded-xl border border-success/20">
                                                    <UserCheck className="w-4 h-4" />
                                                    Approved
                                                </div>
                                            )}
                                            {u.status === "rejected" && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setUnblockingUser(u)}
                                                        disabled={actionLoading === u._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-warning text-white border border-warning rounded-xl text-xs font-bold hover:bg-warning/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-warning/20"
                                                        title="Unblock user to allow re-approval"
                                                    >
                                                        {actionLoading === u._id ? (
                                                            <Loader size="sm" />
                                                        ) : (
                                                            <>
                                                                <Unlock className="w-4 h-4" />
                                                                Unblock
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-text-secondary font-medium">No users found matching your criteria.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border-theme flex items-center justify-between">
                    <p className="text-sm text-text-secondary">Showing {filteredUsers.length} of {stats?.total || 0} users</p>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-surface border border-border-theme text-text-secondary rounded-xl text-sm disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 bg-surface border border-border-theme text-text-primary rounded-xl text-sm hover:bg-secondary transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={!!approvingUser}
                onClose={() => setApprovingUser(null)}
                onConfirm={handleApprove}
                title="Approve User Access"
                message={`Are you sure you want to approve ${approvingUser?.firstName} ${approvingUser?.lastName} (${approvingUser?.email})? They will gain access to the platform.`}
                confirmText="Approve User"
                type="success"
                loading={actionLoading === approvingUser?._id}
            />

            <ConfirmModal
                isOpen={!!rejectingUser}
                onClose={() => setRejectingUser(null)}
                onConfirm={handleReject}
                title="Reject User Access"
                message={`Are you sure you want to reject ${rejectingUser?.firstName} ${rejectingUser?.lastName} (${rejectingUser?.email})? This action can be reversed later.`}
                confirmText="Reject User"
                type="danger"
                loading={actionLoading === rejectingUser?._id}
            />

            <ConfirmModal
                isOpen={!!unblockingUser}
                onClose={() => setUnblockingUser(null)}
                onConfirm={handleUnblock}
                title="Unblock User"
                message={`Are you sure you want to unblock ${unblockingUser?.firstName} ${unblockingUser?.lastName} (${unblockingUser?.email})? The user will be set to pending status and can reapply for access.`}
                confirmText="Unblock User"
                type="warning"
                loading={actionLoading === unblockingUser?._id}
            />

            {/* Export Modal - Uses Portal to render at body level */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExportCSV={generateCSVExport}
                onExportJSON={generateJSONExport}
            />
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend, onClick }: any) {
    const colors: any = {
        indigo: "text-primary bg-primary/10 border-primary/20 shadow-primary/5 hover:shadow-primary/10",
        amber: "text-warning bg-warning/10 border-warning/20 shadow-warning/5 hover:shadow-warning/10",
        emerald: "text-success bg-success/10 border-success/20 shadow-success/5 hover:shadow-success/10",
        rose: "text-error bg-error/10 border-error/20 shadow-error/5 hover:shadow-error/10",
        violet: "text-accent bg-accent/10 border-accent/20 shadow-accent/5 hover:shadow-accent/10",
    };

    return (
        <div 
            onClick={onClick}
            className={`p-6 bg-surface/50 backdrop-blur-xl border rounded-3xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-surface group cursor-pointer ${colors[color]}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="p-2 text-text-secondary group-hover:text-text-primary rounded-lg transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{title}</p>
                <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-4xl font-bold text-text-primary tracking-tight">{value}</h3>
                </div>
                <p className="text-xs text-text-secondary mt-3 font-medium flex items-center gap-1.5">
                    <span className={colors[color].split(" ")[0]}>{trend}</span>
                </p>
            </div>
        </div>
    );
}
