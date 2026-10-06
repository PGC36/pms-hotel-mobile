import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/shared/components/Button';
import { spacing } from '@/shared/theme';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, type ProductCategory } from '../../models/product.model';

export function CategoryTabs({ value, onChange }: { value: ProductCategory | null; onChange: (category: ProductCategory | null) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Button label="Todo" variant={value === null ? 'primary' : 'secondary'} onPress={() => onChange(null)} />
      {PRODUCT_CATEGORIES.map((category) => (
        <Button key={category} label={PRODUCT_CATEGORY_LABELS[category]} variant={value === category ? 'primary' : 'secondary'} onPress={() => onChange(category)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { gap: spacing.xs, paddingHorizontal: spacing.md } });
