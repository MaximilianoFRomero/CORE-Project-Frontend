'use client';

import { useRouter } from 'next/navigation';
import { useSessionExpired } from '@/app/hooks/useSessionExpired';
import { toast } from 'sonner';

/**
 * SessionListener Component
 * 
 * Patrón: Observer + Provider Pattern
 * Responsabilidad: Escuchar eventos de sesión y redirigir a login
 * Ubicación: Root provider en app/providers.tsx
 * 
 * Ventajas:
 * - Centraliza la lógica de redirección
 * - Se ejecuta una sola vez en la app
 * - Fácil de agregar notificaciones o logging
 * - Desacoplado de ApiClient
 */

export function SessionListener(): null {
  const router = useRouter();

  /**
   * Ejecuta cuando la sesión expira
   * 
   * Flujo:
   * 1. Mostrar notificación al usuario
   * 2. Pequeño delay para que el usuario vea el mensaje
   * 3. Redirigir a /login
   */
  useSessionExpired(() => {
    // 1. Notificar al usuario
    toast.error('Your session has expired. Please log in again.', {
      duration: 3000, // Mostrar por 3 segundos
      position: 'top-center',
    });

    // 2. Delay para que el usuario lea el mensaje
    // (Recomendado: 1-2 segundos)
    setTimeout(() => {
      // 3. Redirigir a login usando Next.js router
      // router.push() es mejor que window.location.href porque:
      // - No recarga la página
      // - Mantiene el historial de navegación
      // - Es más performante
      router.push('/login');
    }, 1500);
  });

  /**
   * Este componente no renderiza nada
   * Solo se encarga de escuchar y redirigir
   */
  return null;
}