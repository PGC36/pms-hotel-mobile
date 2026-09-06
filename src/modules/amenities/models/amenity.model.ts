import type { AmenityCategory } from '../dtos/amenity.dto';

export interface AmenityModel {
  id: string;
  name: string;
  description: string;
  category: AmenityCategory;
  location: string;
  openingTime: string;
  closingTime: string;
  /** Calculado: "08:00 – 22:00", listo para mostrar sin volver a formatear. */
  scheduleLabel: string;
  imageUrl: string;
  isActive: boolean;
}
