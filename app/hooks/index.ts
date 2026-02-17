/**
 * Hooks Index
 * 
 * Archivo central que exporta todos los hooks personalizados
 * Facilita las importaciones en toda la aplicación
 * 
 * Importación correcta:
 * import { useProjects, useSessionExpired } from '@/app/hooks'
 * 
 * En lugar de:
 * import { useProjects } from '@/app/hooks/useProjects'
 * import { useSessionExpired } from '@/app/hooks/useSessionExpired'
 */

// ==================== Data Hooks ====================
// Hooks para obtener/manipular datos del servidor

export * from './useProjects';
export * from './useDeployments';
export * from './useAdminUsers';
export { useUserProfile } from './useAdminUsers'; // Explicitly re-export useUserProfile
export * from './useUsers';

// ==================== Auth & Session Hooks ====================
// Hooks para autenticación y manejo de sesión

export * from './useSessionExpired';

// ==================== Types ====================
// Exportar tipos útiles desde los hooks

export type { Project, CreateProjectDto, UpdateProjectDto } from './useProjects';
export type { Deployment, DeploymentStats, CreateDeploymentDto } from './useDeployments';