import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveDebate } from '@/lib/debates';

const PYTHON_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query } = body;
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call the Python FastAPI backend
    const backendRes = await fetch(`${PYTHON_API}/debate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json(
        { error: 'Debate backend failed', detail: errText },
        { status: backendRes.status }
      );
    }

    const result = await backendRes.json();

    // Persist to Neon DB — graceful degradation if it fails
    try {
      const saved = await saveDebate(userId, query, result);
      return NextResponse.json({
        ...result,
        _db_id: saved.id,
        _share_id: saved.share_id,
      });
    } catch (dbErr) {
      console.error('DB save failed:', dbErr);
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    console.error('Debate API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
