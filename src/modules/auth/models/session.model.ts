import type { UserModel } from './user.model';

export interface StaffSession {
  type: 'staff';
  user: UserModel;
}

/**
 * Solo guarda ids: no hay pantallas de huésped todavía (Fase 2) que necesiten
 * el `GuestModel`/`BookingModel` completos en la sesión. Cuando MOV-14+ los
 * necesite, los piden frescos a `booking.service.ts` por id.
 */
export interface GuestSession {
  type: 'guest';
  guestId: string;
  bookingId: string;
}

export type Session = StaffSession | GuestSession;
