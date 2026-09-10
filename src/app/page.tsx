import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 dark:bg-black">
      <main className="w-full max-w-2xl space-y-10">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-widest text-neutral-400">
            AIFDM
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
            Your marketing team, thinking every day.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            Connect your website. Every morning you get a short ranked list of
            the highest-leverage marketing actions, each with reasoning,
            evidence, and expected impact. Approve them and we execute, measure,
            and learn.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="flex h-11 items-center justify-center rounded-md bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="flex h-11 items-center justify-center rounded-md border border-neutral-300 px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
          >
            Sign in
          </Link>
        </div>

        <div className="grid gap-6 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              It learns your business
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              We read your site and build a fact base you can correct. Your
              corrections stick.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Nothing invented
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Every draft is checked against those facts. Unsupported claims get
              flagged before you see them.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              It gets better
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Say why you rejected something. It stops suggesting things that
              don&apos;t fit.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}