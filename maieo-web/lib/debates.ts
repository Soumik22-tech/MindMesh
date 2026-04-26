import sql from './db'
import { DebateResult } from '@/types/debate'

export interface DbDebate {
  id: string
  user_id: string
  query: string
  result?: DebateResult
  share_id: string
  is_public: boolean
  created_at: string
}

export async function saveDebate(
  userId: string,
  query: string,
  result: DebateResult
): Promise<DbDebate> {
  const rows = await sql`
    INSERT INTO debates (user_id, query, result)
    VALUES (${userId}, ${query}, ${JSON.stringify(result)}::jsonb)
    RETURNING id, user_id, query, share_id, is_public, created_at
  `
  return rows[0] as DbDebate
}

export async function getUserDebates(userId: string): Promise<DbDebate[]> {
  const rows = await sql`
    SELECT id, user_id, query, result, share_id, is_public, created_at
    FROM debates
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return rows as DbDebate[]
}

export async function getDebateByShareId(
  shareId: string
): Promise<DbDebate | null> {
  const rows = await sql`
    SELECT id, user_id, query, result, share_id, is_public, created_at
    FROM debates
    WHERE share_id = ${shareId} AND is_public = true
  `
  if (rows.length === 0) return null
  return rows[0] as DbDebate
}

export async function deleteDebate(
  id: string,
  userId: string
): Promise<void> {
  await sql`
    DELETE FROM debates
    WHERE id = ${id} AND user_id = ${userId}
  `
}

export async function makeDebatePublic(
  shareId: string,
  userId: string
): Promise<void> {
  await sql`
    UPDATE debates SET is_public = true
    WHERE share_id = ${shareId} AND user_id = ${userId}
  `
}
