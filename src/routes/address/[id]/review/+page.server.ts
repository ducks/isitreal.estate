import type { PageServerLoad } from './$types';
import { query } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, url }) => {
  if (!locals.user) {
    throw redirect(303, `/login?returnTo=${encodeURIComponent(url.pathname)}`);
  }

  const result = await query(
    'SELECT id, street, city, state, zip FROM addresses WHERE id = $1',
    [params.id]
  );

  if (result.rows.length === 0) {
    throw error(404, 'Address not found');
  }

  return {
    address: result.rows[0]
  };
};
