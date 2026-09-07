import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let evt;

  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  try {
    if (type === "user.created" || type === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address;
      if (!email) return new Response("No email", { status: 400 });

      const name = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ") || null;

      await db.user.upsert({
        where: { authProviderId: data.id },
        create: { authProviderId: data.id, email, name },
        update: { email, name },
      });
    }

    if (type === "organization.created" || type === "organization.updated") {
      await db.organization.upsert({
        where: { slug: data.slug ?? data.id },
        create: { id: data.id, name: data.name, slug: data.slug ?? data.id },
        update: { name: data.name },
      });
    }

    if (type === "organizationMembership.created") {
      const user = await db.user.findUnique({
        where: { authProviderId: data.public_user_data.user_id },
      });
      if (!user) return new Response("User not found", { status: 404 });

      await db.membership.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: data.organization.id,
          },
        },
        create: {
          userId: user.id,
          organizationId: data.organization.id,
          role: data.role === "org:admin" ? "OWNER" : "MEMBER",
        },
        update: {},
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
}