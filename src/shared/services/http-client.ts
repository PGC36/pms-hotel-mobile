/**
 * Wrapper de `fetch` listo para cuando exista una API real. Ningún servicio lo
 * usa todavía — hoy todos leen de `data/db.ts` — pero cuando llegue el
 * backend, el cambio queda contenido aquí y dentro de cada `*.service.ts`,
 * sin tocar Models ni pantallas (architecture.md sección 2).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

async function request<T>(path: string, init: RequestInit, config: HttpClientConfig): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }, config),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }, config),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, config),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, config),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }, config),
  };
}
