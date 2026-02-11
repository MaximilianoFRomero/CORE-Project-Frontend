'use client';

import { useState } from 'react';
import { useUsers } from '@/app/hooks/useUsers';
import { useDeleteUser, useSendResetEmail } from '@/app/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreVertical,
  Mail,
  Calendar,
  Shield,
  User,
  AlertCircle,
  Eye,
  Key,
  UserCog,
  Ban,
  CheckCircle,
  Trash2,
  FilterX,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { User as UserType, AdminUser } from '@/app/types';
import { useAuth } from '@/app/providers/auth-provider';
import ChangeRoleModal from '@/app/components/admin/ChangeRoleModal';
import SuspendUserModal from '@/app/components/admin/SuspendUserModal';
import SendResetEmailModal from '@/app/components/admin/SendResetEmailModal';
import DeleteUserModal from '@/app/components/admin/DeleteUserModal';
import { toast } from 'sonner';

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const deleteUserMutation = useDeleteUser();

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  const { data: users = [], isLoading, error, refetch } = useUsers(filters);
  const { mutate: sendResetEmail, isPending: isSendingResetEmail } = useSendResetEmail();

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [modalType, setModalType] = useState<'role' | 'suspend' | 'reset' | 'profile' | 'delete' | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
          Unknown
        </Badge>
      );
    }

    const variants = {
      active: {
        label: 'Active',
        variant: 'default' as const,
        class: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      pending: {
        label: 'Pending',
        variant: 'secondary' as const,
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      suspended: {
        label: 'Suspended',
        variant: 'destructive' as const,
        class: 'bg-red-100 text-red-800 border-red-200',
        icon: <Ban className="h-3 w-3 mr-1" />,
      },
      inactive: {
        label: 'Inactive',
        variant: 'outline' as const,
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
    };

    const statusInfo = variants[status as keyof typeof variants] || variants.inactive;
    return (
      <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.class} flex items-center`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: {
        label: 'Super Admin',
        variant: 'default' as const,
        class: 'bg-primary/10 text-primary border-primary/20',
        icon: <Shield className="h-3 w-3 mr-1" />,
      },
      admin: {
        label: 'Admin',
        variant: 'secondary' as const,
        class: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Shield className="h-3 w-3 mr-1" />,
      },
      user: {
        label: 'User',
        variant: 'outline' as const,
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <User className="h-3 w-3 mr-1" />,
      },
      viewer: {
        label: 'Viewer',
        variant: 'outline' as const,
        class: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Eye className="h-3 w-3 mr-1" />,
      },
    };

    const roleInfo = variants[role as keyof typeof variants] || variants.user;
    return (
      <Badge variant={roleInfo.variant} className={`text-xs ${roleInfo.class} flex items-center`}>
        {roleInfo.icon}
        {roleInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const openModal = (user: UserType, type: typeof modalType) => {
    setSelectedUser(user);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleSendResetEmail = (email: string) => {
    sendResetEmail(email, {
      onSuccess: () => {
        toast.success('Password reset email sent successfully');
        closeModal();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to send reset email');
      },
    });
  };

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        closeModal();
      },
    });
};

  const canChangeRole = (user: UserType) => {
    if (!currentUser) return false;
    if (currentUser.role !== 'super_admin') return false;
    if (user.id === currentUser.id) return false;
    if (user.role === 'super_admin') return false;
    return true;
  };

  const canSuspend = (user: UserType) => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin') {
      return user.role !== 'admin' && user.role !== 'super_admin';
    }
    return false;
  };

  const canDelete = (user: UserType) => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return false;
    if (user.role === 'super_admin' && currentUser.role !== 'super_admin') return false;
    return currentUser.role === 'super_admin' || currentUser.role === 'admin';
  };

  const clearFilters = () => {
    setFilters({ role: '', status: '', search: '' });
  };

  const handleRoleFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, role: value === 'all' ? '' : value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error Loading Users
          </CardTitle>
          <CardDescription>Unable to load users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-700 text-sm">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <p className="text-red-600 text-xs mt-2">
              You may not have permission to view users or there's a connection issue.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUsers = users.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                {hasUsers ? `${users.length} users in total` : 'No users found'}
              </CardDescription>
            </div>
            {hasUsers && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {users.length} Total
                </Badge>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Refresh
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Input
              placeholder="Search by email or name..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="max-w-sm"
            />
            <Select value={filters.role || 'all'} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {(filters.role || filters.status || filters.search) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {hasUsers ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={user.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openModal(user, 'reset')}
                          disabled={isSendingResetEmail}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Send Reset Email
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openModal(user, 'role')}
                          disabled={!canChangeRole(user)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Change Role
                          {!canChangeRole(user) && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {user.id === currentUser?.id ? 'Self' : 'Restricted'}
                            </span>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openModal(user, 'suspend')}
                          disabled={!canSuspend(user)}
                        >
                          {user.status === 'suspended' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              <span className="text-green-600">Activate User</span>
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2 text-red-600" />
                              <span className="text-red-600">Suspend User</span>
                            </>
                          )}
                          {!canSuspend(user) && user.id !== currentUser?.id && (
                            <span className="ml-auto text-xs text-muted-foreground">Restricted</span>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => openModal(user, 'delete')}
                          disabled={!canDelete(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                          {!canDelete(user) && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {user.id === currentUser?.id ? 'Self' : 'Restricted'}
                            </span>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {index < users.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Users Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {filters.role || filters.status || filters.search
                  ? 'No users match the selected filters. Try clearing them.'
                  : 'Create your first user to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <ChangeRoleModal
            user={selectedUser as AdminUser}
            open={modalType === 'role'}
            onOpenChange={(open) => !open && closeModal()}
          />
          <SuspendUserModal
            user={selectedUser as AdminUser}
            open={modalType === 'suspend'}
            onOpenChange={(open) => !open && closeModal()}
          />
          <SendResetEmailModal
            user={selectedUser as AdminUser}
            open={modalType === 'reset'}
            onOpenChange={(open) => !open && closeModal()}
            onSendEmail={handleSendResetEmail}
            isSending={isSendingResetEmail}
          />
          <DeleteUserModal
            user={selectedUser as AdminUser}
            open={modalType === 'delete'}
            onOpenChange={(open) => !open && closeModal()}
          />
        </>
      )}
    </>
  );
}