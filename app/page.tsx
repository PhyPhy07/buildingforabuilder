'use client';

import { useState } from 'react';

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    roomSize: 'Room size',
    wallAreaSqFt: 'Wall area',
    ceilingAreaSqFt: 'Ceiling area',
    totalAreaSqFt: 'Total area',
    paintGallonsNeeded: 'Paint gallons',
    ceilingHeightFt: 'Ceiling height',
    paintCeiling: 'Paint ceiling',
    flooringType: 'Flooring type',
    areaSqFt: 'Area',
    costPerSqFtLow: 'Cost/sq ft (low)',
    costPerSqFtMid: 'Cost/sq ft (mid)',
    costPerSqFtHigh: 'Cost/sq ft (high)',
    lengthFt: 'Length',
    heightFt: 'Height',
    linearFt: 'Linear feet',
    fenceType: 'Material',
    costPerFtLow: 'Cost/ft (low)',
    costPerFtMid: 'Cost/ft (mid)',
    costPerFtHigh: 'Cost/ft (high)',
  };
  return labels[key] ?? key;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    extracted: Record<string, unknown>;
    estimate: {
      projectType: string;
      areaSqFt?: number;
      quantity?: number;
      costLow: number;
      costMid: number;
      costHigh: number;
      details: Record<string, string | number>;
    };
    clarifyingQuestions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      const questions = Array.isArray(data.extracted?.clarifyingQuestions)
        ? data.extracted.clarifyingQuestions
        : [];
      setResult({
        extracted: data.extracted,
        estimate: data.estimate,
        clarifyingQuestions: questions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          DIY Cost Estimator
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Describe your project and get AI-assisted guidance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="project"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Project description
            </label>
            <textarea
              id="project"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I want to paint a 12x14 bedroom with 8-foot ceilings"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Get response'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            {result.clarifyingQuestions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
                <h2 className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-200">
                  Clarifying questions
                </h2>
                <ul className="list-inside list-disc space-y-2 text-amber-900 dark:text-amber-100">
                  {result.clarifyingQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Your project
              </h2>
              <div className="space-y-4 text-zinc-900 dark:text-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    {result.estimate.projectType}
                  </span>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(result.estimate.details).map(([key, value]) => (
                    <Detail
                      key={key}
                      label={formatLabel(key)}
                      value={String(value)}
                    />
                  ))}
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
              <h2 className="mb-4 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Cost estimate
              </h2>
              <div className="space-y-2 text-emerald-900 dark:text-emerald-100">
                <p className="text-2xl font-semibold">
                  ${result.estimate.costLow.toLocaleString()} – ${result.estimate.costHigh.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Mid-range: ~${result.estimate.costMid.toLocaleString()}
                </p>
                {result.estimate.areaSqFt != null && result.estimate.projectType !== 'fence' && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {result.estimate.areaSqFt} sq ft
                    {result.estimate.projectType === 'painting' && result.estimate.quantity != null && (
                      <> · {result.estimate.quantity} gallons paint</>
                    )}
                  </p>
                )}
                {result.estimate.quantity != null && result.estimate.projectType === 'fence' && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {result.estimate.quantity} linear ft
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
