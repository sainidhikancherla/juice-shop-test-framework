import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Default assumes the shop sits next to this project: ..\juice-shop\data\juiceshop.sqlite
// Override with the JUICE_DB_PATH environment variable if yours is somewhere else.
const DB_PATH =
  process.env.JUICE_DB_PATH ??
  path.resolve('..', 'juice-shop', 'data', 'juiceshop.sqlite');

export function query<T = Record<string, unknown>>(
  sql: string,
  params: Array<string | number> = [],
): T[] {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  try {
    db.exec('PRAGMA busy_timeout = 5000'); // wait up to 5 seconds if the file is busy
    return db.prepare(sql).all(...params) as unknown as T[];
  } finally {
    db.close();
  }
}
