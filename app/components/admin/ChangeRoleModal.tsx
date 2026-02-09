'use client';

import { useState } from 'react';
import { AdminUser, UserRole } from '@/app/types';
import { useChangeUserRole } from '@/app/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Shield, User, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/auth-provider';
import { Badge } from '@/components/ui/badge';

interface ChangeRoleModalProps {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
    { value: 'user', label: 'User', description: 'Regular user with basic permissions' },
    { value: 'admin', label: 'Admin', description: 'Can manage projects and deployments' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to projects' },
] as const;

export default function ChangeRoleModal({
    user,
    open,
    onOpenChange
}: ChangeRoleModalProps) {
    const { mutate: changeRole, isPending } = useChangeUserRole();
    const { user: currentUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'user');

    const handleSubmit = () => {
        if (!user || !selectedRole) return;

        if (user.role === 'super_admin') {
            toast.error('Cannot change role of super admin');
            return;
        }

        if (user.id === currentUser?.id) {
            toast.error('Cannot change your own role');
            return;
        }

        if (currentUser?.role !== 'super_admin') {
            toast.error('Only super admins can change user roles');
            return;
        }

        changeRole(
            { userId: user.id, role: selectedRole },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4" />;
            case 'super_admin': return <Shield className="h-4 w-4 text-primary" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'super_admin': return 'text-primary bg-primary/10 border-primary/20';
            case 'viewer': return 'text-purple-600 bg-purple-50 border-purple-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Change User Role
                    </DialogTitle>
                    <DialogDescription>
                        Update user permissions and access level
                    </DialogDescription>
                </DialogHeader>

                {user && (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    {getRoleIcon(user.role)}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className={getRoleColor(user.role)}>
                                            {getRoleIcon(user.role)}
                                            <span className="ml-1 capitalize">{user.role.replace('_', ' ')}</span>
                                        </Badge>
                                        <Badge variant="outline">
                                            {user.status || 'active'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Select New Role</label>
                            <Select
                                value={selectedRole}
                                onValueChange={(value: UserRole) => setSelectedRole(value)}
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    {getRoleIcon(option.value)}
                                                    <span className="font-medium">{option.label}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {user.role !== selectedRole && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={getRoleColor(user.role)}>
                                                Current: {user.role.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-muted-foreground">→</span>
                                            <Badge variant="outline" className={getRoleColor(selectedRole)}>
                                                New: {selectedRole.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedRole !== user.role && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-medium">Important</p>
                                            <ul className="mt-1 space-y-1 list-disc list-inside">
                                                <li>User will immediately gain/lose permissions</li>
                                                <li>Active sessions may be affected</li>
                                                <li>User will receive a notification email</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || selectedRole === user.role}
                            >
                                {isPending ? 'Updating...' : 'Change Role'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}