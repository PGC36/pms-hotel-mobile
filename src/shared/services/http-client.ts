/**
 * Wrapper de `fetch` para la API real. Los servicios no lo instancian
 * directamente: usan `apiClient` (`api-client.ts`), que ya trae la base URL
 * y el token. Así, cambiar el origen del dato queda contenido aquí y dentro
 * de cada `*.service.ts`, sin tocar Models ni pantallas (architecture.md
 * sección 2).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Cuerpo de la respuesta de error tal como llegó (JSON parseado o texto), si lo hubo. */
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  /** Si devuelve un token, se envía como `Authorization: Bearer <token>`. */
  getAuthToken?: () => Promise<string | null>;
}

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const target = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Lee el cuerpo sin asumir que existe: 204, cuerpo vacío o texto no JSON no
 * deben romper con `response.json()`. Devuelve `undefined` si no hay cuerpo.
 */
async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;

  const text = await response.text();
  if (text.trim().length === 0) return undefined;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return text;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  config: HttpClientConfig,
): Promise<T> {
  // Los headers explícitos del llamador mandan; los de abajo solo se agregan
  // si no vienen ya definidos (comparación sin distinguir mayúsculas).
  const headers: Record<string, string> = { ...config.headers };
  const hasBody = body !== undefined;

  if (!hasHeader(headers, 'Accept')) headers.Accept = 'application/json';
  if (hasBody && !hasHeader(headers, 'Content-Type')) headers['Content-Type'] = 'application/json';

  if (config.getAuthToken && !hasHeader(headers, 'Authorization')) {
    const token = await config.getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(joinUrl(config.baseUrl, path), {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const statusText = response.statusText ? `: ${response.statusText}` : '';
    throw new HttpError(response.status, `HTTP ${response.status}${statusText}`, data);
  }

  return data as T;
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  return {
    get: <T>(path: string) => request<T>('GET', path, undefined, config),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body, config),
    put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body, config),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body, config),
    delete: <T>(path: string) => request<T>('DELETE', path, undefined, config),
  };
}
