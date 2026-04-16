import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address_id, listing_accurate, rating, body, visited_at } = await request.json();

  if (!address_id || !listing_accurate || !rating) {
    return json({ error: 'address_id, listing_accurate, and rating are required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO reviews (address_id, user_id, listing_accurate, rating, body, visited_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [address_id, locals.user.id, listing_accurate, rating, body || null, visited_at || null]
  );

  return json(result.rows[0], { status: 201 });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = url.searchParams.get('id');
  if (!id) {
    return json({ error: 'Missing id' }, { status: 400 });
  }

  // Allow review owner or admin to delete
  if (locals.user.is_admin) {
    await query('DELETE FROM reviews WHERE id = $1', [id]);
  } else {
    await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, locals.user.id]);
  }

  return json({ success: true });
};
