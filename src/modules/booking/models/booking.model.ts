import type { BookingStatus } from '../dtos/booking.dto';

export interface BookingModel {
  id: string;
  guestId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestsCount: number;
  status: BookingStatus;
  linkingCode: string;
  totalPrice: number;
  notes: string | null;
  /** Calculado a partir de check-in/check-out; no viene del DTO. */
  nights: number;
  createdAt: Date;
}
