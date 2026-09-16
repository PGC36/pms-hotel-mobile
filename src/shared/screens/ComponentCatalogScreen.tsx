import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  type BadgeVariant,
} from '@/shared/components';
import {
  colors,
  radius,
  spacing,
  statusColors,
  typography,
  type TypographyVariant,
} from '@/shared/theme';

/**
 * Pantalla temporal (MOV-03): muestra cada componente y token del sistema de
 * diseño en todas sus variantes. No forma parte de la navegación final — se monta
 * directamente desde App.tsx hasta que exista un RootNavigator (MOV-05+).
 */
export function ComponentCatalogScreen() {
  const [retryCount, setRetryCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Sistema de diseño</Text>
      <Text style={styles.pageSubtitle}>
        Catálogo de tokens y componentes compartidos — PMS Hoteles Boutique
      </Text>

      <Section title="Colores — marca">
        <Row wrap>
          <Swatch
            label="brand-900 Espresso"
            hex={colors.brand[900]}
            textColor={colors.text.onBrand}
          />
          <Swatch label="brand-800 Café" hex={colors.brand[800]} textColor={colors.text.onBrand} />
          <Swatch label="brand-600 Moka" hex={colors.brand[600]} textColor={colors.text.onBrand} />
          <Swatch label="brand-400 Caramelo" hex={colors.brand[400]} textColor={colors.white} />
          <Swatch label="brand-300 Dorado" hex={colors.brand[300]} textColor={colors.brand[900]} />
        </Row>
      </Section>

      <Section title="Colores — neutros">
        <Row wrap>
          <Swatch label="sand-300 Arena" hex={colors.sand[300]} textColor={colors.text.primary} />
          <Swatch label="sand-200 Beige" hex={colors.sand[200]} textColor={colors.text.primary} />
          <Swatch label="sand-100 Lino" hex={colors.sand[100]} textColor={colors.text.primary} />
          <Swatch label="sand-50 Hueso" hex={colors.sand[50]} textColor={colors.text.primary} />
          <Swatch label="white" hex={colors.white} textColor={colors.text.primary} bordered />
        </Row>
      </Section>

      <Section title="Colores — semánticos">
        <Row wrap>
          <Swatch label="success" hex={colors.state.success} textColor={colors.white} />
          <Swatch label="warning" hex={colors.state.warning} textColor={colors.brand[900]} />
          <Swatch label="danger" hex={colors.state.danger} textColor={colors.white} />
          <Swatch label="info" hex={colors.state.info} textColor={colors.white} />
          <Swatch label="muted" hex={colors.state.muted} textColor={colors.white} />
        </Row>
      </Section>

      <Section title="Tipografía">
        {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
          <Text key={variant} style={[typography[variant], styles.typographySample]}>
            {variant} — Aa Bb Cc 123
          </Text>
        ))}
      </Section>

      <Section title="Espaciado">
        <Row wrap>
          {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((token) => (
            <View key={token} style={styles.spacingSample}>
              <View
                style={[styles.spacingBox, { width: spacing[token], height: spacing[token] }]}
              />
              <Text style={styles.spacingLabel}>{token}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Button">
        <Row wrap>
          <Button label="Primario" variant="primary" onPress={() => {}} />
          <Button label="Secundario" variant="secondary" onPress={() => {}} />
          <Button label="Peligro" variant="danger" onPress={() => {}} />
        </Row>
        <Row wrap>
          <Button label="Deshabilitado" variant="primary" disabled onPress={() => {}} />
          <Button label="Cargando" variant="primary" loading onPress={() => {}} />
          <Button label="Ancho completo" variant="secondary" fullWidth onPress={() => {}} />
        </Row>
      </Section>

      <Section title="Card">
        <Card>
          <Text style={typography.h2}>Habitación 204</Text>
          <Text style={typography.body}>Este es el contenido de una Card genérica.</Text>
        </Card>
      </Section>

      <Section title="Input">
        <View style={{ gap: spacing.md }}>
          <Input
            label="Nombre del huésped"
            placeholder="Ej. María Fernanda Ruiz"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Input
            label="Con error"
            placeholder="correo@ejemplo.com"
            error="Este campo es obligatorio"
          />
          <Input label="Deshabilitado" placeholder="No editable" editable={false} />
        </View>
      </Section>

      <Section title="Badge — variantes genéricas">
        <Row wrap>
          {(
            ['neutral', 'accent', 'success', 'warning', 'danger', 'info', 'muted'] as BadgeVariant[]
          ).map((variant) => (
            <Badge key={variant} label={variant} variant={variant} />
          ))}
        </Row>
      </Section>

      <Section title="Badge — estados de pedido (Order)">
        <Row wrap>
          {Object.entries(statusColors.order).map(([status, token]) => (
            <View key={status} style={[styles.statusBadge, { backgroundColor: token.background }]}>
              <Text style={[typography.caption, { color: token.text }]}>{status}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Badge — estados de solicitud (ServiceRequest)">
        <Row wrap>
          {Object.entries(statusColors.serviceRequest).map(([status, token]) => (
            <View key={status} style={[styles.statusBadge, { backgroundColor: token.background }]}>
              <Text style={[typography.caption, { color: token.text }]}>{status}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Badge — ocupación de habitación (Room)">
        <Row wrap>
          {Object.entries(statusColors.room).map(([status, token]) => (
            <View key={status} style={[styles.statusBadge, { backgroundColor: token.background }]}>
              <Text style={[typography.caption, { color: token.text }]}>{status}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Badge — limpieza de habitación (RoomHousekeeping)">
        <Row wrap>
          {Object.entries(statusColors.roomHousekeeping).map(([status, token]) => (
            <View key={status} style={[styles.statusBadge, { backgroundColor: token.background }]}>
              <Text style={[typography.caption, { color: token.text }]}>{status}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="EmptyState">
        <Card>
          <EmptyState
            title="No hay pedidos"
            description="Cuando lleguen pedidos nuevos aparecerán aquí."
          />
        </Card>
      </Section>

      <Section title="LoadingState">
        <Card>
          <LoadingState message="Cargando pedidos..." />
        </Card>
      </Section>

      <Section title="ErrorState">
        <Card>
          <ErrorState
            description={`Reintentos: ${retryCount}`}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        </Card>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children, wrap = false }: { children: ReactNode; wrap?: boolean }) {
  const rowStyle: ViewStyle = wrap
    ? { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }
    : { flexDirection: 'row', gap: spacing.sm };
  return <View style={rowStyle}>{children}</View>;
}

function Swatch({
  label,
  hex,
  textColor,
  bordered = false,
}: {
  label: string;
  hex: string;
  textColor: string;
  bordered?: boolean;
}) {
  return (
    <View
      style={[
        styles.swatch,
        { backgroundColor: hex },
        bordered ? { borderWidth: 1, borderColor: colors.sand[300] } : null,
      ]}
    >
      <Text style={[styles.swatchLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.swatchLabel, { color: textColor }]}>{hex}</Text>
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
    gap: spacing.lg,
  },
  pageTitle: {
    ...typography.display,
    color: colors.text.primary,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  typographySample: {
    color: colors.text.primary,
  },
  spacingSample: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  spacingBox: {
    backgroundColor: colors.brand[300],
    borderRadius: radius.sm,
  },
  spacingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  swatch: {
    flexGrow: 1,
    flexBasis: '28%',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  swatchLabel: {
    ...typography.caption,
  },
});
