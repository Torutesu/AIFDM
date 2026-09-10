import { requireOrg } from "@/lib/tenancy";
import { googleRedirectUri } from "@/lib/integrations/google/redirect-uri";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await requireOrg({ minRole: "ADMIN" });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    state: workspaceId,
  });

  return NextResponse.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );
}