import { DebateResult } from '../types/debate';

export function encodeDebate(result: DebateResult): string {
  try {
    const jsonStr = JSON.stringify(result);
    // Base64 encode and make it URL safe
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Failed to encode debate", e);
    return '';
  }
}

export function decodeDebate(encoded: string): DebateResult | null {
  try {
    // Revert URL safe characters to standard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with = if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonStr) as DebateResult;
  } catch (e) {
    console.error("Failed to decode debate", e);
    return null;
  }
}
