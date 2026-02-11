'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUserProfile } from '@/app/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Calendar,
  Shield,
  User,
  AlertCircle,
  ArrowLeft,
  Key,
  Clock,
  CheckCircle,
  Ban,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserProfile } from '@/app/types';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useUserProfile(userId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: { label: 'Super Admin', class: 'bg-primary/10 text-primary border-primary/20', icon: Shield },
      admin: { label: 'Admin', class: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
      user: { label: 'User', class: 'bg-gray-100 text-gray-800 border-gray-200', icon: User },
      viewer: { label: 'Viewer', class: 'bg-purple-100 text-purple-800 border-purple-200', icon: Eye },
    };
    const info = variants[role as keyof typeof variants] || variants.user;
    const Icon = info.icon;
    return (
      <Badge variant="outline" className={`${info.class} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
      suspended: { label: 'Suspended', class: 'bg-red-100 text-red-800 border-red-200', icon: Ban },
      inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
    };
    const info = variants[status as keyof typeof variants] || variants.inactive;
    const Icon = info.icon;
    return (
      <Badge variant="outline" className={`${info.class} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error loading user
            </CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'User not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/settings')}>
              Go to User Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>
                Detailed information about {user.firstName} {user.lastName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since
              </p>
              <p className="font-medium">
                {format(new Date(user.createdAt), 'PPP', { locale: es })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last login
              </p>
              <p className="font-medium">
                {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'PPP', { locale: es }) : 'Never'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Key className="h-4 w-4" />
                Email verified
              </p>
              <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                {user.emailVerified ? 'Verified' : 'Not verified'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="h-4 w-4" />
                User ID
              </p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="outline" onClick={() => router.push('/dashboard/settings?tab=team')}>
              Back to User Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}