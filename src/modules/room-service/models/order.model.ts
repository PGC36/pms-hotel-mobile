import type { OrderStatus } from '@/shared/constants/statuses';
import type { Currency } from '@/shared/utils/formatters';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderModel {
  id: string;
  bookingId: string;
  roomId: string;
  guestId?: string;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  currency: Currency;
  chargeId?: string;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  chargedToRoom: boolean;
  /** Calculado: suma de las cantidades de `items`. */
  itemsCount: number;
  deliveredAt?: Date;
}
