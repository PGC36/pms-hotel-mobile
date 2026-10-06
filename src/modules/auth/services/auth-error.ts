import { ApiConfigError } from '@/shared/services/api-client';
import { HttpError } from '@/shared/services/http-client';

export type AuthErrorKind =
  | 'config'
  | 'invalidCredentials'
  | 'unauthorized'
  | 'forbidden'
  | 'unsupportedRole'
  | 'network'
  | 'unknown';

const ERROR_MESSAGES: Record<AuthErrorKind, string> = {
  config: 'La URL del servidor no está configurada.',
  invalidCredentials: 'Correo o contraseña incorrectos.',
  unauthorized: 'Tu sesión no es válida o ha expirado. Por favor, inicia sesión nuevamente.',
  forbidden: 'No tienes permiso para acceder a esta aplicación.',
  unsupportedRole: 'Tu rol no tiene acceso a la aplicación móvil.',
  network: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.',
  unknown: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.',
};

export class AuthServiceError extends Error {
  constructor(
    public readonly kind: AuthErrorKind,
    public readonly status?: number,
    message?: string,
  ) {
    super(message ?? ERROR_MESSAGES[kind]);
    this.name = 'AuthServiceError';
  }
}

function getBackendMessage(error: HttpError): string {
  const data = error.data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return '';
}

function getErrorKind(error: unknown): AuthErrorKind {
  if (error instanceof ApiConfigError) return 'config';
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return 'invalidCredentials';
    }
    if (error.status === 403) return 'forbidden';
    const message = getBackendMessage(error);
    if (error.status === 400 && /invalid email or password/i.test(message)) {
      return 'invalidCredentials';
    }
    return 'unknown';
  }
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

export async function callAuthApi<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new AuthServiceError(
      getErrorKind(error),
      error instanceof HttpError ? error.status : undefined,
    );
  }
}
