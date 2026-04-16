import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';
import { verifyPassword, generateSessionId, getSessionExpiration } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }

    const userResult = await query(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = userResult.rows[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const sessionId = generateSessionId();
    const expiresAt = getSessionExpiration();
    await query(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionId, user.id, expiresAt]
    );

    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30
    });

    return json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return json({ error: 'Login failed' }, { status: 500 });
  }
};
