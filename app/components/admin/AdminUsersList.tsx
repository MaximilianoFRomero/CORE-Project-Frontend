// src/components/admin/AdminUsersList.tsx
'use client';

import { useAdminUsers } from '@/app/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Mail, Calendar, Shield, User, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { AdminUser } from '@/app/types'; // ← Importar tipo correcto

export default function AdminUsersList() {
  const { data: adminUsers, isLoading, error } = useAdminUsers();

  // ✅ Asegurar que adminUsers sea del tipo correcto
  const users: AdminUser[] = adminUsers || [];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status?: string) => {
    // ✅ Manejar status undefined
    if (!status) {
      return (
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
          Unknown
        </Badge>
      );
    }
    
    const variants = {
      active: { label: 'Active', variant: 'default' as const, class: 'bg-green-100 text-green-800 border-green-200' },
      pending: { label: 'Pending', variant: 'secondary' as const, class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      suspended: { label: 'Suspended', variant: 'destructive' as const, class: 'bg-red-100 text-red-800 border-red-200' },
      inactive: { label: 'Inactive', variant: 'outline' as const, class: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    
    const statusInfo = variants[status as keyof typeof variants] || variants.inactive;
    return (
      <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.class}`}>
        {statusInfo.label}
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Loading admin users...</CardDescription>
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
            Error Loading Admin Users
          </CardTitle>
          <CardDescription>Unable to load admin users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-700 text-sm">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <p className="text-red-600 text-xs mt-2">
              You may not have permission to view admin users or there's a connection issue.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAdminUsers = users.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Users
            </CardTitle>
            <CardDescription>
              {hasAdminUsers 
                ? `${users.length} admin users with elevated permissions`
                : 'No admin users found'
              }
            </CardDescription>
          </div>
          {hasAdminUsers && (
            <Badge variant="outline" className="px-3 py-1">
              {users.length} Total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasAdminUsers ? (
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
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
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reset Email
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
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
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Admin Users Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Create your first admin user to help manage the platform and delegate responsibilities.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Admin users can:</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 justify-center">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                  Manage projects and deployments
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                  View analytics and reports
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                  Invite team members
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}