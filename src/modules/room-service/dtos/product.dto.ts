import type { Currency } from '@/shared/utils/formatters';

/**
 * Taxonomía provisional — docs/HANDOFF-MOVIL.md sección 7.3 (D-005). Se
 * adoptan los literales actuales del contrato tal cual; no se construye
 * ninguna pantalla que agrupe el menú por esta categoría.
 */
export const PRODUCT_CATEGORIES = ['minibar', 'shop', 'food_and_beverage', 'other'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Forma cruda de un producto del menú, tal como la expondría
 * `GET /products/:id`. Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.6.
 * Móvil solo lee esta entidad.
 */
export interface ProductDTO {
  id: string;
  /** Formato provisional (sección 7.2 del handoff) — no validar ni parsear. */
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price_cents: number;
  currency: Currency;
  stock_quantity: number;
  reorder_level: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  /**
   * Campos que el contrato no define para `product` (ver
   * PROGRESO-CONTRATO.md). Se conservan, no se borran sin coordinar.
   */
  image_url?: string;
  preparation_time_minutes?: number;
}
