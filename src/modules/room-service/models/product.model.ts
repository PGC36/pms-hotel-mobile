export const PRODUCT_CATEGORIES = ['foodAndBeverage', 'minibar', 'shop', 'other'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Texto visible de cada categoría, en el orden de `PRODUCT_CATEGORIES`. */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  foodAndBeverage: 'Alimentos y bebidas',
  minibar: 'Minibar',
  shop: 'Tienda',
  other: 'Otros',
};

export interface ProductModel {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  /** Centavos enteros, tal como los calcula el backend. Se formatean solo al mostrarlos. */
  priceCents: number;
  currency: string;
  active: boolean;
}

export interface ProductCategoryGroup {
  category: ProductCategory;
  label: string;
  products: ProductModel[];
}

/**
 * Agrupa para mostrar: categorías en el orden de `PRODUCT_CATEGORIES` (solo
 * las que tienen productos) y, dentro de cada una, el orden recibido.
 */
export function groupProductsByCategory(products: ProductModel[]): ProductCategoryGroup[] {
  return PRODUCT_CATEGORIES.map((category) => ({
    category,
    label: PRODUCT_CATEGORY_LABELS[category],
    products: products.filter((product) => product.category === category),
  })).filter((group) => group.products.length > 0);
}
