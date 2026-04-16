import pg from 'pg';
import { env } from '$env/dynamic/private';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  return pool.query(text, params);
}
