import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import type { GuestRoomServiceStackParamList } from '@/navigation/routes';
import { colors, spacing, typography } from '@/shared/theme';
import { useCart } from '@/modules/cart/context/CartContext';
import type { ProductCategory, ProductModel } from '../../models/product.model';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductCard } from '../components/ProductCard';
import { getGuestProducts } from '../services/guest-room-service.service';

type Navigation = NativeStackNavigationProp<GuestRoomServiceStackParamList, 'Menu'>;

export function MenuScreen() {
  const navigation = useNavigation<Navigation>();
  const cart = useCart();
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setProducts(await getGuestProducts());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el menú.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const visible = products.filter((product) =>
    (category === null || product.category === category) &&
    `${product.name} ${product.description ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  if (loading && products.length === 0) return <LoadingState message="Cargando menú..." />;
  if (error && products.length === 0) return <ErrorState title="No pudimos cargar el menú" description={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Buscar productos" placeholderTextColor={colors.text.muted} style={styles.search} accessibilityLabel="Buscar productos" />
        <CategoryTabs value={category} onChange={setCategory} />
        <Button label={`Carrito (${cart.items.reduce((total, item) => total + item.quantity, 0)})`} variant="secondary" onPress={() => navigation.navigate('Cart')} />
        <Button label="Mis pedidos" variant="secondary" onPress={() => navigation.navigate('Orders')} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No hay productos" description="Prueba otra categoría o vuelve más tarde." />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onOpen={() => navigation.navigate('ProductDetail', { product: item })}
            onAdd={() => cart.add(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  top: { gap: spacing.sm, paddingVertical: spacing.sm },
  search: { ...typography.body, marginHorizontal: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.sand[300], borderRadius: 6, backgroundColor: colors.white, color: colors.text.primary },
  list: { paddingTop: spacing.sm, paddingBottom: spacing.xl, flexGrow: 1 },
  error: { ...typography.caption, color: colors.state.danger, marginHorizontal: spacing.md },
});
