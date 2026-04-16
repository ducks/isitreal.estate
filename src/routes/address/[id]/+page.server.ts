import type { PageServerLoad } from './$types';
import { query } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const addressResult = await query(
    'SELECT * FROM addresses WHERE id = $1',
    [params.id]
  );

  if (addressResult.rows.length === 0) {
    throw error(404, 'Address not found');
  }

  const address = addressResult.rows[0];

  const reviewsResult = await query(
    `SELECT r.*,
       u.username,
       COALESCE(SUM(CASE WHEN v.vote = 'accurate' THEN 1 ELSE 0 END), 0)::int as accurate_count,
       COALESCE(SUM(CASE WHEN v.vote = 'not_accurate' THEN 1 ELSE 0 END), 0)::int as not_accurate_count
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN votes v ON v.review_id = r.id
     WHERE r.address_id = $1
     GROUP BY r.id, u.username
     ORDER BY r.created_at DESC`,
    [params.id]
  );

  // Load photos for each review
  const reviewIds = reviewsResult.rows.map(r => r.id);
  let photos: any[] = [];
  if (reviewIds.length > 0) {
    const photosResult = await query(
      `SELECT * FROM review_photos WHERE review_id = ANY($1)`,
      [reviewIds]
    );
    photos = photosResult.rows;
  }

  // Stats
  const totalReviews = reviewsResult.rows.length;
  const accurateReviews = reviewsResult.rows.filter(r => r.listing_accurate === 'yes').length;
  const avgRating = totalReviews > 0
    ? reviewsResult.rows.reduce((s, r) => s + r.rating, 0) / totalReviews
    : 0;

  // Load listings
  const listingsResult = await query(
    `SELECT l.*, u.username
     FROM address_listings l
     JOIN users u ON u.id = l.user_id
     WHERE l.address_id = $1
     ORDER BY l.created_at DESC`,
    [params.id]
  );

  return {
    address,
    reviews: reviewsResult.rows.map(r => ({
      ...r,
      photos: photos.filter(p => p.review_id === r.id)
    })),
    listings: listingsResult.rows,
    stats: {
      totalReviews,
      accuratePercent: totalReviews > 0 ? Math.round((accurateReviews / totalReviews) * 100) : 0,
      avgRating: Math.round(avgRating * 10) / 10
    },
    user: locals.user ?? null
  };
};
