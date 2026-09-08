import { inngest } from "@/inngest/client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    const first = await step.run("step-one", async () => {
      return `Hello ${event.data.name ?? "world"}`;
    });

    await step.sleep("wait-a-moment", "2s");

    const second = await step.run("step-two", async () => {
      return `${first} — done at ${new Date().toISOString()}`;
    });

    return { message: second };
  }
);