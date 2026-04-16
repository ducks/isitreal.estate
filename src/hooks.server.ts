import type { Handle } from '@sveltejs/kit';
import { query } from '$lib/db';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.is_admin, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (result.rows.length > 0) {
      event.locals.user = result.rows[0];
    } else {
      // Expired or invalid session — clear cookie
      event.cookies.delete('session', { path: '/' });
    }
  }

  return resolve(event);
};
