import { apiClient } from '@/shared/services/api-client';

import { callGuestAuthApi } from '@/modules/auth/services/guest-auth-error';
import type { GuestStayDTO } from '../dtos/stay.dto';
import { mapGuestStayDTOToModel } from '../mappers/stay.mapper';
import type { GuestStayModel } from '../models/stay.model';

/**
 * Obtiene la estadía del huésped autenticado (`GET /guest/stay`).
 * Requiere que el token de autenticación del huésped esté configurado en `auth-token`.
 */
export async function getGuestStay(): Promise<GuestStayModel> {
  const stay = await callGuestAuthApi(() => apiClient.get<GuestStayDTO>('/guest/stay'));
  return mapGuestStayDTOToModel(stay);
}
