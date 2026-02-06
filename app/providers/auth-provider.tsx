"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/app/types/index';  // ← Importar tipos

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  getUserRole: () => string | null
  resetPassword: (email: string) => Promise<void>
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

interface CreateAdminUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  generatePassword?: boolean;
  avatarUrl?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password)
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      await apiClient.register(userData)
      // TODO: Después de registro, hacer login automático o redirigir a login. 
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiClient.logout()
      setUser(null)
      window.location.href = '/login'
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      await (email)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}