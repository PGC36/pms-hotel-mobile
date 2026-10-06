import type { ProductModel } from '@/modules/room-service/models/product.model';

export interface CartItemModel {
  product: ProductModel;
  quantity: number;
}
