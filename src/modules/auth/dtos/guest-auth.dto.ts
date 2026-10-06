export interface GuestLoginRequestDTO {
  email: string;
  password: string;
}

export interface GuestLoginResponseDTO {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
