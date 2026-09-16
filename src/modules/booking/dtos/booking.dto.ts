import type { BookingStatus } from '@/shared/constants/statuses';
import type { Currency } from '@/shared/utils/formatters';

export type { BookingStatus };

/**
 * Forma cruda de una reserva, tal como la expondría `GET /bookings/:id`.
 * Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.5. Su ciclo de vida lo
 * gestiona la web (check-in/check-out/cancelación) — móvil **solo lee**,
 * nunca transiciona `status` (las transiciones viven en
 * `shared/constants/statuses.ts` igual que las demás, mismo criterio de
 * "un único lugar", pero móvil no las ejecuta).
 */
export interface BookingDTO {
  id: string;
  confirmation_code: string;
  guest_link_code: string;
  guest_id: string;
  room_id?: string;
  room_type_id: string;
  rate_id?: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  adults: number;
  children: number;
  total_amount_cents: number;
  currency: Currency;
  notes?: string;
  created_at: string;
  updated_at: string;
}
