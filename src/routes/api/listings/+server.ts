import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

function detectSource(url: string): string {
  const host = url.toLowerCase();
  if (host.includes('zillow.com')) return 'zillow';
  if (host.includes('redfin.com')) return 'redfin';
  if (host.includes('realtor.com')) return 'realtor';
  if (host.includes('trulia.com')) return 'trulia';
  if (host.includes('apartments.com')) return 'apartments';
  if (host.includes('craigslist.org')) return 'craigslist';
  if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
  if (host.includes('hotpads.com')) return 'hotpads';
  return 'other';
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address_id, url, price } = await request.json();

  if (!address_id || !url) {
    return json({ error: 'address_id and url are required' }, { status: 400 });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return json({ error: 'Invalid URL' }, { status: 400 });
  }

  const source = detectSource(url);

  const result = await query(
    `INSERT INTO address_listings (address_id, user_id, url, source, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [address_id, locals.user.id, url, source, price || null]
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

  // Only the user who added it can delete
  await query(
    'DELETE FROM address_listings WHERE id = $1 AND user_id = $2',
    [id, locals.user.id]
  );

  return json({ success: true });
};
