'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { authManager } from '@/lib/auth-manager';
import { UserRole } from '@/app/types/index';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getUserRole: () => string | null;
  resetPassword: (email: string) => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Propiedades derivadas
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  /**
   * Efecto 1: Verificar autenticación al montar
   * Se ejecuta una sola vez
   * 
   * Importante: Reinitializar tokens primero por si la app se reinició (F5)
   */
  useEffect(() => {
    // Reinitializar tokens desde localStorage después de SSR
    apiClient.reinitializeTokens();

    // Luego verificar autenticación
    checkAuth();
  }, []);

  /**
   * Efecto 2: Escuchar eventos de sesión expirada
   * Cuando la sesión expira, limpia el user local
   */
  useEffect(() => {
    const unsubscribe = authManager.onSessionExpired(() => {
      // Limpiar estado local cuando la sesión expira
      setUser(null);
      console.log('[AuthProvider] Session expired - User cleared');
    });

    // Cleanup: Desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Verifica si el usuario está autenticado
   * Si está autenticado, obtiene los datos del usuario
   */
  const checkAuth = async () => {
    try {
      // Verificar si tenemos token válido
      if (!apiClient.isAuthenticated()) {
        console.log('[AuthProvider] No valid token found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Intentar obtener usuario actual
      console.log('[AuthProvider] Checking authentication...');
      const userData = await apiClient.getCurrentUser();

      if (userData) {
        setUser(userData as User);
        console.log('[AuthProvider] Auth check passed - User loaded:', userData.email);
      } else {
        setUser(null);
        console.log('[AuthProvider] Auth check: No user data returned');
      }
    } catch (error) {
      console.error('[AuthProvider] Auth check failed:', error);
      setUser(null);
      // No limpiar tokens aquí - dejar que sea manejado por AuthManager
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login: Autentica el usuario y carga sus datos
   */
  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password, rememberMe);
      setUser(response.user);
      console.log('[AuthProvider] Login successful:', response.user.email);
    } catch (error) {
      console.error('[AuthProvider] Login failed:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register: Registra un nuevo usuario
   */
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      await apiClient.register(userData);
      console.log('[AuthProvider] Registration successful');
    } catch (error) {
      console.error('[AuthProvider] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout: Cierra la sesión del usuario
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      console.log('[AuthProvider] Logout successful');

      // Redirigir a login
      router.push('/login');
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
      // Aún así, limpiar estado local y redirigir
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset Password: Envía email de reset
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      console.log('[AuthProvider] Reset password email sent');
    } catch (error) {
      console.error('[AuthProvider] Reset password failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Contexto value
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    getUserRole: apiClient.getUserRole,
    resetPassword,
    isSuperAdmin,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};