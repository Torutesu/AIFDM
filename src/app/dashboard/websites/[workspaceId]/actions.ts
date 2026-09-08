"use server";

import { updateFact } from "@/lib/brain/queries";
import { revalidatePath } from "next/cache";

export async function saveFact(
  factId: string,
  data: { value?: string; isUserLocked?: boolean }
) {
  try {
    await updateFact(factId, data);
    revalidatePath("/dashboard/websites");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save" };
  }
}