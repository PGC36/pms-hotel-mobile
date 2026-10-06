import type { AuthResponseDTO, LoginRequestDTO, RefreshTokenRequestDTO } from '../dtos/auth.dto';
import type { UserModel } from '../models/user.model';
import { decodeJwtPayload, extractStaffRoleFromAuthorities } from '../utils/jwt';
import { AuthServiceError, callAuthApi } from './auth-error';

type AuthPost = <T>(path: string, body?: unknown) => Promise<T>;

export function buildStaffUserFromToken(token: string, fallbackEmail?: string): UserModel {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.type !== 'staff') {
    throw new AuthServiceError('unauthorized', 401, 'Token de sesión inválido.');
  }

  const role = extractStaffRoleFromAuthorities(payload.authorities ?? []);
  if (!role) throw new AuthServiceError('unsupportedRole', 403);

  const email = payload.sub ?? fallbackEmail ?? '';
  const namePart = email.split('@')[0] ?? 'Personal';
  const formattedName = namePart
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

export function createStaffAuthApi(post: AuthPost) {
  return {
    async loginStaff(
      email: string,
      password: string,
    ): Promise<{ user: UserModel; accessToken: string; refreshToken: string }> {
      const payload: LoginRequestDTO = { email: email.trim(), password };
      const response = await callAuthApi(() => post<AuthResponseDTO>('/auth/login', payload));
      return {
        user: buildStaffUserFromToken(response.accessToken, email.trim()),
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    },

    async refreshStaffToken(
      refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
      const payload: RefreshTokenRequestDTO = { refreshToken };
      const response = await callAuthApi(() => post<AuthResponseDTO>('/auth/refresh', payload));
      return { accessToken: response.accessToken, refreshToken: response.refreshToken };
    },

    async logoutStaff(refreshToken: string): Promise<void> {
      const payload: RefreshTokenRequestDTO = { refreshToken };
      await callAuthApi(() => post<void>('/auth/logout', payload));
    },
  };
}
