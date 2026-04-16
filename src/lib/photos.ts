import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = 'uploads';
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const QUALITY = 80;

export async function processAndSavePhoto(
  buffer: Buffer,
  originalFilename: string
): Promise<{ filename: string; path: string }> {
  const id = randomUUID();
  const filename = `${id}.webp`;

  // Resize and convert to webp
  const processed = await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  // Ensure upload directory exists
  const dir = join(UPLOAD_DIR, 'photos');
  await mkdir(dir, { recursive: true });

  const filepath = join('photos', filename);
  await writeFile(join(UPLOAD_DIR, filepath), processed);

  return { filename, path: filepath };
}

export function validatePhoto(file: { size: number; type: string }): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  if (file.size > maxSize) {
    return 'File too large (max 10MB)';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC';
  }

  return null;
}
