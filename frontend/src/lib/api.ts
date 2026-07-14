const TOKEN_KEY = "meetingly_token"

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore quota / private mode
  }
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken()
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/** Extract a readable error string from FastAPI-style error bodies. */
export function formatApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  const detail = (payload as { detail?: unknown }).detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: string }).msg)
        }
        return JSON.stringify(item)
      })
      .join(", ")
  }
  if (detail != null) return JSON.stringify(detail)
  return fallback
}

export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  // Don't force Content-Type for FormData — browser sets boundary
  return fetch(input, { ...init, headers })
}
