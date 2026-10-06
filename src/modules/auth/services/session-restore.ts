import { decodeJwtPayload, extractStaffRoleFromAuthorities } from '../utils/jwt';

type TokenRefresh = (token: string) => Promise<{ accessToken: string; refreshToken: string }>;

function isUsableStaffToken(token: string, nowSeconds: number): boolean {
  const payload = decodeJwtPayload(token);
  return Boolean(
    payload &&
    payload.type === 'staff' &&
    typeof payload.exp === 'number' &&
    Number.isFinite(payload.exp) &&
    payload.exp > nowSeconds &&
    extractStaffRoleFromAuthorities(payload.authorities ?? []),
  );
}

/** Valida una sesión persistida y renueva el token si ya expiró. */
export async function restoreStaffAccessToken(
  accessToken: string,
  refreshToken: string | null,
  refresh: TokenRefresh,
  nowMilliseconds = Date.now(),
): Promise<{ accessToken: string; refreshToken?: string }> {
  const payload = decodeJwtPayload(accessToken);
  const nowSeconds = Math.floor(nowMilliseconds / 1000);
  if (
    !payload ||
    payload.type !== 'staff' ||
    typeof payload.exp !== 'number' ||
    !Number.isFinite(payload.exp) ||
    !extractStaffRoleFromAuthorities(payload.authorities ?? [])
  ) {
    throw new Error('Invalid staff session token');
  }

  if (payload.exp > nowSeconds) return { accessToken };
  if (!refreshToken) throw new Error('Expired staff session has no refresh token');

  const rotated = await refresh(refreshToken);
  if (!isUsableStaffToken(rotated.accessToken, nowSeconds)) {
    throw new Error('Refresh returned an invalid staff token');
  }
  return rotated;
}
