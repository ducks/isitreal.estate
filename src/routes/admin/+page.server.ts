import type { PageServerLoad } from './$types';
import { query } from '$lib/db';
import { redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  if (!locals.user.is_admin) {
    throw error(403, 'Admin access required');
  }

  // Reviews with reports, grouped
  const reportedResult = await query(
    `SELECT r.id as review_id, r.body, r.rating, r.listing_accurate, r.created_at as review_date,
       u.username as reviewer,
       a.id as address_id, a.street, a.city, a.state,
       COUNT(rp.id)::int as report_count,
       ARRAY_AGG(DISTINCT rp.reason) as reasons
     FROM reports rp
     JOIN reviews r ON r.id = rp.review_id
     JOIN users u ON u.id = r.user_id
     JOIN addresses a ON a.id = r.address_id
     GROUP BY r.id, u.username, a.id, a.street, a.city, a.state
     ORDER BY report_count DESC, r.created_at DESC`
  );

  // Basic stats
  const statsResult = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) as user_count,
       (SELECT COUNT(*)::int FROM reviews) as review_count,
       (SELECT COUNT(*)::int FROM addresses) as address_count,
       (SELECT COUNT(*)::int FROM reports) as report_count`
  );

  return {
    reported: reportedResult.rows,
    stats: statsResult.rows[0]
  };
};
