import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';
import { processAndSavePhoto, validatePhoto } from '$lib/photos';

const MAX_PHOTOS_PER_REVIEW = 5;

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const reviewId = formData.get('review_id') as string;

    if (!reviewId) {
      return json({ error: 'review_id is required' }, { status: 400 });
    }

    // Verify the review exists and belongs to this user
    const reviewCheck = await query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, locals.user.id]
    );
    if (reviewCheck.rows.length === 0) {
      return json({ error: 'Review not found' }, { status: 404 });
    }

    // Check existing photo count
    const countResult = await query(
      'SELECT COUNT(*)::int as count FROM review_photos WHERE review_id = $1',
      [reviewId]
    );
    const existingCount = countResult.rows[0].count;

    const files = formData.getAll('photos') as File[];
    if (files.length === 0) {
      return json({ error: 'No photos provided' }, { status: 400 });
    }

    if (existingCount + files.length > MAX_PHOTOS_PER_REVIEW) {
      return json(
        { error: `Maximum ${MAX_PHOTOS_PER_REVIEW} photos per review (${existingCount} already uploaded)` },
        { status: 400 }
      );
    }

    const photos = [];
    for (const file of files) {
      const validationError = validatePhoto({ size: file.size, type: file.type });
      if (validationError) {
        return json({ error: `${file.name}: ${validationError}` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { filename, path } = await processAndSavePhoto(buffer, file.name);

      const result = await query(
        `INSERT INTO review_photos (review_id, filename, path)
         VALUES ($1, $2, $3) RETURNING *`,
        [reviewId, filename, path]
      );
      photos.push(result.rows[0]);
    }

    return json({ photos }, { status: 201 });
  } catch (err) {
    console.error('Photo upload error:', err);
    return json({ error: 'Failed to upload photos' }, { status: 500 });
  }
};
