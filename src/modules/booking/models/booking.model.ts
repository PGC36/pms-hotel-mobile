import type { BookingStatus } from '@/shared/constants/statuses';
import type { Currency } from '@/shared/utils/formatters';

export interface BookingModel {
  id: string;
  confirmationCode: string;
  guestLinkCode: string;
  guestId: string;
  roomId?: string;
  roomTypeId: string;
  rateId?: string;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  adults: number;
  children: number;
  totalAmountCents: number;
  currency: Currency;
  notes?: string;
  /** Calculado a partir de check-in/check-out; no viene del DTO. */
  nights: number;
  createdAt: Date;
  updatedAt: Date;
}
