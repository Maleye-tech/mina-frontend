import { clearToken, getToken } from "./tokenStore";

const getBaseUrl = (): string => {
  // Sur localhost (ports 5173, 5174, etc.), toujours utiliser le proxy relatif "/api"
  // configuré dans Vite pour contourner le blocage CORS du backend Render.
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "/api";
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl === "/api" || import.meta.env.PROD) {
    return "/api";
  }
  return envUrl.replace(/\/+$/, "");
};

const BASE_URL = getBaseUrl();

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
  if (status === 401) return "Ta session a expiré. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 404) return "Ressource introuvable.";
  if (status === 422) return "Les données envoyées sont invalides.";
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
    throw new ApiError(
      0,
      "Impossible de contacter le serveur Mina (le backend Render peut être en cours de réveil). Vérifie ta connexion ou réessaie dans quelques instants.",
    );
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
    const serverMessage = payload.message?.trim();
    const genericMessages: Record<number, string[]> = {
      401: ["Unauthenticated."],
      403: ["Forbidden.", "This action is unauthorized."],
      404: ["Not Found."],
      429: ["Too Many Attempts."],
    };
    let message =
      serverMessage && !genericMessages[response.status]?.includes(serverMessage)
        ? serverMessage
        : statusFallbackMessage(response.status);
    if (message.includes("BREVO_FROM_EMAIL")) {
      message =
        "Erreur de configuration du serveur : la variable BREVO_FROM_EMAIL (ou MAIL_FROM_ADDRESS) n'est pas configurée avec une adresse email valide sur Render.";
    }
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
