import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Deployment {
  id: string;
  commitHash: string;
  commitMessage: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  environment: 'development' | 'staging' | 'production';
  logs?: string;
  url?: string;
  buildTime?: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface DeploymentStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
  today: number;
  successRate: number;
}

export const useDeployments = (params?: {
  projectId?: string;
  environment?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['deployments', params],
    queryFn: () => 
      apiClient.get<Deployment[]>('/deployments', params as Record<string, string>),
  });
};

export const useDeploymentsStats = (projectId?: string) => {
  return useQuery({
    queryKey: ['deployments-stats', projectId],
    queryFn: () => 
      apiClient.get<DeploymentStats>('/deployments/stats', 
        projectId ? { projectId } : undefined
      ),
  });
};

export const useDeploymentsByDateRange = (
  startDate: string, 
  endDate: string, 
  projectId?: string
) => {
  return useQuery({
    queryKey: ['deployments-by-date', startDate, endDate, projectId],
    queryFn: async () => {
      try {
        const params: Record<string, string> = {
          startDate,
          endDate,
        };
        if (projectId) {
          params.projectId = projectId;
        }
        
        const data = await apiClient.get<Deployment[]>('/deployments/by-date-range', params);
        console.log('Deployments data received:', data);
        return data;
      } catch (error) {
        console.error('Error fetching deployments:', error);
        throw error;
      }
    },
    enabled: !!startDate && !!endDate,
  });
};

export interface CreateDeploymentDto {
  projectId: string;
  commitHash: string;
  commitMessage: string;
  environment?: 'development' | 'staging' | 'production';
  status?: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
}

export const useCreateDeployment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDeploymentDto) =>
      apiClient.post<Deployment>('/deployments', {
        ...data,
        status: data.status || 'pending',
        environment: data.environment || 'development',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployments-stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};