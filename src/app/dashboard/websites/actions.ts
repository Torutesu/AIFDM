"use server";

import { createWorkspace } from "@/lib/workspaces";
import { revalidatePath } from "next/cache";

export async function addWorkspace(name: string, domain: string) {
  try {
    await createWorkspace(name, domain);
    revalidatePath("/dashboard");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}