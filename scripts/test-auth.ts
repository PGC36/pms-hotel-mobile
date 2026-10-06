import { extractStaffRoleFromAuthorities, decodeJwtPayload } from '../src/modules/auth/utils/jwt';
import { restoreStaffAccessToken } from '../src/modules/auth/services/session-restore';
import { STAFF_ROLES } from '../src/shared/constants/roles';
import {
  getWebSecureItem,
  removeWebSecureItem,
  setWebSecureItem,
} from '../src/shared/services/web-secure-storage';

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

function createToken(exp?: number, type = 'staff'): string {
  const payload: Record<string, unknown> = {
    sub: 'housekeeping@aurora.test',
    type,
    authorities: ['ROLE_HOUSEKEEPING'],
  };
  if (exp !== undefined) payload.exp = exp;
  return `header.${btoa(JSON.stringify(payload))}.signature`;
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
  .then(testWebSecureStorage)
  .then(() => console.log(' Todas las pruebas de restauración y almacenamiento pasaron.'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
