import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { review_id, reason } = await request.json();

  if (!review_id || !reason?.trim()) {
    return json({ error: 'review_id and reason are required' }, { status: 400 });
  }

  try {
    await query(
      `INSERT INTO reports (review_id, user_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (review_id, user_id) DO NOTHING`,
      [review_id, locals.user.id, reason.trim()]
    );

    return json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Report error:', err);
    return json({ error: 'Failed to submit report' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user?.is_admin) {
    return json({ error: 'Admin access required' }, { status: 403 });
  }

  const reviewId = url.searchParams.get('review_id');
  if (!reviewId) {
    return json({ error: 'review_id is required' }, { status: 400 });
  }

  await query('DELETE FROM reports WHERE review_id = $1', [reviewId]);
  return json({ success: true });
};
