/**
 * Sobre de paginación genérico, con la forma que expondría una API real
 * (snake_case, metadata explícita) en vez de solo un arreglo.
 */
export interface PaginationParamsDTO {
  page: number;
  page_size: number;
}

export interface PaginationDTO<T> {
  results: T[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
