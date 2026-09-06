import type { ProductDTO } from '../dtos/product.dto';
import type { ProductModel } from '../models/product.model';

export function mapProductDTOToModel(dto: ProductDTO): ProductModel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    price: dto.price,
    imageUrl: dto.image_url,
    isAvailable: dto.is_available,
    preparationTimeMinutes: dto.preparation_time_minutes,
  };
}
