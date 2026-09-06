import type { StaffRole } from '@/shared/constants/roles';

/** Forma de dominio de un usuario de personal. Nunca incluye credenciales. */
export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: Date;
}
