import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { review_id, vote } = await request.json();

  if (!review_id || !vote || !['accurate', 'not_accurate'].includes(vote)) {
    return json({ error: 'review_id and vote (accurate/not_accurate) are required' }, { status: 400 });
  }

  // Upsert — one vote per user per review
  await query(
    `INSERT INTO votes (review_id, user_id, vote)
     VALUES ($1, $2, $3)
     ON CONFLICT (review_id, user_id) DO UPDATE SET vote = $3, created_at = CURRENT_TIMESTAMP`,
    [review_id, locals.user.id, vote]
  );

  // Return updated counts
  const counts = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN vote = 'accurate' THEN 1 ELSE 0 END), 0)::int as accurate,
       COALESCE(SUM(CASE WHEN vote = 'not_accurate' THEN 1 ELSE 0 END), 0)::int as not_accurate
     FROM votes WHERE review_id = $1`,
    [review_id]
  );

  return json(counts.rows[0]);
};
