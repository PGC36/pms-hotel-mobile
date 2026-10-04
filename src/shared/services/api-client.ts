import { getAuthToken } from './auth-token';
import { createHttpClient, type HttpClient } from './http-client';

/** La API no está configurada: falta `EXPO_PUBLIC_API_BASE_URL` (ver `.env.example`). */
export class ApiConfigError extends Error {
  constructor() {
    super('La URL del servidor no está configurada (EXPO_PUBLIC_API_BASE_URL).');
    this.name = 'ApiConfigError';
  }
}

/**
 * Expo solo reemplaza `process.env.EXPO_PUBLIC_*` cuando se accede con esta
 * forma literal; no desestructurar ni usar `process.env[nombre]`.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

/** Sin base URL, cada llamada falla con `ApiConfigError` en vez de pedir "undefined/...". */
function createUnconfiguredClient(): HttpClient {
  const fail = <T>(): Promise<T> => Promise.reject(new ApiConfigError());
  return { get: fail, post: fail, put: fail, patch: fail, delete: fail };
}

/** Instancia compartida para la API real. Los servicios de módulo solo importan esto. */
export const apiClient: HttpClient = API_BASE_URL
  ? createHttpClient({ baseUrl: API_BASE_URL, getAuthToken })
  : createUnconfiguredClient();
