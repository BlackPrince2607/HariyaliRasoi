/**
 * API base URL resolution.
 *
 * LAN dev (http://192.168.x.x:3000): browser uses same-origin "" so Next.js
 * rewrites /api/* → localhost:8000 on the dev machine. Only port 3000 must
 * be open on the firewall — not 8000.
 *
 * Production (custom domain + api subdomain): browser also uses "" so Vercel
 * rewrites /api/* → Railway — avoids CORS when CORS_ORIGINS is incomplete.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const internal =
    process.env.API_INTERNAL_URL || envUrl.replace("localhost", "127.0.0.1");

  if (typeof window === "undefined") {
    return internal;
  }

  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    try {
      const apiHost = new URL(envUrl).hostname;
      if (apiHost !== window.location.hostname) {
        return "";
      }
    } catch {
      /* use proxy fallback */
    }
  }

  const { hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return envUrl;
  }

  return "";
}

/** Human-readable API URL for error messages (not the proxy base). */
export function getApiDisplayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
