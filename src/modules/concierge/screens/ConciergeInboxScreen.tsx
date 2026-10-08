import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';
import { colors, spacing, typography } from '@/shared/theme';

import { ConciergeServiceError } from '../services/concierge.service';
import { getActiveConciergeTasks } from '../services/concierge-task.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'Inbox'>;
const CONFIG: TaskListScreenConfig = {
  emptyTitle: 'No hay solicitudes pendientes',
  emptyDescription: 'Las solicitudes de huéspedes aparecerán aquí.',
  searchPlaceholder: 'Buscar por huésped o habitación',
  getErrorDescription: (error) =>
    error instanceof ConciergeServiceError ? error.message : undefined,
};

export function ConciergeInboxScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.actions}>
          <Pressable onPress={() => navigation.navigate('Rooms')} accessibilityRole="button">
            <Text style={styles.link}>Habitaciones</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('History')} accessibilityRole="button">
            <Text style={styles.link}>Historial</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <TaskListScreen
      fetchTasks={getActiveConciergeTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('Detail', { requestId: task.id })}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.md },
  link: { ...typography.button, color: colors.brand[600] },
});
