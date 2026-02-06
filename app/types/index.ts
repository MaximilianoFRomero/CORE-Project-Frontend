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
  status?: UserStatus;           // ← Nueva propiedad
  createdAt?: string;            // ← Nueva propiedad
  updatedAt?: string;            // ← Nueva propiedad (opcional)
}

export interface AdminUser extends User {
  status: UserStatus;            // ← Ahora es requerida para AdminUser
  createdAt: string;             // ← Ahora es requerida para AdminUser
  updatedAt: string;             // ← Nueva propiedad
}

export interface CreateAdminUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  generatePassword?: boolean;
  avatarUrl?: string;
}