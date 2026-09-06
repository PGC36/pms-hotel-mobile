import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { getStorageJSON, removeStorageItem, setStorageJSON } from '@/shared/services/storage';

import { getUserById, login as loginRequest } from '../services/auth.service';
import type { Session } from '../models/session.model';

const SESSION_STORAGE_KEY = 'pms.session';

/** Forma persistida: liviana a propósito — al restaurar se piden Models frescos. */
type StoredSession =
  { type: 'staff'; userId: string } | { type: 'guest'; guestId: string; bookingId: string };

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
      } else if (isMounted) {
        dispatch({
          type: 'RESTORE_DONE',
          session: { type: 'guest', guestId: stored.guestId, bookingId: stored.bookingId },
        });
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

  async function setGuestSession(guestId: string, bookingId: string): Promise<void> {
    dispatch({ type: 'SET_SESSION', session: { type: 'guest', guestId, bookingId } });
    await setStorageJSON<StoredSession>(SESSION_STORAGE_KEY, { type: 'guest', guestId, bookingId });
  }

  async function logout(): Promise<void> {
    dispatch({ type: 'CLEAR_SESSION' });
    await removeStorageItem(SESSION_STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      isLoading: state.isLoading,
      loginStaff,
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
