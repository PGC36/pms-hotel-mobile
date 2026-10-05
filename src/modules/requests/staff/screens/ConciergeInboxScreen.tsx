import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';
import { colors, spacing, typography } from '@/shared/theme';

import { ConciergeRequestServiceError } from '../../services/concierge-request-error';
import { getActiveConciergeTasks } from '../../services/concierge-task.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'ConciergeInbox'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🛎️',
  emptyTitle: 'No hay solicitudes pendientes',
  emptyDescription: 'Cuando un huésped pida algo a conserjería aparecerá aquí.',
  searchPlaceholder: 'Buscar por huésped, habitación o solicitud',
  // El backend ya las entrega de la más antigua a la más reciente.
  sort: 'asProvided',
  loadingMessage: 'Cargando solicitudes...',
  errorTitle: 'No se pudieron cargar las solicitudes',
  getErrorDescription: (error) =>
    error instanceof ConciergeRequestServiceError ? error.message : undefined,
};

/** Bandeja de Conserjería: solo configura la bandeja genérica de `tasks`. */
export function ConciergeInboxScreen({ navigation }: Props) {
  // En el encabezado (no en la lista), igual que Room Service y Limpieza,
  // para que sigan visibles aunque la bandeja falle.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate('RequestsByRoom')}
            accessibilityRole="button"
            accessibilityLabel="Ver solicitudes por habitación"
            hitSlop={spacing.sm}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.headerAction}>Por habitación</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('ConciergeHistory')}
            accessibilityRole="button"
            accessibilityLabel="Ver el historial de solicitudes atendidas"
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
      fetchTasks={getActiveConciergeTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('ConciergeRequestDetail', { requestId: task.id })}
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
