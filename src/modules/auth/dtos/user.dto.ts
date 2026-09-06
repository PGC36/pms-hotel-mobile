import type { StaffRole } from '@/shared/constants/roles';

/**
 * Forma cruda de un usuario de personal, tal como la devolvería
 * `POST /auth/login` o `GET /users/:id`. `password` simula el valor que el
 * backend usaría para validar credenciales (en una API real sería un hash,
 * nunca el texto plano); el Mapper lo descarta y nunca llega al Model.
 */
export interface UserDTO {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  password: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}
