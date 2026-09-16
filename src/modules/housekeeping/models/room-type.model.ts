export interface RoomTypeModel {
  id: string;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  bedConfiguration: string;
  roomFeatureIds: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
