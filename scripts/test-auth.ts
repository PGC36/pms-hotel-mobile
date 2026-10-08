import { extractStaffRoleFromAuthorities, decodeJwtPayload } from '../src/modules/auth/utils/jwt';
import { restoreStaffAccessToken } from '../src/modules/auth/services/session-restore';
import {
  buildStaffUserFromToken,
  createStaffAuthApi,
} from '../src/modules/auth/services/staff-auth-api';
import { AuthServiceError } from '../src/modules/auth/services/auth-error';
import { STAFF_ROLES } from '../src/shared/constants/roles';
import { HttpError } from '../src/shared/services/http-client';
import {
  getWebSecureItem,
  removeWebSecureItem,
  setWebSecureItem,
} from '../src/shared/services/web-secure-storage';
import { mapAmenityDTOToModel } from '../src/modules/amenities/mappers/amenity.mapper';
import {
  canGuestCancelRequest,
  mapGuestRequestStatus,
} from '../src/modules/requests/guest/models/guest-request.model';
import { ORDER_STATUS_TRANSITIONS } from '../src/shared/constants/statuses';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Fallo de aserción: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Esperaba '${String(expected)}' pero obtuve '${String(actual)}': ${message}`);
  }
}

console.log('--- Iniciando pruebas de autenticación de personal ---');

console.log('Probando contratos del portal de huésped...');
const amenity = mapAmenityDTOToModel({
  id: 'amenity-1',
  name: 'Piscina',
  description: 'Piscina climatizada',
  category: 'hotel',
  location: 'Terraza',
  opensAt: '08:00:00',
  closesAt: '22:00:00',
  active: true,
});
assertEqual(amenity.category, 'hotel', 'Amenidad usa la categoría real del backend');
assertEqual(amenity.scheduleLabel, '08:00 - 22:00', 'Horario backend se formatea sin segundos');
assertEqual(
  mapGuestRequestStatus('in_progress'),
  'inProgress',
  'Estado backend in_progress se normaliza',
);
assertEqual(
  mapGuestRequestStatus('cancelled'),
  'cancelled',
  'Estado backend cancelled se conserva',
);
assert(canGuestCancelRequest('pending'), 'Huésped puede cancelar solicitud pendiente');
assert(canGuestCancelRequest('accepted'), 'Huésped puede cancelar solicitud aceptada');
assert(!canGuestCancelRequest('inProgress'), 'Huésped no puede cancelar solicitud en progreso');
assert(!canGuestCancelRequest('completed'), 'Huésped no puede cancelar solicitud completada');
assert(
  ORDER_STATUS_TRANSITIONS.pending.includes('cancelled'),
  'Pedido pendiente permite cancelación',
);
assert(
  !ORDER_STATUS_TRANSITIONS.onTheWay.includes('cancelled'),
  'Pedido en camino no permite cancelación',
);
try {
  mapGuestRequestStatus('unknown');
  throw new Error('Un estado desconocido debió rechazarse');
} catch (error) {
  assert(
    error instanceof Error && error.message.includes('desconocido'),
    'Estado desconocido no se muestra como válido',
  );
}

// 1. Prueba de extracción de rol
console.log('1. Probando extracción de roles desde authorities de Spring Security...');
assertEqual(
  extractStaffRoleFromAuthorities(['ROLE_HOUSEKEEPING', 'manage:rooms']),
  STAFF_ROLES.HOUSEKEEPING,
  'Debe extraer rol housekeeping correctamente',
);

assertEqual(
  extractStaffRoleFromAuthorities(['ROLE_ROOM_SERVICE', 'manage:orders']),
  STAFF_ROLES.ROOM_SERVICE,
  'Debe extraer rol roomService correctamente',
);

assertEqual(
  extractStaffRoleFromAuthorities(['ROLE_CONCIERGE', 'manage:concierge']),
  STAFF_ROLES.CONCIERGE,
  'Debe extraer rol concierge correctamente',
);

assertEqual(
  extractStaffRoleFromAuthorities(['ROLE_ADMIN', 'manage:all']),
  null,
  'Roles no operativos para la app móvil deben retornar null',
);

assertEqual(extractStaffRoleFromAuthorities([]), null, 'Lista vacía debe retornar null');

// 2. Prueba de decodificación de JWT
console.log('2. Probando decodificación de token JWT...');
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"limpieza@aurora.test","authorities":["ROLE_HOUSEKEEPING"],"type":"staff","exp":1893456000}
const mockHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const mockPayload =
  'eyJzdWIiOiJsaW1waWV6YUBhdXJvcmEudGVzdCIsImF1dGhvcml0aWVzIjpbIlJPTEVfSE9VU0VLRUVQSU5HIl0sInR5cGUiOiJzdGFmZiIsImV4cCI6MTg5MzQ1NjAwMH0';
const mockSignature = 'signature_mock';
const mockJwt = `${mockHeader}.${mockPayload}.${mockSignature}`;

const decoded = decodeJwtPayload(mockJwt);
assert(decoded !== null, 'El token debe decodificarse');
if (decoded) {
  assertEqual(decoded.sub, 'limpieza@aurora.test', 'Subject debe coincidir');
  assertEqual(decoded.type, 'staff', 'Tipo de token debe ser staff');
  assertEqual(
    extractStaffRoleFromAuthorities(decoded.authorities ?? []),
    STAFF_ROLES.HOUSEKEEPING,
    'Rol extraído del token debe ser housekeeping',
  );
}

// 3. Token malformado
console.log('3. Probando manejo de token malformado...');
assertEqual(decodeJwtPayload('token.invalido'), null, 'Token malformado retorna null');
assertEqual(decodeJwtPayload(''), null, 'Token vacío retorna null');

function createToken(exp?: number, type = 'staff', authorities = ['ROLE_HOUSEKEEPING']): string {
  const payload: Record<string, unknown> = {
    sub: 'housekeeping@aurora.test',
    type,
    authorities,
  };
  if (exp !== undefined) payload.exp = exp;
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

async function testStaffAuthApi(): Promise<void> {
  console.log('4. Probando login, roles, refresh y logout contra API simulada...');
  const token = createToken(1_900_000_000);
  const requests: Array<{ path: string; body: unknown }> = [];
  const api = createStaffAuthApi(async <T>(path: string, body?: unknown) => {
    requests.push({ path, body });
    return {
      accessToken: token,
      refreshToken: 'refresh-rotated',
      tokenType: 'Bearer',
      expiresIn: 3600,
    } as T;
  });

  const login = await api.loginStaff(' housekeeping@aurora.test ', 'plain-password');
  assertEqual(login.user.role, STAFF_ROLES.HOUSEKEEPING, 'Login válido resuelve el rol del JWT');
  assertEqual(login.user.email, 'housekeeping@aurora.test', 'Login normaliza el correo');
  assertEqual(requests[0]?.path, '/auth/login', 'Login usa el endpoint real');
  assertEqual(
    (requests[0]?.body as { password: string }).password,
    'plain-password',
    'Login envía las credenciales recibidas',
  );

  const refreshed = await api.refreshStaffToken('refresh-current');
  assertEqual(requests[1]?.path, '/auth/refresh', 'Refresh usa el endpoint real');
  assertEqual(refreshed.refreshToken, 'refresh-rotated', 'Refresh devuelve el token rotado');

  await api.logoutStaff('refresh-current');
  assertEqual(requests[2]?.path, '/auth/logout', 'Logout usa el endpoint real');

  const invalidApi = createStaffAuthApi(async <T>() => {
    throw new HttpError(401, 'HTTP 401', { message: 'invalid email or password' });
  });
  try {
    await invalidApi.loginStaff('wrong@aurora.test', 'wrong');
    throw new Error('Credenciales inválidas debieron rechazarse');
  } catch (error) {
    assert(
      error instanceof AuthServiceError && error.kind === 'invalidCredentials',
      'Credenciales inválidas se traducen a error controlado',
    );
  }

  for (const [authority, expectedRole] of [
    ['ROLE_HOUSEKEEPING', STAFF_ROLES.HOUSEKEEPING],
    ['ROLE_ROOM_SERVICE', STAFF_ROLES.ROOM_SERVICE],
    ['ROLE_CONCIERGE', STAFF_ROLES.CONCIERGE],
  ] as const) {
    assertEqual(
      buildStaffUserFromToken(createToken(undefined, 'staff', [authority])).role,
      expectedRole,
      `${authority} obtiene solo su rol permitido`,
    );
  }
  try {
    buildStaffUserFromToken(createToken(undefined, 'staff', ['ROLE_ADMIN']));
    throw new Error('Un rol fuera del alcance móvil debió rechazarse');
  } catch (error) {
    assert(
      error instanceof AuthServiceError && error.kind === 'unsupportedRole',
      'El rol admin no se acepta como rol móvil',
    );
  }
}

async function assertRejects(action: () => Promise<unknown>, message: string): Promise<void> {
  try {
    await action();
  } catch {
    return;
  }
  throw new Error(`Se esperaba rechazo: ${message}`);
}

async function testSessionRestore(): Promise<void> {
  console.log('4. Probando restauración y renovación de sesión...');
  const now = 1_800_000_000_000;
  const nowSeconds = Math.floor(now / 1000);
  const current = createToken(nowSeconds + 60);
  const expired = createToken(nowSeconds - 60);
  const refreshed = createToken(nowSeconds + 600);

  const unchanged = await restoreStaffAccessToken(
    current,
    null,
    async () => {
      throw new Error('No debe renovar un token vigente');
    },
    now,
  );
  assertEqual(unchanged.accessToken, current, 'Un token vigente restaura la sesión sin refresh');

  await assertRejects(
    () =>
      restoreStaffAccessToken(
        expired,
        null,
        async () => ({ accessToken: '', refreshToken: '' }),
        now,
      ),
    'Un token expirado sin refresh no debe restaurar sesión',
  );
  await assertRejects(
    () =>
      restoreStaffAccessToken(
        createToken(undefined),
        'refresh',
        async () => ({ accessToken: '', refreshToken: '' }),
        now,
      ),
    'Un token sin exp no debe restaurar sesión',
  );
  await assertRejects(
    () =>
      restoreStaffAccessToken(
        createToken(nowSeconds + 60, 'guest'),
        null,
        async () => ({ accessToken: '', refreshToken: '' }),
        now,
      ),
    'Un JWT de huésped no debe restaurar una sesión de personal',
  );

  let suppliedRefresh = '';
  const rotated = await restoreStaffAccessToken(
    expired,
    'refresh-original',
    async (token) => {
      suppliedRefresh = token;
      return { accessToken: refreshed, refreshToken: 'refresh-rotated' };
    },
    now,
  );
  assertEqual(suppliedRefresh, 'refresh-original', 'Se envía el refresh token existente');
  assertEqual(rotated.accessToken, refreshed, 'Se devuelve el access token rotado');
  assertEqual(rotated.refreshToken, 'refresh-rotated', 'Se devuelve el refresh token rotado');

  await assertRejects(
    () =>
      restoreStaffAccessToken(
        expired,
        'refresh',
        async () => {
          throw new Error('offline');
        },
        now,
      ),
    'Un fallo de refresh debe impedir restaurar sesión',
  );
  await assertRejects(
    () =>
      restoreStaffAccessToken(
        expired,
        'refresh',
        async () => ({
          accessToken: createToken(nowSeconds - 1),
          refreshToken: 'rotated',
        }),
        now,
      ),
    'No se debe aceptar un token rotado que ya está expirado',
  );
}

function testWebSecureStorage(): void {
  console.log('5. Probando almacenamiento web solo en memoria...');
  setWebSecureItem('test-token', 'secret');
  assertEqual(
    getWebSecureItem('test-token'),
    'secret',
    'El token queda disponible durante la sesión',
  );
  removeWebSecureItem('test-token');
  assertEqual(getWebSecureItem('test-token'), null, 'El token puede eliminarse al cerrar sesión');
}

void testSessionRestore()
  .then(testStaffAuthApi)
  .then(testWebSecureStorage)
  .then(() => console.log(' Todas las pruebas de restauración y almacenamiento pasaron.'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
