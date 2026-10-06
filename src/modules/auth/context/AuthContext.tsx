import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setAuthTokens,
} from '@/shared/services/auth-token';
import { getStorageJSON, removeStorageItem, setStorageJSON } from '@/shared/services/storage';

import { getGuestStay } from '@/modules/stay/services/stay.service';
import {
  buildStaffUserFromToken,
  loginGuest as loginGuestRequest,
  loginStaff as loginStaffRequest,
  logoutStaff,
  refreshStaffToken,
} from '../services/auth.service';
import { restoreStaffAccessToken } from '../services/session-restore';
import { GuestAuthServiceError } from '../services/guest-auth-error';
import type { Session } from '../models/session.model';

const SESSION_STORAGE_KEY = 'pms.session';

/** Forma persistida: liviana a propósito — no almacena datos de negocio locales (reservas/habitaciones). */
type StoredSession =
  { type: 'staff'; email: string } | { type: 'guest'; guestId: string; bookingId: string };

interface State {
  session: Session | null;
  /** true mientras se restaura la sesión guardada al abrir la app. */
  isLoading: boolean;
}

type Action =
  | { type: 'RESTORE_DONE'; session: Session | null }
  | { type: 'SET_SESSION'; session: Session }
  | { type: 'CLEAR_SESSION' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESTORE_DONE':
      return { session: action.session, isLoading: false };
    case 'SET_SESSION':
      return { ...state, session: action.session };
    case 'CLEAR_SESSION':
      return { ...state, session: null };
    default:
      return state;
  }
}

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  loginStaff: (email: string, password: string) => Promise<void>;
  loginGuest: (email: string, password: string) => Promise<void>;
  setGuestSession: (guestId: string, bookingId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { session: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const stored = await getStorageJSON<StoredSession>(SESSION_STORAGE_KEY);

      if (!stored) {
        await clearAuthTokens();
        if (isMounted) dispatch({ type: 'RESTORE_DONE', session: null });
        return;
      }

      if (stored.type === 'staff') {
        const accessToken = await getAuthToken();
        const refreshToken = await getRefreshToken();

        if (!accessToken) {
          await clearAuthTokens();
          await removeStorageItem(SESSION_STORAGE_KEY);
          if (isMounted) dispatch({ type: 'RESTORE_DONE', session: null });
          return;
        }

        try {
          const restored = await restoreStaffAccessToken(
            accessToken,
            refreshToken,
            refreshStaffToken,
          );
          if (restored.refreshToken) {
            await setAuthTokens(restored.accessToken, restored.refreshToken);
          }
          const user = buildStaffUserFromToken(restored.accessToken, stored.email);
          if (isMounted) dispatch({ type: 'RESTORE_DONE', session: { type: 'staff', user } });
        } catch {
          await clearAuthTokens();
          await removeStorageItem(SESSION_STORAGE_KEY);
          if (isMounted) dispatch({ type: 'RESTORE_DONE', session: null });
        }
      } else {
        // Para el huésped, validamos que el token siga siendo válido contra el backend
        try {
          const stay = await getGuestStay();
          if (isMounted) {
            dispatch({
              type: 'RESTORE_DONE',
              session: { type: 'guest', guestId: stay.guestId, bookingId: stay.bookingId },
            });
          }
        } catch (error) {
          // Si el token expiró (401/403) o ya no tiene estadía activa, limpiamos la sesión
          if (
            error instanceof GuestAuthServiceError &&
            (error.status === 401 ||
              error.status === 403 ||
              error.kind === 'noActiveStay' ||
              error.kind === 'stayNotActive')
          ) {
            await clearAuthTokens();
            await removeStorageItem(SESSION_STORAGE_KEY);
            if (isMounted) dispatch({ type: 'RESTORE_DONE', session: null });
          } else {
            // Error de red temporal: restauramos la sesión con los IDs para no cerrar la app offline
            if (isMounted) {
              dispatch({
                type: 'RESTORE_DONE',
                session: { type: 'guest', guestId: stored.guestId, bookingId: stored.bookingId },
              });
            }
          }
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loginStaff(email: string, password: string): Promise<void> {
    const { user, accessToken, refreshToken } = await loginStaffRequest(email, password);
    await setAuthTokens(accessToken, refreshToken);
    await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, { type: 'staff', email: user.email });
    dispatch({ type: 'SET_SESSION', session: { type: 'staff', user } });
  }

  async function loginGuest(email: string, password: string): Promise<void> {
    const token = await loginGuestRequest(email, password);
    await setAuthToken(token);
    try {
      const stay = await getGuestStay();
      const guestSession: StoredSession = {
        type: 'guest',
        guestId: stay.guestId,
        bookingId: stay.bookingId,
      };
      await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, guestSession);
      dispatch({ type: 'SET_SESSION', session: guestSession });
    } catch (error) {
      await clearAuthTokens();
      throw error;
    }
  }

  async function setGuestSession(guestId: string, bookingId: string): Promise<void> {
    dispatch({ type: 'SET_SESSION', session: { type: 'guest', guestId, bookingId } });
    await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, { type: 'guest', guestId, bookingId });
  }

  /**
   * Cierra la sesión: intenta revocar el refresh token en el backend si existe,
   * limpia tokens seguros y almacenamiento local, y vacía el estado.
   */
  async function logout(): Promise<void> {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logoutStaff(refreshToken);
      }
    } catch {
      // Ignorar fallo de red al cerrar sesión para garantizar que el dispositivo limpie siempre
    } finally {
      await clearAuthTokens();
      await removeStorageItem(SESSION_STORAGE_KEY);
      dispatch({ type: 'CLEAR_SESSION' });
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      isLoading: state.isLoading,
      loginStaff,
      loginGuest,
      setGuestSession,
      logout,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}
