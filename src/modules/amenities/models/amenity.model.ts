import type { AmenityCategory } from '../dtos/amenity.dto';

export interface AmenityModel {
  id: string;
  name: string;
  description?: string;
  category: AmenityCategory;
  location?: string;
  opensAt?: string;
  closesAt?: string;
  /** "08:00 – 22:00", o "Abierto las 24 horas" si no tiene horario (servicio continuo). */
  scheduleLabel: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
}
