type SessionEventCallback = () => void;

interface ISessionEventBus {
  subscribe(callback: SessionEventCallback): () => void;
  unsubscribeAll(): void;
  notify(): void;
}

class SessionEventBusImpl implements ISessionEventBus {
  private subscribers: Set<SessionEventCallback> = new Set();

  /**
   * Suscribirse a eventos de sesión expirada
   * @param callback Función que se ejecuta cuando la sesión expira
   * @returns Función para desuscribirse
   */
  subscribe(callback: SessionEventCallback): () => void {
    this.subscribers.add(callback);

    // Retornar función de desuscripción (Unsubscribe Pattern)
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Limpiar todos los suscriptores
   */
  unsubscribeAll(): void {
    this.subscribers.clear();
  }

  /**
   * Notificar a todos los suscriptores
   */
  notify(): void {
    // Ejecutar cada suscriptor y capturar errores
    this.subscribers.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('[SessionEventBus] Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Obtener cantidad de suscriptores (útil para testing)
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// Singleton: Instancia única en toda la aplicación
export const sessionEventBus = new SessionEventBusImpl();

export type { ISessionEventBus };