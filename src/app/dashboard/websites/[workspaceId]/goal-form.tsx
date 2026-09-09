"use client";

import { useState, useTransition } from "react";
import { addGoal } from "./actions";

export function GoalForm({ workspaceId }: { workspaceId: string }) {
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("500");
  const [metricType, setMetricType] = useState("signups");
  const [days, setDays] = useState("90");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addGoal({
        workspaceId,
        description,
        metricType,
        targetValue: Number(targetValue),
        days: Number(days),
      });
      if (result.error) setError(result.error);
      else setDescription("");
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm font-medium">Set a goal</p>

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What are you trying to achieve?"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="flex gap-2">
        <input
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          type="number"
          className="w-24 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <select
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="signups">signups</option>
          <option value="visitors">visitors</option>
          <option value="customers">customers</option>
          <option value="leads">leads</option>
        </select>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-32 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="30">in 30 days</option>
          <option value="60">in 60 days</option>
          <option value="90">in 90 days</option>
        </select>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        onClick={submit}
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Planning…" : "Set goal & find opportunities"}
      </button>
    </div>
  );
}