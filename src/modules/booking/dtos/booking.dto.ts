export const BOOKING_STATUSES = ['confirmed', 'checkedIn', 'checkedOut', 'cancelled'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Forma cruda de una reserva, tal como la expondría `GET /bookings/:id`.
 * No es una de las tres máquinas de estado de `shared/constants/statuses.ts`:
 * su ciclo de vida lo gestiona la web privada (check-in/check-out); aquí solo
 * se consume para saber si el código de vinculación (HU-11) sigue siendo válido.
 */
export interface BookingDTO {
  id: string;
  guest_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  status: BookingStatus;
  linking_code: string;
  total_price: number;
  notes: string | null;
  created_at: string;
}
