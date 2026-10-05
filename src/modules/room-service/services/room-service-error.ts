import { ApiConfigError } from '@/shared/services/api-client';
import { HttpError } from '@/shared/services/http-client';

/**
 * Errores de los servicios de Room Service (MOV-10), mismo patrón que
 * `HousekeepingServiceError` (MOV-09): la pantalla recibe un `kind` y un
 * mensaje en español apto para mostrar, nunca un `HttpError` ni el texto
 * crudo del backend.
 *
 * Los 400/404 de `POST /orders/{orderId}/status` agrupan causas muy distintas
 * (stock, folio, transición). El servicio las distingue por el `message` del
 * backend (`ApiErrorResponse`) solo para elegir un texto útil; si el texto
 * cambia, cae en el mensaje genérico de su código.
 */
export type RoomServiceErrorKind =
  | 'config'
  | 'invalidInput'
  | 'invalidTransition'
  | 'insufficientStock'
  | 'inventoryUnavailable'
  | 'folioUnavailable'
  | 'zeroTotal'
  | 'rejected'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'network'
  | 'unknown';

const ERROR_MESSAGES: Record<RoomServiceErrorKind, string> = {
  config: 'La URL del servidor no está configurada.',
  invalidInput: 'Revisa los datos ingresados.',
  invalidTransition: 'El pedido cambió de estado. Recarga para ver su estado actual.',
  insufficientStock: 'No hay existencias suficientes para aceptar este pedido.',
  inventoryUnavailable:
    'Un producto del pedido no tiene inventario disponible configurado. Avisa a administración.',
  folioUnavailable:
    'No se pudo entregar: la cuenta del huésped no está abierta. El pedido sigue en camino.',
  zeroTotal: 'Un pedido con total cero no puede entregarse.',
  rejected: 'El servidor rechazó la operación. Recarga e intenta de nuevo.',
  unauthorized: 'No hay una sesión autorizada con el servidor.',
  forbidden: 'No tienes permiso para realizar esta operación.',
  notFound: 'El pedido no existe.',
  network: 'No se pudo conectar con el servidor.',
  unknown: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.',
};

export class RoomServiceServiceError extends Error {
  constructor(
    public readonly kind: RoomServiceErrorKind,
    /** Código HTTP, si el error vino de una respuesta del servidor. */
    public readonly status?: number,
    /** Solo para validaciones locales (`invalidInput`): texto específico en español. */
    message?: string,
  ) {
    super(message ?? ERROR_MESSAGES[kind]);
    this.name = 'RoomServiceServiceError';
  }
}

function getBackendMessage(error: HttpError): string {
  const data = error.data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return '';
}

/** Causas de 400 que la API documenta en `RoomServiceOrderServiceImpl` / `RoomServiceOrderInventory`. */
const BAD_REQUEST_REASONS: [RegExp, RoomServiceErrorKind][] = [
  [/^Insufficient stock/i, 'insufficientStock'],
  [/inventory item/i, 'inventoryUnavailable'],
  [/guest account|financial movements/i, 'folioUnavailable'],
  [/total must be greater than zero/i, 'zeroTotal'],
  [/status transition|status is terminal|order is already/i, 'invalidTransition'],
];

function getErrorKind(error: unknown): RoomServiceErrorKind {
  if (error instanceof ApiConfigError) return 'config';
  if (error instanceof HttpError) {
    const message = getBackendMessage(error);
    if (error.status === 400) {
      return BAD_REQUEST_REASONS.find(([pattern]) => pattern.test(message))?.[1] ?? 'rejected';
    }
    if (error.status === 401) return 'unauthorized';
    if (error.status === 403) return 'forbidden';
    // Al entregar, un 404 también puede significar que la reserva no tiene folio.
    if (error.status === 404)
      return /guest account/i.test(message) ? 'folioUnavailable' : 'notFound';
    return 'unknown';
  }
  // `fetch` rechaza con TypeError cuando no hay conexión o el host no responde.
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

/** Solo la llamada HTTP se traduce; un fallo del mapper no debe disfrazarse de error de red. */
export async function callRoomServiceApi<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new RoomServiceServiceError(
      getErrorKind(error),
      error instanceof HttpError ? error.status : undefined,
    );
  }
}
