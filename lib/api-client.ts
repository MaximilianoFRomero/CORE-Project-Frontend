import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

interface ApiErrorData {
  message?: string;
  [key: string]: any;
}

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

export class ApiClient {
  private readonly baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.initializeTokens();
  }

  private initializeTokens(): void {
    if (typeof window === 'undefined') return;

    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<TokenPayload>(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string> {
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
          throw new ApiError('Failed to refresh token');
        }

        const data = await response.json();
        
        if (!data.access_token) {
          throw new ApiError('Invalid refresh response');
        }

        this.setTokens(
          data.access_token, 
          data.refresh_token || this.refreshToken!
        );

        return data.access_token;
      } catch (error) {
        this.clearTokens();
        throw error instanceof ApiError ? error : new ApiError('Refresh failed');
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

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
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && retry && this.refreshToken) {
        try {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryConfig = { ...config, headers };
            const retryResponse = await fetch(url, retryConfig);
            return this.handleResponse<T>(retryResponse);
          }
        } catch {
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new ApiError('Session expired', 401);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error', 0, { originalError: error });
    }
  }

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

  private async parseErrorResponse(response: Response): Promise<ApiErrorData> {
    try {
      return await response.json();
    } catch {
      return { message: `HTTP ${response.status}` };
    }
  }

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

  async login(email: string, password: string) {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/login', { email, password });
    
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async register(userData: any) {
    return this.post('/auth/register', userData);
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    
    try {
      return await this.get('/users/profile/me');
    } catch {
      return null;
    }
  }

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

export const apiClient = new ApiClient();