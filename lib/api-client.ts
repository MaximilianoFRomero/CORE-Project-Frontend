import { jwtDecode } from 'jwt-decode';
import { CreateAdminUserDto, User, AdminUser, UserProfile, UserRole, UserStatus } from '@/app/types/index';

/**
 * TokenPayload
 * Estructura del JWT token decodificado
 */
interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * ApiErrorData
 * Estructura de errores devueltos por el API
 */
interface ApiErrorData {
  message?: string;
  [key: string]: any;
}

/**
 * ApiError
 * 
 * Clase personalizada para errores API
 * Patrón: Custom Error Class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: ApiErrorData
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * ApiClient
 * 
 * Patrones: Singleton + Strategy (manejo de errores)
 * Responsabilidad: Cliente HTTP centralizado
 * 
 * Mejoras en esta fase:
 * - Integración con authManager para sesión expirada
 * - Mejor logging con prefixes
 * - Manejo de errores mejorado
 * - Comments más descriptivos
 */
export class ApiClient {
  private readonly baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private onSessionExpiredCallback: (() => void) | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.initializeTokens();
  }

  /**
   * Registrar callback de sesión expirada
   * Se utiliza por AuthManager para coordinar sesión
  */
  onSessionExpired(callback: () => void): void {
    this.onSessionExpiredCallback = callback;
  }

  /**
   * Inicializar tokens desde almacenamiento (localStorage o sessionStorage)
   * Se ejecuta una sola vez en el constructor y cuando sea necesario reincializar
  */
  public initializeTokens(): void {
    if (typeof window === 'undefined') return;

    // Intentar obtener de localStorage (Sesión persistente)
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');

    // Si no está en localStorage, intentar sessionStorage (Sesión temporal)
    if (!this.accessToken) {
      this.accessToken = sessionStorage.getItem('access_token');
      this.refreshToken = sessionStorage.getItem('refresh_token');
    }
  }

  public reinitializeTokens(): void {
    this.initializeTokens();
    console.log('[ApiClient] Tokens reinitialized from storage');
  }

  /**
   * Guardar tokens en el almacenamiento adecuado
   * @param accessToken Token de acceso
   * @param refreshToken Token de refresco
   * @param rememberMe Si es true, usa localStorage. Si es false, usa sessionStorage.
   */
  private setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = true): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;

      // Limpiar el otro almacenamiento para evitar conflictos
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('access_token');
      otherStorage.removeItem('refresh_token');

      // Guardar en el almacenamiento seleccionado
      storage.setItem('access_token', accessToken);
      storage.setItem('refresh_token', refreshToken);

      // Guardar en cookie para middleware
      // Si rememberMe es false, la cookie no tiene expiración (cookie de sesión)
      let cookieString = `access_token=${accessToken};path=/;SameSite=Lax`;

      if (rememberMe) {
        const d = new Date();
        d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 días
        cookieString += `;expires=${d.toUTCString()}`;
      }

      document.cookie = cookieString;
    }
  }

  /**
   * Limpiar tokens de memoria y almacenamiento
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');

      // Eliminar cookie del middleware
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  /**
   * Verificar si un token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<TokenPayload>(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Refrescar el access token usando el refresh token
   * 
   * Características:
   * - Evita múltiples refresh simultáneos (refreshPromise)
   * - Manejo de errores: Si falla, limpia tokens
   * - Retorna nuevo token o lanza error
   */
  private async refreshAccessToken(): Promise<string> {
    // Si ya hay un refresh en proceso, esperar ese
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new ApiError('No refresh token available');
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          throw new ApiError('Failed to refresh token', response.status);
        }

        const data = await response.json();

        if (!data.access_token) {
          throw new ApiError('Invalid refresh response');
        }

        this.setTokens(
          data.access_token,
          data.refresh_token || this.refreshToken!
        );

        console.log('[ApiClient] Token refreshed successfully');
        return data.access_token;
      } catch (error) {
        console.error('[ApiClient] Token refresh failed:', error);
        this.clearTokens();
        throw error instanceof ApiError ? error : new ApiError('Refresh failed');
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Disparar evento de sesión expirada
   * Notifica a AuthManager que la sesión expiró
   */
  private triggerSessionExpired(): void {
    if (this.onSessionExpiredCallback) {
      try {
        console.log('[ApiClient] Triggering session expired event');
        this.onSessionExpiredCallback();
      } catch (error) {
        console.error('[ApiClient] Error triggering session expired callback:', error);
      }
    }
  }

  /**
   * Realizar request HTTP
   * 
   * Características:
   * - Headers automáticos con Authorization
   * - Refresh automático si token expirado (401)
   * - Manejo de errores centralizado
   * - Logging detallado
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.createHeaders(options.headers);

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store', // Desactivar caché de Next.js/Vercel
    };

    try {
      console.log(`[ApiClient] ${config.method || 'GET'} ${endpoint}`);
      const response = await fetch(url, config);

      // Manejo de 401: Token expirado o inválido
      if (response.status === 401 && retry && this.refreshToken) {
        try {
          console.log('[ApiClient] Received 401, attempting token refresh');
          const newToken = await this.refreshAccessToken();

          if (newToken) {
            // Reintentar request con nuevo token
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryConfig = { ...config, headers };
            const retryResponse = await fetch(url, retryConfig);
            console.log('[ApiClient] Request retry successful after refresh');
            return this.handleResponse<T>(retryResponse);
          }
        } catch (error) {
          console.error('[ApiClient] Refresh failed, triggering session expired');

          // Limpiar tokens y disparar evento
          this.clearTokens();
          this.triggerSessionExpired();

          throw new ApiError('Session expired', 401);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('[ApiClient] Network error:', error);
      throw new ApiError('Network error', 0, { originalError: error });
    }
  }

  /**
   * Crear headers con Authorization automático
   */
  private createHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    return headers;
  }


  /**
   * Procesar response HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await this.parseErrorResponse(response);
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Parsear error response
   */
  private async parseErrorResponse(response: Response): Promise<ApiErrorData> {
    try {
      return await response.json();
    } catch {
      return { message: `HTTP ${response.status}` };
    }
  }

  // ==================== Métodos HTTP ====================

  async get<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>)}`
      : '';

    return this.request<T>(`${endpoint}${queryString}`);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== Autenticación ====================

  async login(email: string, password: string, rememberMe: boolean = true) {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/login', { email, password, rememberMe });

    this.setTokens(response.access_token, response.refresh_token, rememberMe);
    console.log('[ApiClient] Login successful (rememberMe:', rememberMe, ')');
    return response;
  }

  async register(userData: any) {
    return this.post('/auth/register', userData);
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
      console.log('[ApiClient] Logout API call successful');
    } catch (error) {
      console.warn('[ApiClient] Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    if (!this.isAuthenticated()) return null;

    try {
      return await this.get<AdminUser>('/users/profile/me');
    } catch (error) {
      console.error('[ApiClient] Failed to get current user:', error);
      return null;
    }
  }

  // ==================== Usuarios ====================

  async getUser(id: string): Promise<UserProfile> {
    return this.get<UserProfile>(`/users/${id}`);
  }

  async getUsers(filters?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.get<User[]>(`/users${queryString}`);
  }

  async createAdminUser(data: CreateAdminUserDto): Promise<AdminUser> {
    return this.post<AdminUser>('/users/admin', data);
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return this.get<AdminUser[]>('/users/role/admin');
  }

  async getUserStats(): Promise<any> {
    return this.get<any>('/users/stats/overview');
  }

  async createUser(data: any): Promise<AdminUser> {
    return this.post<AdminUser>('/users', data);
  }

  // ==================== Status ====================

  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  getUserRole(): string | null {
    if (!this.accessToken) return null;

    try {
      const { role } = jwtDecode<TokenPayload>(this.accessToken);
      return role;
    } catch {
      return null;
    }
  }

  getUserPayload(): TokenPayload | null {
    if (!this.accessToken) return null;

    try {
      return jwtDecode<TokenPayload>(this.accessToken);
    } catch {
      return null;
    }
  }

  // ==================== Interceptores ====================

  private requestInterceptors: ((config: RequestInit) => RequestInit)[] = [];
  private responseInterceptors: ((response: Response) => Response)[] = [];
  private errorInterceptors: ((error: ApiError) => void)[] = [];

  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: ApiError) => void): void {
    this.errorInterceptors.push(interceptor);
  }
}

// Singleton: Instancia única en toda la aplicación
export const apiClient = new ApiClient();