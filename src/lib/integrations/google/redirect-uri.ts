import type { NextRequest } from "next/server";

/**
 * The OAuth redirect URI to hand Google.
 *
 * Google compares this string byte for byte between the authorisation request
 * and the token exchange, so both steps must derive it the same way — hence
 * one helper rather than two call sites reading the environment.
 *
 * Set GOOGLE_REDIRECT_URI to pin it. With it unset the URI follows whatever
 * host the request arrived on, which is what you want before a domain is
 * settled: the same deployment works on its *.vercel.app URL and on a custom
 * domain added later, with no redeploy.
 *
 * Either way the URI still has to be registered in Google Cloud. Deriving it
 * only removes the chance of the app and the console disagreeing about it.
 */
export function googleRedirectUri(req: NextRequest): string {
  const pinned = process.env.GOOGLE_REDIRECT_URI;
  if (pinned) return pinned;

  // Behind Vercel's proxy the forwarded headers carry the browser-visible host;
  // req.nextUrl can carry the internal one.
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return proto + "://" + host + "/api/integrations/google/callback";
}
