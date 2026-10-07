import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { colors } from '@/shared/theme/colors';

import type { GuestServicesStackParamList } from '@/navigation/routes';

type NavigationProp = NativeStackNavigationProp<GuestServicesStackParamList, 'ServicesHome'>;

export function GuestServicesHomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Servicios del Hotel</Text>
      
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Amenidades</Text>
        <Text style={styles.cardDescription}>Conoce nuestros horarios y ubicaciones (piscina, gym, restaurante, etc.)</Text>
        <Button 
          label="Ver amenidades" 
          onPress={() => navigation.navigate('AmenitiesList')}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Limpieza y Artículos</Text>
        <Text style={styles.cardDescription}>Solicita toallas extras, limpieza, o artículos a tu habitación.</Text>
        <Button 
          label="Solicitar limpieza/artículos" 
          variant="secondary"
          onPress={() => navigation.navigate('CreateRequest', { type: 'housekeeping' })}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Conserjería</Text>
        <Text style={styles.cardDescription}>Reserva de tours, transporte, y más.</Text>
        <Button 
          label="Hablar con conserje" 
          variant="secondary"
          onPress={() => navigation.navigate('CreateRequest', { type: 'concierge' })}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Mis Solicitudes</Text>
        <Text style={styles.cardDescription}>Revisa el estado de tus solicitudes activas.</Text>
        <Button 
          label="Ver mis solicitudes" 
          variant="secondary"
          onPress={() => navigation.navigate('RequestList')}
        />
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
});
