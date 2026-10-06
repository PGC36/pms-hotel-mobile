import { apiClient } from '@/shared/services/api-client';

import type { AuthResponseDTO, LoginRequestDTO, RefreshTokenRequestDTO } from '../dtos/auth.dto';
import type { GuestLoginRequestDTO, GuestLoginResponseDTO } from '../dtos/guest-auth.dto';
import type { UserModel } from '../models/user.model';
import { decodeJwtPayload, extractStaffRoleFromAuthorities } from '../utils/jwt';
import { AuthServiceError, callAuthApi } from './auth-error';
import { callGuestAuthApi } from './guest-auth-error';

/**
 * Autentica al personal contra la API real (`POST /auth/login`).
 * Devuelve el usuario reconstruido a partir de los datos y el token del backend.
 */
export async function loginStaff(
  email: string,
  password: string,
): Promise<{ user: UserModel; accessToken: string; refreshToken: string }> {
  const payload: LoginRequestDTO = {
    email: email.trim(),
    password,
  };

  const response = await callAuthApi(() =>
    apiClient.post<AuthResponseDTO>('/auth/login', payload),
  );

  const user = buildStaffUserFromToken(response.accessToken, email.trim());
  return {
    user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  };
}

/**
 * Renueva el token de acceso usando el token de rotación (`POST /auth/refresh`).
 */
export async function refreshStaffToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const payload: RefreshTokenRequestDTO = {
    refreshToken,
  };

  const response = await callAuthApi(() =>
    apiClient.post<AuthResponseDTO>('/auth/refresh', payload),
  );

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  };
}

/**
 * Cierra la sesión en el servidor revocando el refresh token (`POST /auth/logout`).
 */
export async function logoutStaff(refreshToken: string): Promise<void> {
  const payload: RefreshTokenRequestDTO = {
    refreshToken,
  };

  await callAuthApi(() => apiClient.post<void>('/auth/logout', payload));
}

/**
 * Construye el UserModel a partir del token JWT y el email.
 */
export function buildStaffUserFromToken(token: string, fallbackEmail?: string): UserModel {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    throw new AuthServiceError('unauthorized', 401, 'Token de sesión inválido.');
  }

  if (payload.type !== 'staff') {
    throw new AuthServiceError('unauthorized', 401, 'Token de sesión inválido.');
  }

  const authorities = payload.authorities ?? [];
  const role = extractStaffRoleFromAuthorities(authorities);
  if (!role) {
    throw new AuthServiceError('unsupportedRole', 403);
  }

  const email = payload.sub ?? fallbackEmail ?? '';
  // Construye un nombre legible a partir del email si no viene explícito
  const namePart = email.split('@')[0] ?? 'Personal';
  const formattedName = namePart
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: email,
    fullName: formattedName || 'Personal',
    email,
    phone: '',
    role,
    isActive: true,
    avatarUrl: null,
    createdAt: new Date(),
  };
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
