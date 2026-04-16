import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple rate limiter — Nominatim requires max 1 req/sec
let lastRequest = 0;

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q');
  if (!q || q.trim().length < 3) {
    return json([]);
  }

  // Rate limit
  const now = Date.now();
  const wait = Math.max(0, 1000 - (now - lastRequest));
  if (wait > 0) {
    await new Promise(r => setTimeout(r, wait));
  }
  lastRequest = Date.now();

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'Curbside/0.1 (crowd-sourced listing reviews)'
        }
      }
    );

    if (!res.ok) {
      return json([]);
    }

    const results = await res.json();

    return json(results
      .filter((r: any) => {
        // Only return results that have a street-level address
        const a = r.address;
        return a && (a.house_number || a.road);
      })
      .map((r: any) => {
        const a = r.address;
        const houseNum = a.house_number || '';
        const road = a.road || '';
        const street = `${houseNum} ${road}`.trim();
        const city = a.city || a.town || a.village || a.hamlet || a.suburb || a.county || '';
        const state = a.state || '';
        const zip = a.postcode || '';

        return {
          display_name: [street, city, state, zip].filter(Boolean).join(', '),
          street,
          city,
          state,
          zip,
          lat: r.lat,
          lon: r.lon
        };
      }));
  } catch (err) {
    console.error('Geocode error:', err);
    return json([]);
  }
};
