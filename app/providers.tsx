'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers/auth-provider';
import { SessionListener } from './providers/session-listener';
import { useState } from 'react';

/**
 * Providers
 * 
 * Componente raíz que envuelve toda la aplicación
 * Responsabilidad: Agregar providers globales en orden correcto
 * 
 * Orden de providers (importante):
 * 1. QueryClientProvider - Estado del servidor (React Query)
 * 2. AuthProvider - Contexto de autenticación
 * 3. SessionListener - Escucha eventos de sesión
 * 4. Toaster - Notificaciones
 * 5. children - Contenido de la app
 */

export function Providers({ children }: { children: React.ReactNode }) {
  /**
   * QueryClient: Configuración de React Query
   * 
   * Opciones:
   * - staleTime: 1 segundo (datos frescos por 1s)
   * - gcTime: 5 segundos (mantener en cache por 5s)
   * - refetchOnMount: true (refrescar al montar componente)
   * - refetchOnWindowFocus: true (refrescar al volver a la ventana)
   */
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000,
          gcTime: 5000,
          refetchOnMount: true,
          refetchOnWindowFocus: true,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* SessionListener: Escucha eventos de sesión expirada */}
        {/* Se ejecuta una sola vez en la app, de forma invisible */}
        {/* Responsabilidades:
            - Mostrar notificación cuando sesión expira
            - Redirigir a /login automáticamente
            - Limpiar estado
        */}
        <SessionListener />

        {children}

        {/* Toaster: Notificaciones (sonner) */}
        {/* Configuración:
            - position: top-right (esquina superior derecha)
            - className: font-sans (usa font del proyecto)
        */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-sans',
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}