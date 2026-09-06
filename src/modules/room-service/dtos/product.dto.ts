export const PRODUCT_CATEGORIES = [
  'breakfast',
  'lunch',
  'dinner',
  'beverages',
  'desserts',
  'snacks',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Forma cruda de un producto del menú, tal como la expondría `GET /products/:id`. */
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  image_url: string;
  is_available: boolean;
  preparation_time_minutes: number;
}
