import { ApiConfigError } from '@/shared/services/api-client';
import { HttpError } from '@/shared/services/http-client';

/**
 * Errores del servicio de Conserjería (MOV-11), mismo patrón que
 * `RoomServiceServiceError` (MOV-10): la pantalla recibe un `kind` y un
 * mensaje en español apto para mostrar, nunca un `HttpError` ni el texto
 * crudo del backend.
 */
export type ConciergeRequestErrorKind =
  | 'config'
  | 'invalidInput'
  | 'invalidTransition'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'network'
  | 'server'
  | 'unknown';

const ERROR_MESSAGES: Record<ConciergeRequestErrorKind, string> = {
  config: 'La URL del servidor no está configurada.',
  invalidInput: 'Revisa los datos ingresados.',
  invalidTransition: 'La solicitud cambió de estado. Recarga para ver su estado actual.',
  validation: 'El servidor rechazó la operación. Revisa los datos e intenta de nuevo.',
  unauthorized: 'No hay una sesión autorizada con el servidor.',
  forbidden: 'No tienes permiso para realizar esta operación.',
  notFound: 'La solicitud no existe.',
  network: 'No se pudo conectar con el servidor.',
  server: 'El servidor tuvo un problema. Intenta de nuevo en unos minutos.',
  unknown: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

export class ConciergeRequestServiceError extends Error {
  constructor(
    public readonly kind: ConciergeRequestErrorKind,
    /** Código HTTP, si el error vino de una respuesta del servidor. */
    public readonly status?: number,
    /** Solo para validaciones locales (`invalidInput`): texto específico en español. */
    message?: string,
  ) {
    super(message ?? ERROR_MESSAGES[kind]);
    this.name = 'ConciergeRequestServiceError';
  }
}

function getBackendMessage(error: HttpError): string {
  const data = error.data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return '';
}

/**
 * 400 que significan "la solicitud ya no está donde la pantalla cree"
 * (`ConciergeRequestServiceImpl`): conviene recargar en vez de corregir datos.
 */
const STALE_STATE = /status transition|is already|only pending concierge requests/i;

function getErrorKind(error: unknown): ConciergeRequestErrorKind {
  if (error instanceof ApiConfigError) return 'config';
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return STALE_STATE.test(getBackendMessage(error)) ? 'invalidTransition' : 'validation';
    }
    if (error.status === 401) return 'unauthorized';
    if (error.status === 403) return 'forbidden';
    if (error.status === 404) return 'notFound';
    if (error.status >= 500) return 'server';
    return 'unknown';
  }
  // `fetch` rechaza con TypeError cuando no hay conexión o el host no responde.
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

/** Solo la llamada HTTP se traduce; un fallo del mapper no debe disfrazarse de error de red. */
export async function callConciergeApi<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new ConciergeRequestServiceError(
      getErrorKind(error),
      error instanceof HttpError ? error.status : undefined,
    );
  }
}
