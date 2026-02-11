// src/app/types/index.ts
export type UserRole = 'user' | 'admin' | 'super_admin' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  status?: UserStatus;      // Opcional en User base
  createdAt?: string;       // Opcional en User base
  updatedAt?: string;       // Opcional en User base
}

export interface AdminUser extends User {
  status: UserStatus;       // Requerido
  createdAt: string;        // Requerido
  updatedAt: string;        // Requerido
}

// Perfil completo de usuario (lo que devuelve GET /users/:id)
export interface UserProfile extends AdminUser {
  lastLoginAt?: string | null;
  emailVerified: boolean;
  githubId?: string | null;
  googleId?: string | null;
  // Agrega aquí otras propiedades que devuelva el backend
}

export interface CreateAdminUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  generatePassword?: boolean;
  avatarUrl?: string;
}