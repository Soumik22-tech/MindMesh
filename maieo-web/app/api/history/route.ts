import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserDebates } from '@/lib/debates';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const debates = await getUserDebates(userId);
    return NextResponse.json(debates);
  } catch (error: unknown) {
    console.error('History API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
