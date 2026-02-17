import { sessionEventBus } from './session-event-bus';
import { apiClient } from './api-client';

interface IAuthManager {
  handleSessionExpired(): Promise<void>;
  isSessionActive(): boolean;
  notifySessionExpired(): void;
  onSessionExpired(callback: () => void): () => void;
  clearSession(): void;
}

class AuthManagerImpl implements IAuthManager {
  private isHandlingExpiration = false;

  constructor() {
    this.initializeSessionExpiredHandler();
  }

  /**
   * Inicializa el handler de sesión expirada en ApiClient
   * Esto ocurre una sola vez cuando se crea la instancia
   */
  private initializeSessionExpiredHandler(): void {
    // El ApiClient notificará al AuthManager cuando la sesión expire
    apiClient.onSessionExpired(() => {
      this.handleSessionExpired();
    });
  }

  /**
   * Maneja la expiración de sesión
   * Ejecuta una sola vez (previene múltiples redirecciones)
   */
  async handleSessionExpired(): Promise<void> {
    // Guard: Evitar múltiples ejecuciones simultáneas
    if (this.isHandlingExpiration) {
      return;
    }

    this.isHandlingExpiration = true;

    try {
      // 1. Limpiar estado local
      this.clearSession();

      // 2. Notificar a todos los suscriptores
      this.notifySessionExpired();

      // 3. Log para debugging
      console.log('[AuthManager] Session expired - Redirecting to login');
    } catch (error) {
      console.error('[AuthManager] Error handling session expiration:', error);
    } finally {
      this.isHandlingExpiration = false;
    }
  }

  /**
   * Verifica si la sesión está activa
   */
  isSessionActive(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Notifica a todos los suscriptores sobre sesión expirada
   */
  notifySessionExpired(): void {
    sessionEventBus.notify();
  }

  /**
   * Suscribirse a eventos de sesión expirada
   * @param callback Función a ejecutar cuando la sesión expire
   * @returns Función para desuscribirse
   */
  onSessionExpired(callback: () => void): () => void {
    return sessionEventBus.subscribe(callback);
  }

  /**
   * Limpiar sesión: tokens, suscriptores, etc.
   */
  clearSession(): void {
    apiClient.clearTokens();
    // Nota: No limpiamos sessionEventBus aquí porque los suscriptores
    // aún necesitan ejecutarse antes de ser limpiados
  }

  /**
   * Obtener estado actual de la sesión (útil para debugging)
   */
  getSessionStatus(): {
    isActive: boolean;
    subscriberCount: number;
  } {
    return {
      isActive: this.isSessionActive(),
      subscriberCount: (sessionEventBus as any).getSubscriberCount?.() || 0,
    };
  }
}

// Singleton: Instancia única en toda la aplicación
export const authManager = new AuthManagerImpl();

export type { IAuthManager };