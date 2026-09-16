import type { Currency } from '@/shared/utils/formatters';
import type { ProductCategory } from '../dtos/product.dto';

export interface ProductModel {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  priceCents: number;
  currency: Currency;
  stockQuantity: number;
  reorderLevel: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  preparationTimeMinutes?: number;
}
