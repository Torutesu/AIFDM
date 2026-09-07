"use client";

import { useState, useTransition } from "react";
import { addWorkspace } from "./actions";

export function WorkspaceForm() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addWorkspace(name, domain);
      if (result?.error) setError(result.error);
      else {
        setName("");
        setDomain("");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Add a website</h2>
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Name (e.g. Acme)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Domain (e.g. acme.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={submit}
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
    </div>
  );
}