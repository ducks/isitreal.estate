import type { PageServerLoad } from './$types';
import { query } from '$lib/db';

export const load: PageServerLoad = async () => {
  // Recent reviews with address + first photo
  const recentResult = await query(
    `SELECT r.id, r.listing_accurate, r.rating, r.body, r.created_at, r.visited_at,
       u.username,
       a.id as address_id, a.street, a.city, a.state, a.zip,
       (SELECT rp.path FROM review_photos rp WHERE rp.review_id = r.id ORDER BY rp.created_at LIMIT 1) as first_photo
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN addresses a ON a.id = r.address_id
     ORDER BY r.created_at DESC
     LIMIT 6`
  );

  // Addresses with review metadata for the map
  const mapResult = await query(
    `SELECT a.id, a.street, a.city, a.state, a.lat, a.lng,
       COUNT(r.id)::int as review_count,
       SUM(CASE WHEN r.listing_accurate = 'yes' THEN 1 ELSE 0 END)::int as yes_count,
       SUM(CASE WHEN r.listing_accurate = 'no' THEN 1 ELSE 0 END)::int as no_count
     FROM addresses a
     JOIN reviews r ON r.address_id = a.id
     WHERE a.lat IS NOT NULL AND a.lng IS NOT NULL
     GROUP BY a.id
     ORDER BY MAX(r.created_at) DESC
     LIMIT 50`
  );

  // Homepage stats ticker
  const statsResult = await query(
    `SELECT
       (SELECT COUNT(*) FROM addresses WHERE id IN (SELECT DISTINCT address_id FROM reviews))::int as addresses_reviewed,
       (SELECT COUNT(*) FROM reviews)::int as total_reviews,
       (SELECT COUNT(*) FROM review_photos)::int as total_photos,
       (SELECT COUNT(DISTINCT user_id) FROM reviews)::int as contributors`
  );

  return {
    recentReviews: recentResult.rows,
    mapAddresses: mapResult.rows,
    stats: statsResult.rows[0] ?? {
      addresses_reviewed: 0,
      total_reviews: 0,
      total_photos: 0,
      contributors: 0
    }
  };
};
