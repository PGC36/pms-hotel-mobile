import { useCallback, useReducer } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { StayHeader } from '../components/StayHeader';
import type { GuestStayModel } from '../models/stay.model';
import { getGuestStay } from '../services/stay.service';

interface State {
  status: 'loading' | 'error' | 'ready';
  stay: GuestStayModel | null;
  isRefreshing: boolean;
  errorMessage: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; stay: GuestStayModel }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'REFRESH_START' };

const initialState: State = {
  status: 'loading',
  stay: null,
  isRefreshing: false,
  errorMessage: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', errorMessage: null };
    case 'FETCH_SUCCESS':
      return { status: 'ready', stay: action.stay, isRefreshing: false, errorMessage: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', isRefreshing: false, errorMessage: action.message };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true, errorMessage: null };
    default:
      return state;
  }
}

export function StayScreen({ onNavigateToServices, onNavigateToRoomService, onNavigateToNotifications }: {
  onNavigateToServices: () => void;
  onNavigateToRoomService: () => void;
  onNavigateToNotifications: () => void;
}) {
  const { logout } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadStay = useCallback(async () => {
    try {
      const data = await getGuestStay();
      dispatch({ type: 'FETCH_SUCCESS', stay: data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar la información de tu estadía.';
      dispatch({ type: 'FETCH_ERROR', message });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'FETCH_START' });
      void loadStay();
    }, [loadStay]),
  );

  const handleRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH_START' });
    void loadStay();
  }, [loadStay]);

  if (state.status === 'loading') {
    return <LoadingState message="Cargando tu estadía..." />;
  }

  if (state.status === 'error') {
    return (
      <View style={styles.errorContainer}>
        <ErrorState
          title="Error de conexión"
          description={state.errorMessage ?? undefined}
          onRetry={() => {
            dispatch({ type: 'FETCH_START' });
            void loadStay();
          }}
        />
        <View style={styles.logoutWrapper}>
          <Text style={styles.logoutPrompt}>Si tu sesión expiró, puedes volver al login:</Text>
          <Text style={styles.logoutLink} onPress={() => void logout()}>
            Cerrar sesión
          </Text>
        </View>
      </View>
    );
  }

  const { stay } = state;
  if (!stay) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          title="Sin estadía activa"
          description="No se encontró una reserva activa asociada a esta cuenta."
        />
      </View>
    );
  }


  return (
    <View style={styles.screen}>
      <StayHeader guestName={stay.guestFullName} roomNumber={stay.roomNumber} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[600]}
          />
        }

      >
        <View style={styles.quickActions}>
          <Button label="Servicios" variant="secondary" onPress={onNavigateToServices} />
          <Button label="Room Service" variant="secondary" onPress={onNavigateToRoomService} />
          <Button label="Avisos" variant="secondary" onPress={onNavigateToNotifications} />
        </View>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Detalles de la Estadía</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Habitación</Text>
            <Text style={styles.value}>
              {stay.roomNumber} ({stay.roomTypeName})
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Entrada</Text>
            <Text style={styles.value}>{stay.checkIn}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Salida</Text>
            <Text style={styles.value}>{stay.checkOut}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Estado de la Reserva</Text>
            <Text style={styles.value}>{stay.status}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Saldo en Folio</Text>
            <Text style={styles.valueHighlight}>{stay.balanceFormatted}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.sand[50],
  },
  logoutWrapper: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoutPrompt: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  logoutLink: {
    ...typography.body,
    color: colors.brand[600],
    textDecorationLine: 'underline',
  },
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  valueHighlight: {
    ...typography.body,
    color: colors.brand[600],
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.sand[200],
  },
});
