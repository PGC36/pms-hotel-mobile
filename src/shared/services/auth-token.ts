import { getStorageItem, removeStorageItem, setStorageItem } from './storage';

/**
 * Token de acceso para la API real. Único punto que sabe dónde vive: ningún
 * servicio de módulo lo lee directamente — lo inyecta `api-client.ts`.
 *
 * En MOV-09 nada llama todavía a `setAuthToken`/`clearAuthToken`: el login
 * de personal sigue siendo mock (MOV-06) y la autenticación real contra el
 * backend corresponde a otro ticket. Sin token, las peticiones salen sin
 * `Authorization`. Si más adelante el token debe guardarse cifrado
 * (`expo-secure-store`, architecture.md sección 7), el cambio queda aquí.
 */
const AUTH_TOKEN_STORAGE_KEY = 'pms.authToken';

export async function getAuthToken(): Promise<string | null> {
  const token = await getStorageItem(AUTH_TOKEN_STORAGE_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export async function setAuthToken(token: string): Promise<void> {
  await setStorageItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await removeStorageItem(AUTH_TOKEN_STORAGE_KEY);
}
