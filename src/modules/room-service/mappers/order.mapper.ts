import type { OrderStatus } from '@/shared/constants/statuses';

import type { OrderDTO, OrderItemDTO, OrderStatusDTO } from '../dtos/order.dto';
import type { OrderItem, OrderModel } from '../models/order.model';

const ORDER_STATUS_FROM_DTO: Record<OrderStatusDTO, OrderStatus> = {
  pending: 'pending',
  accepted: 'accepted',
  preparing: 'preparing',
  ready: 'ready',
  on_the_way: 'onTheWay',
  delivered: 'delivered',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

const ORDER_STATUS_TO_DTO: Record<OrderStatus, OrderStatusDTO> = {
  pending: 'pending',
  accepted: 'accepted',
  preparing: 'preparing',
  ready: 'ready',
  onTheWay: 'on_the_way',
  delivered: 'delivered',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

export function mapOrderStatusDTOToModel(status: OrderStatusDTO): OrderStatus {
  return ORDER_STATUS_FROM_DTO[status];
}

/** Para el body de `POST /orders/{orderId}/status` y el filtro `?status=`. */
export function mapOrderStatusToDTO(status: OrderStatus): OrderStatusDTO {
  return ORDER_STATUS_TO_DTO[status];
}

function mapOrderItemDTOToModel(dto: OrderItemDTO): OrderItem {
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName,
    quantity: dto.quantity,
    unitPriceCents: dto.unitPriceCents,
    lineTotalCents: dto.lineTotalCents,
  };
}

export function mapOrderDTOToModel(dto: OrderDTO): OrderModel {
  const items = dto.items.map(mapOrderItemDTOToModel);

  return {
    id: dto.id,
    bookingId: dto.bookingId,
    roomId: dto.roomId ?? null,
    roomNumber: dto.roomNumber ?? null,
    guestId: dto.guestId ?? null,
    guestName: dto.guestName ?? null,
    status: mapOrderStatusDTOToModel(dto.status),
    notes: dto.notes ?? null,
    currency: dto.currency,
    totalCents: dto.totalCents,
    items,
    itemsCount: items.reduce((count, item) => count + item.quantity, 0),
    chargeId: dto.chargeId ?? null,
    requestedAt: new Date(dto.requestedAt),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
