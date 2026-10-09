import { ApiConfigError } from '@/shared/services/api-config-error';
import { HttpError } from '@/shared/services/http-client';

export type GuestAuthErrorKind =
  | 'config'
  | 'invalidCredentials'
  | 'noActiveStay'
  | 'stayNotActive'
  | 'unauthorized'
  | 'forbidden'
  | 'network'
  | 'unknown';

const ERROR_MESSAGES: Record<GuestAuthErrorKind, string> = {
  config: 'La URL del servidor no está configurada.',
  invalidCredentials: 'Correo o contraseña incorrectos.',
  noActiveStay: 'El huésped no cuenta con una estadía activa registrada.',
  stayNotActive: 'La estadía del huésped no está activa o ha expirado.',
  unauthorized: 'Tu sesión no es válida o ha expirado. Por favor, inicia sesión nuevamente.',
  forbidden: 'No tienes permiso para acceder a esta información.',
  network: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.',
  unknown: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.',
};

export class GuestAuthServiceError extends Error {
  constructor(
    public readonly kind: GuestAuthErrorKind,
    public readonly status?: number,
    message?: string,
  ) {
    super(message ?? ERROR_MESSAGES[kind]);
    this.name = 'GuestAuthServiceError';
  }
}

function getBackendMessage(error: HttpError): string {
  const data = error.data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return '';
}

function getErrorKind(error: unknown): GuestAuthErrorKind {
  if (error instanceof ApiConfigError) return 'config';
  if (error instanceof HttpError) {
    const message = getBackendMessage(error);
    if (error.status === 401) {
      return 'invalidCredentials';
    }
    if (error.status === 400) {
      if (/no active stay|no (?:tiene|cuenta con) .*estad[ií]a activa/i.test(message)) {
        return 'noActiveStay';
      }
      if (
        /expired or not yet active|estad[ií]a .*no est[aá] activa|ya venc[ií]o|todav[ií]a no ha comenzado/i.test(
          message,
        )
      ) {
        return 'stayNotActive';
      }
      return 'invalidCredentials';
    }
    if (error.status === 403) return 'forbidden';
    return 'unknown';
  }
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

export async function callGuestAuthApi<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new GuestAuthServiceError(
      getErrorKind(error),
      error instanceof HttpError ? error.status : undefined,
    );
  }
}
