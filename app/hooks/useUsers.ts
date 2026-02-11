import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/app/types';

interface UseUsersFilters {
  role?: string;
  status?: string;
  search?: string;
}

export const useUsers = (filters: UseUsersFilters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  );

  return useQuery({
    queryKey: ['users', cleanFilters],
    queryFn: () => apiClient.getUsers(cleanFilters) as Promise<User[]>,
    enabled: apiClient.isAuthenticated(),
  });
};

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => apiClient.getUser(userId!),
    enabled: !!userId,
  });
};