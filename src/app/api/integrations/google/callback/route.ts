import { db } from "@/lib/db";
import { requireOrg } from "@/lib/tenancy";
import { encrypt } from "@/lib/crypto/envelope";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { organizationId } = await requireOrg({ minRole: "ADMIN" });

  const code = req.nextUrl.searchParams.get("code");
  const workspaceId = req.nextUrl.searchParams.get("state");

  if (!code || !workspaceId) {
    return NextResponse.redirect(new URL("/dashboard/websites", req.url));
  }

  const workspace = await db.workspace.findFirst({
    where: { id: workspaceId, organizationId },
  });
  if (!workspace) {
    return NextResponse.redirect(new URL("/dashboard/websites", req.url));
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    console.error("Token exchange failed:", await res.text());
    return NextResponse.redirect(new URL("/dashboard/websites", req.url));
  }

  const tokens = await res.json();

  const integration = await db.integration.upsert({
    where: {
      workspaceId_provider: { workspaceId, provider: "google_search_console" },
    },
    create: { workspaceId, provider: "google_search_console", status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  await db.credential.upsert({
    where: { integrationId: integration.id },
    create: {
      integrationId: integration.id,
      encryptedPayload: encrypt(JSON.stringify(tokens)),
      expiresAt,
    },
    update: {
      encryptedPayload: encrypt(JSON.stringify(tokens)),
      expiresAt,
    },
  });

  return NextResponse.redirect(
    new URL("/dashboard/websites/" + workspaceId, req.url)
  );
}