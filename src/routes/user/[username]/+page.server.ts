import type { PageServerLoad } from './$types';
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const userResult = await query(
    'SELECT id, username, created_at FROM users WHERE username = $1',
    [params.username]
  );

  if (userResult.rows.length === 0) {
    throw error(404, 'User not found');
  }

  const user = userResult.rows[0];

  const reviewsResult = await query(
    `SELECT r.*, a.street, a.city, a.state, a.zip, a.id as address_id,
       COALESCE(SUM(CASE WHEN v.vote = 'accurate' THEN 1 ELSE 0 END), 0)::int as accurate_count,
       COALESCE(SUM(CASE WHEN v.vote = 'not_accurate' THEN 1 ELSE 0 END), 0)::int as not_accurate_count
     FROM reviews r
     JOIN addresses a ON a.id = r.address_id
     LEFT JOIN votes v ON v.review_id = r.id
     WHERE r.user_id = $1
     GROUP BY r.id, a.street, a.city, a.state, a.zip, a.id
     ORDER BY r.created_at DESC`,
    [user.id]
  );

  // Credibility: % of their reviews voted accurate
  const totalVotes = reviewsResult.rows.reduce((s, r) => s + r.accurate_count + r.not_accurate_count, 0);
  const accurateVotes = reviewsResult.rows.reduce((s, r) => s + r.accurate_count, 0);
  const credibility = totalVotes > 0 ? Math.round((accurateVotes / totalVotes) * 100) : null;

  return {
    profile: user,
    reviews: reviewsResult.rows,
    credibility
  };
};
