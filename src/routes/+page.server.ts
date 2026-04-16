import type { PageServerLoad } from './$types';
import { query } from '$lib/db';

export const load: PageServerLoad = async () => {
  // Recent reviews with address info
  const recentResult = await query(
    `SELECT r.id, r.listing_accurate, r.rating, r.body, r.created_at, r.visited_at,
       u.username,
       a.id as address_id, a.street, a.city, a.state, a.zip
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN addresses a ON a.id = r.address_id
     ORDER BY r.created_at DESC
     LIMIT 10`
  );

  // Addresses with reviews for the map
  const mapResult = await query(
    `SELECT a.id, a.street, a.city, a.state, a.lat, a.lng,
       COUNT(r.id)::int as review_count
     FROM addresses a
     JOIN reviews r ON r.address_id = a.id
     WHERE a.lat IS NOT NULL AND a.lng IS NOT NULL
     GROUP BY a.id
     ORDER BY MAX(r.created_at) DESC
     LIMIT 50`
  );

  return {
    recentReviews: recentResult.rows,
    mapAddresses: mapResult.rows
  };
};
