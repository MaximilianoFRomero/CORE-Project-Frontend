'use client';

import { useEffect } from 'react';
import { authManager } from '@/lib/auth-manager';

/**
 * Hook para suscribirse a eventos de sesión expirada
 * 
 * @param callback Función opcional a ejecutar cuando la sesión expire
 * 
 * @example
 * // Uso simple - sin callback (solo escuchar)
 * useSessionExpired();
 * 
 * @example
 * // Con callback personalizado
 * useSessionExpired(() => {
 *   console.log('Session expired!');
 *   // Hacer algo personalizado
 * });
 */
export function useSessionExpired(callback?: () => void): void {
  useEffect(() => {
    // Si no hay callback, no hay nada que hacer
    if (!callback) {
      return;
    }

    // Suscribirse al evento de sesión expirada
    const unsubscribe = authManager.onSessionExpired(callback);

    // Cleanup: Desuscribirse cuando el componente se desmonte
    // Esto es importante para prevenir memory leaks
    return () => {
      unsubscribe();
    };
  }, [callback]);
}