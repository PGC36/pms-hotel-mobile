import type { UserDTO } from '../dtos/user.dto';
import type { UserModel } from '../models/user.model';

export function mapUserDTOToModel(dto: UserDTO): UserModel {
  return {
    id: dto.id,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    isActive: dto.is_active,
    avatarUrl: dto.avatar_url,
    createdAt: new Date(dto.created_at),
  };
}
