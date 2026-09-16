import type { ProductDTO } from '../dtos/product.dto';
import type { ProductModel } from '../models/product.model';

export function mapProductDTOToModel(dto: ProductDTO): ProductModel {
  return {
    id: dto.id,
    sku: dto.sku,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    priceCents: dto.price_cents,
    currency: dto.currency,
    stockQuantity: dto.stock_quantity,
    reorderLevel: dto.reorder_level,
    active: dto.active,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    imageUrl: dto.image_url,
    preparationTimeMinutes: dto.preparation_time_minutes,
  };
}
