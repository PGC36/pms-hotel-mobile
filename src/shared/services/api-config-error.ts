export class ApiConfigError extends Error {
  constructor() {
    super('La URL del servidor no está configurada (EXPO_PUBLIC_API_BASE_URL).');
    this.name = 'ApiConfigError';
  }
}
