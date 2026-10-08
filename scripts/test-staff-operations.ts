import {
  mapConciergeDTOToModel,
  mapConciergeToTask,
} from '../src/modules/concierge/mappers/concierge-request.mapper';
import type { ConciergeRequestDTO } from '../src/modules/concierge/dtos/concierge-request.dto';
import { mapMaintenanceDTOToModel } from '../src/modules/housekeeping/mappers/maintenance.mapper';
import type { MaintenanceDTO } from '../src/modules/housekeeping/dtos/maintenance.dto';
import { mapStayoverDTOToModel } from '../src/modules/housekeeping/mappers/stayover.mapper';
import type { StayoverDTO } from '../src/modules/housekeeping/dtos/stayover.dto';
import { createHttpClient, HttpError } from '../src/shared/services/http-client';
import {
  assertValidTransition,
  InvalidTransitionError,
} from '../src/modules/tasks/services/task-transition.service';
import {
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ServiceRequestStatus,
} from '../src/shared/constants/statuses';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected)
    throw new Error(`${message}: esperaba ${String(expected)}, obtuvo ${String(actual)}`);
}

function assertDeepEqual(actual: unknown, expected: unknown, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`${message}: valores distintos`);
}

async function assertRejects(operation: Promise<unknown>, predicate: (error: unknown) => boolean) {
  try {
    await operation;
  } catch (error) {
    if (predicate(error)) return;
    throw error;
  }
  throw new Error('Se esperaba que la operación fuera rechazada.');
}

const stayover = mapStayoverDTOToModel({
  id: 'stay-1',
  bookingId: 'booking-1',
  roomId: 'room-1',
  roomNumber: '202',
  status: 'in_progress',
  description: 'Limpieza solicitada',
  notes: null,
  responsibleUserEmail: 'staff@example.test',
  startedByUserEmail: 'staff@example.test',
  completedByUserEmail: null,
  requestedAt: '2026-10-08T10:00:00Z',
  startedAt: null,
  completedAt: null,
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T10:05:00Z',
} satisfies StayoverDTO);
assertEqual(stayover.status, 'inProgress', 'Estado stayover');
assertEqual(stayover.roomNumber, '202', 'Número de habitación');

const maintenance = mapMaintenanceDTOToModel({
  id: 'maintenance-1',
  roomId: 'room-1',
  roomNumber: '202',
  responsibleUserEmail: 'staff@example.test',
  type: 'maintenance',
  description: 'Grifo con fuga',
  status: 'in_progress',
  notes: null,
  requestedAt: '2026-10-08T10:00:00Z',
  completedAt: null,
  updatedAt: '2026-10-08T10:05:00Z',
} satisfies MaintenanceDTO);
assertEqual(maintenance.status, 'inProgress', 'Estado maintenance');

const concierge = mapConciergeDTOToModel({
  id: 'concierge-1',
  bookingId: 'booking-1',
  roomId: 'room-1',
  roomNumber: '202',
  guestName: 'Ana Morales',
  responsibleUserEmail: null,
  type: 'concierge',
  description: 'Solicitar taxi',
  status: 'in_progress',
  notes: null,
  requestedAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T10:05:00Z',
} satisfies ConciergeRequestDTO);
assertEqual(mapConciergeToTask(concierge).status, 'inProgress', 'Estado concierge');
assertEqual(mapConciergeToTask(concierge).roomLabel, 'Habitación 202', 'Habitación concierge');
assertValidTransition(SERVICE_REQUEST_STATUS_TRANSITIONS, 'pending', 'accepted', 'ServiceRequest');
assertValidTransition(
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  'accepted',
  'inProgress',
  'ServiceRequest',
);
try {
  assertValidTransition(
    SERVICE_REQUEST_STATUS_TRANSITIONS,
    'pending',
    'completed',
    'ServiceRequest',
  );
  throw new Error('La transición inválida debería rechazarse.');
} catch (error) {
  if (!(error instanceof InvalidTransitionError)) throw error;
}

async function main() {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  let persistedStatus: ServiceRequestStatus = 'pending';
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith('/concierge/requests/concierge-1/status')) {
      persistedStatus = JSON.parse(String(init.body)).status as ServiceRequestStatus;
      return new Response(JSON.stringify({ status: persistedStatus }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (String(input).endsWith('/concierge/requests/concierge-1')) {
      return new Response(JSON.stringify({ status: persistedStatus }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ saved: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const client = createHttpClient({
      baseUrl: 'http://localhost:8080/api/v1',
      getAuthToken: async () => 'token-123',
    });
    const result = await client.post<{ status: string }>('/concierge/requests/concierge-1/status', {
      status: 'accepted',
    });
    assertDeepEqual(result, { status: 'accepted' }, 'Respuesta HTTP');
    assertEqual(
      calls[0].url,
      'http://localhost:8080/api/v1/concierge/requests/concierge-1/status',
      'URL del endpoint',
    );
    assertEqual(calls[0].init.method, 'POST', 'Método HTTP');
    assertEqual(
      new Headers(calls[0].init.headers).get('authorization'),
      'Bearer token-123',
      'Bearer token',
    );
    assertDeepEqual(
      JSON.parse(String(calls[0].init.body)),
      { status: 'accepted' },
      'Body de transición',
    );
    const afterReload = await client.get<{ status: string }>('/concierge/requests/concierge-1');
    assertEqual(afterReload.status, 'accepted', 'El estado persiste al volver a consultar');

    globalThis.fetch = async () =>
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' });
    await assertRejects(
      client.get('/housekeeping/rooms'),
      (error: unknown) => error instanceof HttpError && error.status === 403,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('Pruebas de contrato de operaciones de personal: OK');
}

void main();
