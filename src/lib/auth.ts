import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION
  }).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION
  });

  const storedBuf = Buffer.from(hash, 'hex');
  return timingSafeEqual(candidate, storedBuf);
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export function getSessionExpiration(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
}
