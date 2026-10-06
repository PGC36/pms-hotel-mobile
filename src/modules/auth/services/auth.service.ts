import { apiClient } from '@/shared/services/api-client';

import type { GuestLoginRequestDTO, GuestLoginResponseDTO } from '../dtos/guest-auth.dto';
import type { UserModel } from '../models/user.model';
import { callGuestAuthApi } from './guest-auth-error';
import { buildStaffUserFromToken, createStaffAuthApi } from './staff-auth-api';

const staffAuthApi = createStaffAuthApi((path, body) => apiClient.post(path, body));
export { buildStaffUserFromToken };

/**
 * Autentica al personal contra la API real (`POST /auth/login`).
 * Devuelve el usuario reconstruido a partir de los datos y el token del backend.
 */
export async function loginStaff(
  email: string,
  password: string,
): Promise<{ user: UserModel; accessToken: string; refreshToken: string }> {
  return staffAuthApi.loginStaff(email, password);
}

/**
 * Renueva el token de acceso usando el token de rotación (`POST /auth/refresh`).
 */
export async function refreshStaffToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  return staffAuthApi.refreshStaffToken(refreshToken);
}

/**
 * Cierra la sesión en el servidor revocando el refresh token (`POST /auth/logout`).
 */
export async function logoutStaff(refreshToken: string): Promise<void> {
  await staffAuthApi.logoutStaff(refreshToken);
}

/**
 * Login de huésped contra la API real (`POST /guest/auth/login`).
 * Devuelve el token emitido por el backend.
 */
export async function loginGuest(email: string, password: string): Promise<string> {
  const payload: GuestLoginRequestDTO = {
    email: email.trim(),
    password,
  };

  const response = await callGuestAuthApi(() =>
    apiClient.post<GuestLoginResponseDTO>('/guest/auth/login', payload),
  );

  return response.accessToken;
}
