/**
 * API base URL resolution.
 *
 * Browser always uses same-origin "" so Next.js rewrites `/api/*` → the backend.
 * That avoids CORS (any local port / LAN IP / production domain) and only requires
 * the frontend port to be reachable.
 *
 * Server components / Route Handlers use API_INTERNAL_URL (or NEXT_PUBLIC_API_URL).
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const internal =
    process.env.API_INTERNAL_URL || envUrl.replace("localhost", "127.0.0.1");

  if (typeof window === "undefined") {
    return internal;
  }

  return "";
}

/** Human-readable API URL for error messages (not the proxy base). */
export function getApiDisplayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
