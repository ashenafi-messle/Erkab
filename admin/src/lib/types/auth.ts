export type AdminRole = 'SUPER_ADMIN' | 'SUB_ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  permissions?: string[];
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AdminUser;
  token?: string;
}

export interface ApiEnvelope<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}
