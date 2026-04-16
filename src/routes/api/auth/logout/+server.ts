import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  if (sessionId) {
    await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    cookies.delete('session', { path: '/' });
  }
  return json({ success: true });
};
