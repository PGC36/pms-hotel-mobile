import type { ProductCategoryDTO, ProductDTO } from '../dtos/product.dto';
import type { ProductCategory, ProductModel } from '../models/product.model';

const PRODUCT_CATEGORY_FROM_DTO: Record<ProductCategoryDTO, ProductCategory> = {
  minibar: 'minibar',
  shop: 'shop',
  food_and_beverage: 'foodAndBeverage',
  other: 'other',
};

const PRODUCT_CATEGORY_TO_DTO: Record<ProductCategory, ProductCategoryDTO> = {
  minibar: 'minibar',
  shop: 'shop',
  foodAndBeverage: 'food_and_beverage',
  other: 'other',
};

/** Para el filtro `?category=` de `GET /room-service/products`. */
export function mapProductCategoryToDTO(category: ProductCategory): ProductCategoryDTO {
  return PRODUCT_CATEGORY_TO_DTO[category];
}

export function mapProductDTOToModel(dto: ProductDTO): ProductModel {
  return {
    id: dto.id,
    sku: dto.sku,
    name: dto.name,
    description: dto.description ?? null,
    category: PRODUCT_CATEGORY_FROM_DTO[dto.category],
    priceCents: dto.priceCents,
    currency: dto.currency,
    active: dto.active,
  };
}
