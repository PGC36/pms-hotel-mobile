import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';

import { groupProductsByCategory, type ProductModel } from '../../models/product.model';
import { getProducts } from '../../services/menu.service';
import { RoomServiceServiceError } from '../../services/room-service-error';

interface State {
  status: 'loading' | 'error' | 'ready';
  products: ProductModel[];
  isRefreshing: boolean;
  errorMessage: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; products: ProductModel[] }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'REFRESH_START' };

const initialState: State = {
  status: 'loading',
  products: [],
  isRefreshing: false,
  errorMessage: null,
};

/** `dispatch` (no setters de `useState`) para no disparar `react-hooks/set-state-in-effect`. */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', errorMessage: null };
    case 'FETCH_SUCCESS':
      return {
        status: 'ready',
        products: action.products,
        isRefreshing: false,
        errorMessage: null,
      };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', isRefreshing: false, errorMessage: action.message };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true };
    default:
      return state;
  }
}

/**
 * Menú de Room Service para el personal (MOV-10): solo consulta. Una sola
 * petición de productos, agrupados por categoría en el cliente. Muestra solo
 * lo que entrega el backend: nombre, descripción, categoría y precio.
 */
export function MenuScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_SUCCESS', products: await getProducts() });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        message:
          error instanceof RoomServiceServiceError
            ? error.message
            : 'Revisa tu conexión e intenta de nuevo.',
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH_START' });
    load();
  }, [load]);

  const sections = useMemo(
    () =>
      groupProductsByCategory(state.products).map((group) => ({
        key: group.category,
        title: group.label,
        data: group.products,
      })),
    [state.products],
  );

  if (state.status === 'loading') return <LoadingState message="Cargando menú..." />;
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudo cargar el menú"
        description={state.errorMessage ?? undefined}
        onRetry={retry}
      />
    );
  }

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(product) => product.id}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {section.title}
        </Text>
      )}
      renderItem={({ item, section }) => (
        <ProductRow product={item} categoryLabel={section.title} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={state.isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.brand[600]]}
          tintColor={colors.brand[600]}
        />
      }
      ListEmptyComponent={<EmptyState icon="🍽️" title="El menú no tiene productos disponibles." />}
    />
  );
}

function ProductRow({ product, categoryLabel }: { product: ProductModel; categoryLabel: string }) {
  const price = formatMoney(product.priceCents, product.currency);

  return (
    <Card
      style={styles.card}
      accessible
      accessibilityLabel={`${product.name}, ${categoryLabel}, ${price}${product.description ? `. ${product.description}` : ''}`}
    >
      <View style={styles.row}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  card: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  price: {
    ...typography.body,
    color: colors.text.primary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
