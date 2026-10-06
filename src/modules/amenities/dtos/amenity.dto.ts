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

export interface AmenityDTO {
  id: string;
  name: string;
  description: string;
  category: AmenityCategory;
  location: string;
  opensAt: string;
  closesAt: string;
  active: boolean;
}
