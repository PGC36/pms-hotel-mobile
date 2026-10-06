import { apiClient } from '@/shared/services/api-client';
import type { OrderDTO } from '@/modules/room-service/dtos/order.dto';
import type { ProductDTO, ProductCategoryDTO } from '@/modules/room-service/dtos/product.dto';
import { mapOrderDTOToModel } from '@/modules/room-service/mappers/order.mapper';
import { mapProductDTOToModel } from '@/modules/room-service/mappers/product.mapper';
import type { OrderModel } from '@/modules/room-service/models/order.model';
import type { ProductModel } from '@/modules/room-service/models/product.model';
import { ORDER_STATUS_TRANSITIONS } from '@/shared/constants/statuses';
import { RoomServiceServiceError, callRoomServiceApi } from '@/modules/room-service/services/room-service-error';

export async function getGuestProducts(category?: ProductCategoryDTO): Promise<ProductModel[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const products = await callRoomServiceApi(() =>
    apiClient.get<ProductDTO[]>(`/guest/room-service/products${query}`),
  );
  return products.map(mapProductDTOToModel);
}

export async function getGuestOrders(): Promise<OrderModel[]> {
  const orders = await callRoomServiceApi(() => apiClient.get<OrderDTO[]>('/guest/room-service/orders'));
  return orders.map(mapOrderDTOToModel);
}

export async function getGuestOrder(id: string): Promise<OrderModel> {
  const order = await callRoomServiceApi(() =>
    apiClient.get<OrderDTO>(`/guest/room-service/orders/${encodeURIComponent(id)}`),
  );
  return mapOrderDTOToModel(order);
}

export async function createGuestOrder(
  items: { productId: string; quantity: number }[],
  notes: string,
): Promise<OrderModel> {
  if (!items.length) throw new RoomServiceServiceError('invalidInput', undefined, 'Agrega al menos un producto.');
  const body = { items, notes: notes.trim() || null };
  const order = await callRoomServiceApi(() =>
    apiClient.post<OrderDTO>('/guest/room-service/orders', body),
  );
  return mapOrderDTOToModel(order);
}

export function canGuestCancelOrder(status: OrderModel['status']): boolean {
  return ORDER_STATUS_TRANSITIONS[status].includes('cancelled');
}

export async function cancelGuestOrder(order: OrderModel): Promise<OrderModel> {
  if (!canGuestCancelOrder(order.status)) {
    throw new RoomServiceServiceError('invalidTransition');
  }
  const cancelled = await callRoomServiceApi(() =>
    apiClient.post<OrderDTO>(
      `/guest/room-service/orders/${encodeURIComponent(order.id)}/cancel`,
    ),
  );
  return mapOrderDTOToModel(cancelled);
}
