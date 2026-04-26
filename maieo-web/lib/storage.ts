import { DebateResult } from '../types/debate';

export interface SavedDebate {
  id: string;
  query: string;
  timestamp: string;
  result: DebateResult;
  shareId?: string;  // Neon DB share_id for public sharing
}

const STORAGE_KEY = 'mindmesh_history';

export function saveDebate(result: DebateResult): string {
  const id = crypto.randomUUID();
  const history = getHistory();
  
  const savedDebate: SavedDebate = {
    id,
    query: result.query,
    timestamp: new Date().toISOString(),
    result
  };
  
  history.unshift(savedDebate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  
  return id;
}

export function getHistory(): SavedDebate[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse debate history', e);
    return [];
  }
}

export function getDebateById(id: string): DebateResult | null {
  const history = getHistory();
  const debate = history.find(d => d.id === id);
  return debate ? debate.result : null;
}

export function deleteDebate(id: string): void {
  const history = getHistory();
  const updatedHistory = history.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
