import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';
import { hashPassword, generateSessionId, getSessionExpiration } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check for existing user
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      return json({ error: 'Username or email already taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // Create session
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

    return json({ user }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return json({ error: 'Signup failed' }, { status: 500 });
  }
};
