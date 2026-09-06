import { usersDB } from '@/data/db';
import { delay } from '@/shared/services/delay';

import { mapUserDTOToModel } from '../mappers/user.mapper';
import type { UserModel } from '../models/user.model';

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
