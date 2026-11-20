import { clearToken, getToken } from "./tokenStore";

const BASE_URL = (
  import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_URL ?? "/api")
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [field, messages] of Object.entries(this.errors ?? {})) {
      if (messages?.length) out[field] = messages[0];
    }
    return out;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON serialisable, ou `FormData` (multipart, le Content-Type est alors laissé au navigateur). */
  body?: unknown;
  /** Token explicite ; `null` = aucune authentification. Défaut : token stocké. */
  token?: string | null;
};

function statusFallbackMessage(status: number): string {
  if (status === 401) return "Session expirée. reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 404) return "Ressource introuvable.";
  if (status === 429) return "Trop de requêtes. Réessaie dans un instant.";
  if (status === 500) return "Erreur serveur. Réessaie plus tard.";
  return `Erreur ${status}.`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const token = options.token === undefined ? getToken() : options.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Impossible de contacter le serveur. Vérifie ta connexion.");
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: Record<string, string[]> };
    const message = payload.message || statusFallbackMessage(response.status);
    const error = new ApiError(response.status, message, payload.errors);
    if (response.status === 401 && token) {
      clearToken();
      unauthorizedHandler?.();
    }
    throw error;
  }

  return data as T;
}

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (Object.keys(e.fieldErrors).length) return Object.values(e.fieldErrors).join(" · ");
    return e.message;
  }
  return (e as Error).message;
}

/** Normalise une liste qui peut renvoyer `[...]` ou `{ data: [...] }`. */
export function listOf<T>(res: T[] | { data: T[] }): T[] {
  return Array.isArray(res) ? res : res.data;
}
