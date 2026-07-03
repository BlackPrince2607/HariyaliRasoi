/**
 * API base URL resolution.
 *
 * LAN dev (http://192.168.x.x:3000): browser uses same-origin "" so Next.js
 * rewrites /api/* → localhost:8000 on the dev machine. Only port 3000 must
 * be open on the firewall — not 8000.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const internal =
    process.env.API_INTERNAL_URL || envUrl.replace("localhost", "127.0.0.1");

  if (typeof window === "undefined") {
    return internal;
  }

  // Production: frontend and API on different hosts (e.g. Vercel + cloud API)
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    try {
      const apiHost = new URL(envUrl).hostname;
      if (apiHost !== window.location.hostname) {
        return envUrl;
      }
    } catch {
      /* use proxy fallback */
    }
  }

  const { hostname } = window.location;

  // Same-machine dev in browser
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return envUrl;
  }

  // LAN / network dev — proxy through Next.js rewrites
  return "";
}
