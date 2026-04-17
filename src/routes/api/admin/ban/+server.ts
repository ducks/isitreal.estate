import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.is_admin) {
    return json({ error: 'Admin access required' }, { status: 403 });
  }

  const { user_id, reason } = await request.json();

  if (!user_id) {
    return json({ error: 'user_id is required' }, { status: 400 });
  }

  // Don't allow banning yourself
  if (user_id === locals.user.id) {
    return json({ error: 'Cannot ban yourself' }, { status: 400 });
  }

  await query(
    `UPDATE users SET banned = true, banned_at = NOW(), ban_reason = $2 WHERE id = $1`,
    [user_id, reason || null]
  );

  // Kill all their sessions
  await query('DELETE FROM sessions WHERE user_id = $1', [user_id]);

  return json({ success: true });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user?.is_admin) {
    return json({ error: 'Admin access required' }, { status: 403 });
  }

  const userId = url.searchParams.get('user_id');
  if (!userId) {
    return json({ error: 'user_id is required' }, { status: 400 });
  }

  await query(
    `UPDATE users SET banned = false, banned_at = NULL, ban_reason = NULL WHERE id = $1`,
    [userId]
  );

  return json({ success: true });
};
