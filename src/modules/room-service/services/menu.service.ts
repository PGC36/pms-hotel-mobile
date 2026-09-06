import { productsDB } from '@/data/db';
import { delay } from '@/shared/services/delay';

import { mapProductDTOToModel } from '../mappers/product.mapper';
import type { ProductCategory } from '../dtos/product.dto';
import type { ProductModel } from '../models/product.model';

export async function getProducts(): Promise<ProductModel[]> {
  await delay();
  return productsDB.map(mapProductDTOToModel);
}

export async function getProductsByCategory(category: ProductCategory): Promise<ProductModel[]> {
  await delay();
  return productsDB.filter((product) => product.category === category).map(mapProductDTOToModel);
}

export async function getProductById(id: string): Promise<ProductModel | null> {
  await delay();
  const found = productsDB.find((product) => product.id === id);
  return found ? mapProductDTOToModel(found) : null;
}
