import { apiClient } from '@/shared/services/api-client';

import type { ProductDTO } from '../dtos/product.dto';
import { mapProductCategoryToDTO, mapProductDTOToModel } from '../mappers/product.mapper';
import type { ProductCategory, ProductModel } from '../models/product.model';
import { callRoomServiceApi } from './room-service-error';

/**
 * Menú de Room Service contra la API real (`GET /room-service/products`,
 * MOV-10). El backend solo devuelve productos activos, ordenados por nombre;
 * no expone imagen, existencias ni tiempo de preparación.
 */
export async function getProducts(category?: ProductCategory): Promise<ProductModel[]> {
  const query = category
    ? `?${new URLSearchParams({ category: mapProductCategoryToDTO(category) }).toString()}`
    : '';
  const products = await callRoomServiceApi(() =>
    apiClient.get<ProductDTO[] | undefined>(`/room-service/products${query}`),
  );
  return (products ?? []).map(mapProductDTOToModel);
}
