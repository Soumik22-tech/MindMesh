import { DebateResult } from '../types/debate';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let currentAbortController: AbortController | null = null;

export function stopDebate() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

export async function runDebate(query: string): Promise<DebateResult> {
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  const response = await fetch('/api/debate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });

  currentAbortController = null;

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Debate failed');
  }
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
