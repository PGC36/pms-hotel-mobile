import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { RoomServiceStackParamList } from '@/navigation/routes';
import { colors, spacing, typography } from '@/shared/theme';

import { getActiveOrderTasks } from '../../services/order-task.service';
import { RoomServiceServiceError } from '../../services/room-service-error';

type Props = NativeStackScreenProps<RoomServiceStackParamList, 'OrderInbox'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🛎️',
  emptyTitle: 'No hay pedidos pendientes por atender.',
  emptyDescription: 'Cuando un huésped haga un pedido aparecerá aquí.',
  searchPlaceholder: 'Buscar por huésped, habitación o producto',
  // El backend ya los entrega del más reciente al más antiguo.
  sort: 'asProvided',
  loadingMessage: 'Cargando pedidos...',
  errorTitle: 'No se pudieron cargar los pedidos',
  getErrorDescription: (error) =>
    error instanceof RoomServiceServiceError ? error.message : undefined,
};

/** Bandeja de pedidos de Room Service: solo configura la bandeja genérica de `tasks`. */
export function OrderInboxScreen({ navigation }: Props) {
  // En el encabezado (no en la lista), igual que Limpieza, para que sigan
  // visibles aunque la bandeja falle: el menú no depende de los pedidos.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate('Menu')}
            accessibilityRole="button"
            accessibilityLabel="Ver el menú de Room Service"
            hitSlop={spacing.sm}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.headerAction}>Menú</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('History')}
            accessibilityRole="button"
            accessibilityLabel="Ver el historial de pedidos atendidos"
            hitSlop={spacing.sm}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.headerAction}>Historial</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <TaskListScreen
      fetchTasks={getActiveOrderTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('OrderDetail', { orderId: task.id })}
    />
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerAction: {
    ...typography.button,
    color: colors.brand[600],
  },
});
