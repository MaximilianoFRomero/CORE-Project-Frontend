import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateAdminUserDto, AdminUser, UserRole, UserStatus, User } from '@/app/types';
import { toast } from 'sonner';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getAdminUsers() as Promise<AdminUser[]>,
    enabled: apiClient.isAuthenticated() && apiClient.getUserRole() === 'super_admin',
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserDto) => {
      const formattedData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.password && { password: data.password }),
        ...(data.generatePassword && { generatePassword: data.generatePassword }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      };

      return apiClient.createAdminUser(formattedData) as Promise<AdminUser>;
    },
    onSuccess: (newAdmin) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });

      queryClient.setQueryData(['admin-users'], (old: AdminUser[] = []) => {
        return [newAdmin, ...old];
      });

      toast.success('Admin user created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create admin user');
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      apiClient.patch(`/users/${userId}`, { role }),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });

      queryClient.setQueryData(['admin-users'], (old: AdminUser[] = []) => {
        return old.map(user =>
          user.id === variables.userId ? updatedUser : user
        );
      });

      toast.success(`User role changed to ${variables.role}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change user role');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      apiClient.patch(`/users/${userId}`, { status }),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });

      queryClient.setQueryData(['admin-users'], (old: AdminUser[] = []) => {
        return old.map(user =>
          user.id === variables.userId ? updatedUser : user
        );
      });

      toast.success(`User ${variables.status === 'active' ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to toggle user status');
    },
  });
};

export const useSendResetEmail = () => {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      toast.success('Reset password email sent');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/users/${userId}`),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      queryClient.setQueryData(['admin-users'], (old: AdminUser[] = []) => {
        return old.filter(user => user.id !== userId);
      });

      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => apiClient.getUser(userId!), // ahora tipado a UserProfile
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserDto & { role: UserRole }) => {
      const formattedData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        ...(data.password && { password: data.password }),
        ...(data.generatePassword && { generatePassword: data.generatePassword }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      };

      return apiClient.createUser(formattedData) as Promise<AdminUser>;
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['admin-users'], (old: AdminUser[] = []) => {
        return [newUser, ...old];
      });

      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};