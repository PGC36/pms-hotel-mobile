import type { OrderStatus } from '@/shared/constants/statuses';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderModel {
  id: string;
  roomId: string;
  guestId: string;
  items: OrderItem[];
  status: OrderStatus;
  rejectionReason: string | null;
  notes: string | null;
  subtotal: number;
  tax: number;
  total: number;
  chargedToRoom: boolean;
  /** Calculado: suma de las cantidades de `items`. */
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt: Date | null;
}
