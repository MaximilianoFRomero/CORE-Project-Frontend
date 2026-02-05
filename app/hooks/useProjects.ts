import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';


export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  framework: 'nextjs' | 'nestjs' | 'express' | 'react' | 'vue' | 'angular';
  databases: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  lastDeployedAt?: string;
  deployments?: any[];
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  repositoryUrl?: string;
  status?: 'active' | 'inactive' | 'archived';
  framework?: 'nextjs' | 'nestjs' | 'express' | 'react' | 'vue' | 'angular';
  databases?: string[];
  isPrivate?: boolean;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const useProjects = (params?: {
  search?: string;
  status?: string;
  framework?: string;
}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => 
      apiClient.get<Project[]>('/projects', params as Record<string, string>),
  });
};

export const useProject = (id?: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
};

export const useProjectsStats = () => {
  return useQuery({
    queryKey: ['projects-stats'],
    queryFn: () => apiClient.get<any>('/projects/stats'),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      console.log('useCreateProject - Sending data:', data)
      try {
        const result = await apiClient.post<Project>('/projects', data)
        console.log('useCreateProject - Success:', result)
        return result
      } catch (error) {
        console.error('useCreateProject - Error:', error)
        throw error
      }
    },
    onSuccess: (newProject) => {
      console.log('useCreateProject - onSuccess triggered')
      
      queryClient.invalidateQueries({ 
        queryKey: ['projects'] 
      });
      
      queryClient.setQueryData(['projects'], (old: Project[] = []) => {
        console.log('Old projects:', old.length)
        console.log('Adding new project:', newProject)
        return [newProject, ...old];
      });
      
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      apiClient.patch<Project>(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};