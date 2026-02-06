// src/hooks/useAdminUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateAdminUserDto, AdminUser } from '@/app/types'; // ← Importar AdminUser
import { toast } from 'sonner';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getAdminUsers() as Promise<AdminUser[]>, // ← Cast al tipo correcto
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
      
      return apiClient.createAdminUser(formattedData) as Promise<AdminUser>; // ← Cast al tipo correcto
    },
    onSuccess: (newAdmin) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      // Actualizar cache optimísticamente
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