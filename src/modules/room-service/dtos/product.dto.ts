/** Categoría tal como viaja en el wire (snake_case); el mapper la traduce a `ProductCategory`. */
export type ProductCategoryDTO = 'minibar' | 'shop' | 'food_and_beverage' | 'other';

/**
 * Forma cruda de un producto, tal como la devuelve
 * `GET /api/v1/room-service/products` (`RoomServiceProductResponse` del
 * backend, en camelCase). Solo lista productos activos. El precio viaja en
 * centavos enteros; no expone imagen, existencias ni tiempo de preparación.
 */
export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategoryDTO;
  priceCents: number;
  currency: string;
  active: boolean;
}
