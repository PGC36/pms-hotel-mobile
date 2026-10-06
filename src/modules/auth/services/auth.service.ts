import { usersDB } from '@/data/db';
import { apiClient } from '@/shared/services/api-client';
import { delay } from '@/shared/services/delay';

import type { GuestLoginRequestDTO, GuestLoginResponseDTO } from '../dtos/guest-auth.dto';
import { mapUserDTOToModel } from '../mappers/user.mapper';
import type { UserModel } from '../models/user.model';
import { callGuestAuthApi } from './guest-auth-error';



export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos.');
    this.name = 'InvalidCredentialsError';
  }
}

/** Login de personal. La sesión (persistencia, tipo staff|guest) la gestiona `AuthContext` (MOV-06). */
export async function login(email: string, password: string): Promise<UserModel> {
  await delay();

  const match = usersDB.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  );

  if (!match || !match.is_active) {
    throw new InvalidCredentialsError();
  }

  return mapUserDTOToModel(match);
}

/** Usado para restaurar la sesión guardada al reabrir la app (MOV-06). */
export async function getUserById(id: string): Promise<UserModel | null> {
  await delay();

  const found = usersDB.find((user) => user.id === id);
  return found ? mapUserDTOToModel(found) : null;
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

