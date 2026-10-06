import { getSecureItem, removeSecureItem, setSecureItem } from './secure-storage';

/**
 * Tokens de autenticación contra la API real.
 * Se almacenan en el almacenamiento seguro del dispositivo (`expo-secure-store`).
 */
const ACCESS_TOKEN_KEY = 'pms.accessToken';
const REFRESH_TOKEN_KEY = 'pms.refreshToken';

export async function getAuthToken(): Promise<string | null> {
  const token = await getSecureItem(ACCESS_TOKEN_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export async function setAuthToken(token: string): Promise<void> {
  await setSecureItem(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  const token = await getSecureItem(REFRESH_TOKEN_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export async function setRefreshToken(token: string): Promise<void> {
  await setSecureItem(REFRESH_TOKEN_KEY, token);
}

export async function setAuthTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await setSecureItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearAuthTokens(): Promise<void> {
  await removeSecureItem(ACCESS_TOKEN_KEY);
  await removeSecureItem(REFRESH_TOKEN_KEY);
}

/** Compatibilidad con código previo */
export const clearAuthToken = clearAuthTokens;
