import type { ProductCategory } from '../dtos/product.dto';

export interface ProductModel {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
}
