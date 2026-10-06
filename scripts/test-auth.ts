import { extractStaffRoleFromAuthorities, decodeJwtPayload } from '../src/modules/auth/utils/jwt';
import { STAFF_ROLES } from '../src/shared/constants/roles';

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

assertEqual(
  extractStaffRoleFromAuthorities([]),
  null,
  'Lista vacía debe retornar null',
);

// 2. Prueba de decodificación de JWT
console.log('2. Probando decodificación de token JWT...');
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"limpieza@aurora.test","authorities":["ROLE_HOUSEKEEPING"],"type":"staff","exp":1893456000}
const mockHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const mockPayload = 'eyJzdWIiOiJsaW1waWV6YUBhdXJvcmEudGVzdCIsImF1dGhvcml0aWVzIjpbIlJPTEVfSE9VU0VLRUVQSU5HIl0sInR5cGUiOiJzdGFmZiIsImV4cCI6MTg5MzQ1NjAwMH0';
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

console.log(' Todas las pruebas de lógica de autenticación pasaron exitosamente!');
