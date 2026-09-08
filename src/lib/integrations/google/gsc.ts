import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto/envelope";

type Tokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

async function getAccessToken(integrationId: string): Promise<string> {
  const credential = await db.credential.findUnique({
    where: { integrationId },
  });
  if (!credential) throw new Error("No credential for integration");

  const tokens: Tokens = JSON.parse(decrypt(credential.encryptedPayload));

  const expired =
    !credential.expiresAt || credential.expiresAt.getTime() < Date.now() + 60_000;

  if (!expired) return tokens.access_token;

  if (!tokens.refresh_token) {
    throw new Error("Token expired and no refresh token available");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh token: " + (await res.text()));

  const fresh = await res.json();
  const merged = { ...tokens, ...fresh };

  await db.credential.update({
    where: { integrationId },
    data: {
      encryptedPayload: encrypt(JSON.stringify(merged)),
      expiresAt: fresh.expires_in
        ? new Date(Date.now() + fresh.expires_in * 1000)
        : null,
    },
  });

  return merged.access_token;
}

export async function listSites(integrationId: string) {
  const token = await getAccessToken(integrationId);

  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) throw new Error("Failed to list sites: " + (await res.text()));

  const data = await res.json();
  return (data.siteEntry ?? []).map((s: { siteUrl: string }) => ({
    siteUrl: s.siteUrl,
  }));
}

export async function fetchSearchAnalytics({
  integrationId,
  siteUrl,
  days = 90,
}: {
  integrationId: string;
  siteUrl: string;
  days?: number;
}) {
  const token = await getAccessToken(integrationId);

  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const res = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites/" +
      encodeURIComponent(siteUrl) +
      "/searchAnalytics/query",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ["query", "page"],
        rowLimit: 1000,
      }),
    }
  );

  if (!res.ok) throw new Error("GSC query failed: " + (await res.text()));

  const data = await res.json();
  type Row = {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  };

  return (data.rows ?? []).map((row: Row) => ({
    query: row.keys?.[0] ?? "",
    page: row.keys?.[1] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}