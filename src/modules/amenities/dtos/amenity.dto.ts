export const AMENITY_CATEGORIES = [
  'pool',
  'gym',
  'spa',
  'restaurant',
  'bar',
  'business',
  'kids',
] as const;

export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

/** Forma cruda de una amenidad, tal como la expondría `GET /amenities/:id`. */
export interface AmenityDTO {
  id: string;
  name: string;
  description: string;
  category: AmenityCategory;
  location: string;
  opening_time: string;
  closing_time: string;
  image_url: string;
  is_active: boolean;
}
