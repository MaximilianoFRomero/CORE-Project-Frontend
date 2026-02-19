'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { authManager } from '@/lib/auth-manager';
import { UserRole } from '@/app/types/index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  useEffect(() => {
    apiClient.reinitializeTokens();

    checkAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = authManager.onSessionExpired(() => {
      setUser(null);
      setShowSessionExpiredDialog(true);
      console.log('[AuthProvider] Session expired - User cleared and notification shown');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSessionLost = useCallback(() => {
    if (!user) return;
    
    toast.error('Session lost, please login again');
    setUser(null);
    apiClient.clearTokens();
    router.push('/login');
  }, [user, router]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        if (!apiClient.isAuthenticated()) {
          console.log('[AuthProvider] Session lost on visibility change');
          handleSessionLost();
        }
      }
    };

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && user) {
        if (!apiClient.isAuthenticated()) {
          console.log('[AuthProvider] Session lost on interval check');
          handleSessionLost();
        }
      }
    }, 60000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user, handleSessionLost]);

  const checkAuth = async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('[AuthProvider] No valid token found');
        setUser(null);
        setIsLoading(false);
        return;
      }

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
    } finally {
      setIsLoading(false);
    }
  };

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

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      console.log('[AuthProvider] Logout successful');

      router.push('/login');
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCloseSessionExpiredDialog = () => {
    setShowSessionExpiredDialog(false);
    router.push('/login');
  };

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

      <Dialog open={showSessionExpiredDialog} onOpenChange={handleCloseSessionExpiredDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sesión expirada</DialogTitle>
            <DialogDescription>
              Su sesión ha expirado por inactividad o seguridad. Por favor, vuelva a iniciar sesión para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={handleCloseSessionExpiredDialog}>Aceptar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};