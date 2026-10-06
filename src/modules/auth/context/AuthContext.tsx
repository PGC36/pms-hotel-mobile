import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { clearAuthToken, setAuthToken } from '@/shared/services/auth-token';
import { getStorageJSON, removeStorageItem, setStorageJSON } from '@/shared/services/storage';

import { getGuestStay } from '@/modules/stay/services/stay.service';
import { getUserById, login as loginRequest, loginGuest as loginGuestRequest } from '../services/auth.service';
import { GuestAuthServiceError } from '../services/guest-auth-error';
import type { Session } from '../models/session.model';

const SESSION_STORAGE_KEY = 'pms.session';

/** Forma persistida: liviana a propósito — no almacena datos de negocio locales (reservas/habitaciones). */
type StoredSession =
  | { type: 'staff'; userId: string }
  | { type: 'guest'; guestId: string; bookingId: string };

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
        if (isMounted) dispatch({ type: 'RESTORE_DONE', session: null });
        return;
      }

      if (stored.type === 'staff') {
        const user = await getUserById(stored.userId);
        if (user && user.isActive) {
          if (isMounted) dispatch({ type: 'RESTORE_DONE', session: { type: 'staff', user } });
        } else {
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
          if (error instanceof GuestAuthServiceError && (error.status === 401 || error.status === 403 || error.kind === 'noActiveStay' || error.kind === 'stayNotActive')) {
            await clearAuthToken();
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
    const user = await loginRequest(email, password);
    dispatch({ type: 'SET_SESSION', session: { type: 'staff', user } });
    await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, { type: 'staff', userId: user.id });
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
      await clearAuthToken();
      throw error;
    }
  }

  async function setGuestSession(guestId: string, bookingId: string): Promise<void> {
    dispatch({ type: 'SET_SESSION', session: { type: 'guest', guestId, bookingId } });
    await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, { type: 'guest', guestId, bookingId });
  }

  /**
   * Cierra la sesión por completo: primero el token de la API real, luego la
   * sesión persistida y al final el estado en memoria. Si borrar algo falla,
   * lanza y la sesión sigue abierta (el usuario puede reintentar), para no
   * dejar una sesión a medias que al recargar combine un rol con el token de
   * otro usuario.
   */
  async function logout(): Promise<void> {
    await clearAuthToken();
    await removeStorageItem(SESSION_STORAGE_KEY);
    dispatch({ type: 'CLEAR_SESSION' });
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
