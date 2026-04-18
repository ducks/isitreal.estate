import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { UPLOAD_DIR } from '$lib/photos';

export const GET: RequestHandler = async ({ params }) => {
  const filepath = join(UPLOAD_DIR, params.path);

  try {
    const data = await readFile(filepath);
    const ext = filepath.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      webp: 'image/webp',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png'
    };

    return new Response(data, {
      headers: {
        'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
