import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/db';

function normalizeAddress(street: string, city: string, state: string, zip: string): string {
  return [street, city, state, zip]
    .map(s => s.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s+/g, ' '))
    .filter(Boolean)
    .join(', ');
}

export const POST: RequestHandler = async ({ request }) => {
  const { street, city, state, zip, lat, lng } = await request.json();

  if (!street) {
    return json({ error: 'Street is required' }, { status: 400 });
  }

  const normalized = normalizeAddress(street, city || '', state || '', zip || '');

  // Check for existing address
  const existing = await query(
    'SELECT * FROM addresses WHERE normalized = $1',
    [normalized]
  );

  if (existing.rows.length > 0) {
    return json(existing.rows[0]);
  }

  // Create new address
  const result = await query(
    `INSERT INTO addresses (street, city, state, zip, normalized, lat, lng)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [street, city || '', state || '', zip || '', normalized, lat || null, lng || null]
  );

  return json(result.rows[0], { status: 201 });
};
