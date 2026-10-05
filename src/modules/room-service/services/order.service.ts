import { canTransitionOrder } from '@/modules/tasks/services/task-transition.service';
import type { OrderStatus } from '@/shared/constants/statuses';
import { apiClient } from '@/shared/services/api-client';

import type { OrderDTO, OrderStatusDTO } from '../dtos/order.dto';
import { mapOrderDTOToModel, mapOrderStatusToDTO } from '../mappers/order.mapper';
import {
  buildRejectionNotes,
  isTerminalOrderStatus,
  ORDER_NOTES_MAX_LENGTH,
  type OrderModel,
} from '../models/order.model';
import { callRoomServiceApi, RoomServiceServiceError } from './room-service-error';

/**
 * Pedidos de Room Service contra la API real (`RoomServiceController`,
 * MOV-10). El backend es la autoridad sobre las transiciones y hace todo lo
 * que tiene efectos: descuenta inventario al aceptar, lo devuelve al cancelar
 * y registra el cargo en el folio al entregar (`chargeId`). Este servicio
 * solo pide la transición y devuelve el pedido tal como responde el backend;
 * no calcula montos, existencias ni cargos.
 */

export interface OrderFilters {
  status?: OrderStatus;
  bookingId?: string;
}

function orderPath(id: string): string {
  return `/room-service/orders/${encodeURIComponent(id)}`;
}

/** Del más reciente al más antiguo (orden del backend). */
export async function getOrders(filters: OrderFilters = {}): Promise<OrderModel[]> {
  const params = new URLSearchParams();
  if (filters.bookingId) params.set('bookingId', filters.bookingId);
  if (filters.status) params.set('status', mapOrderStatusToDTO(filters.status));
  const query = params.toString();

  const orders = await callRoomServiceApi(() =>
    apiClient.get<OrderDTO[] | undefined>(`/room-service/orders${query ? `?${query}` : ''}`),
  );
  return (orders ?? []).map(mapOrderDTOToModel);
}

/** `null` si el pedido no existe (404). */
export async function getOrderById(id: string): Promise<OrderModel | null> {
  try {
    const order = await callRoomServiceApi(() =>
      apiClient.get<OrderDTO | undefined>(orderPath(id)),
    );
    return order ? mapOrderDTOToModel(order) : null;
  } catch (error) {
    if (error instanceof RoomServiceServiceError && error.kind === 'notFound') return null;
    throw error;
  }
}

export interface UpdateOrderStatusOptions {
  /** Observaciones a guardar junto con la transición. Si se omite, el backend conserva las actuales. */
  notes?: string;
  /** Obligatorio cuando `nextStatus` es `rejected`. Se agrega a las observaciones (ver `buildRejectionNotes`). */
  rejectionReason?: string;
}

interface UpdateOrderStatusBody {
  status: OrderStatusDTO;
  notes?: string;
}

/** El backend recorta las notas antes de validar `@Size(max = 1000)`. */
function assertNotesLength(notes: string): void {
  if (notes.trim().length > ORDER_NOTES_MAX_LENGTH) {
    throw new RoomServiceServiceError(
      'invalidInput',
      undefined,
      `Las observaciones no pueden superar ${ORDER_NOTES_MAX_LENGTH} caracteres.`,
    );
  }
}

/**
 * `POST /room-service/orders/{orderId}/status`. Recibe el pedido tal como lo
 * conoce la pantalla para no ofrecer transiciones obviamente inválidas
 * (`ORDER_STATUS_TRANSITIONS`) ni perder sus observaciones al rechazar; si el
 * pedido cambió en el servidor, el backend rechaza la transición (400).
 */
export async function updateOrderStatus(
  order: OrderModel,
  nextStatus: OrderStatus,
  options: UpdateOrderStatusOptions = {},
): Promise<OrderModel> {
  if (!canTransitionOrder(order.status, nextStatus)) {
    throw new RoomServiceServiceError('invalidTransition');
  }

  let notes = options.notes;
  if (nextStatus === 'rejected') {
    const reason = options.rejectionReason?.trim() ?? '';
    if (!reason) {
      throw new RoomServiceServiceError(
        'invalidInput',
        undefined,
        'Escribe el motivo del rechazo.',
      );
    }
    notes = buildRejectionNotes(options.notes ?? order.notes, reason);
  }

  if (notes !== undefined) assertNotesLength(notes);

  const body: UpdateOrderStatusBody = { status: mapOrderStatusToDTO(nextStatus) };
  if (notes !== undefined) body.notes = notes;

  const updated = await callRoomServiceApi(() =>
    apiClient.post<OrderDTO | undefined>(`${orderPath(order.id)}/status`, body),
  );
  if (updated) return mapOrderDTOToModel(updated);

  // El backend responde con el pedido; si algún día respondiera sin cuerpo,
  // se pide el detalle para no devolver un estado viejo.
  const fresh = await getOrderById(order.id);
  if (!fresh) throw new RoomServiceServiceError('notFound', 404);
  return fresh;
}

/**
 * `PATCH /room-service/orders/{orderId}/notes` (HU-11). Reemplaza por completo
 * las observaciones con `notes`, tal como llega: un texto vacío las borra, así
 * que la pantalla debe confirmarlo antes. No cambia el estado. Un pedido
 * terminal conserva sus notas (p. ej. el motivo de rechazo) y no se envía.
 */
export async function updateOrderNotes(order: OrderModel, notes: string): Promise<OrderModel> {
  if (isTerminalOrderStatus(order.status)) {
    throw new RoomServiceServiceError(
      'invalidInput',
      undefined,
      'Un pedido cerrado no admite cambios en sus observaciones.',
    );
  }
  assertNotesLength(notes);

  const updated = await callRoomServiceApi(() =>
    apiClient.patch<OrderDTO | undefined>(`${orderPath(order.id)}/notes`, { notes }),
  );
  if (updated) return mapOrderDTOToModel(updated);

  const fresh = await getOrderById(order.id);
  if (!fresh) throw new RoomServiceServiceError('notFound', 404);
  return fresh;
}
