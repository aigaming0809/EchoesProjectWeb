import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * IMPORTANT (Vercel build fix)
 * ---------------------------------------------------------------
 * Jangan pernah melempar error / membuka koneksi di module scope.
 * Saat `next build` berjalan (di Vercel maupun CI), Next.js meng-import
 * setiap Route Handler untuk "collect page data". Kalau modul ini throw
 * `DATABASE_URL is required` di top-level, build langsung gagal dengan:
 *
 *   Error: Failed to collect page data for /api/health
 *
 * Solusinya: lazy initialization. Pool + Drizzle baru dibuat saat query
 * PERTAMA kali benar-benar dijalankan (runtime), bukan saat import.
 */

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING
  );
}

/** True kalau env database tersedia. Dipakai route untuk fallback anggun. */
export function isDbConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "DATABASE_URL belum diset. Tambahkan Environment Variable DATABASE_URL di Vercel " +
        "(Project → Settings → Environment Variables) lalu redeploy.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __fmPool?: Pool;
  __fmDb?: NodePgDatabase;
};

function needsSsl(url: string): boolean {
  if (/sslmode=disable/i.test(url)) return false;
  if (/sslmode=require|ssl=true/i.test(url)) return true;
  // Host lokal tidak butuh SSL, provider cloud hampir selalu butuh.
  return !/@(localhost|127\.0\.0\.1|::1|host\.docker\.internal)[:/]/i.test(url);
}

export function getPool(): Pool {
  const url = getDatabaseUrl();
  if (!url) throw new DatabaseNotConfiguredError();

  if (!globalForDb.__fmPool) {
    globalForDb.__fmPool = new Pool({
      connectionString: url,
      // Serverless (Vercel) → jaga jumlah koneksi tetap kecil.
      max: process.env.VERCEL ? 1 : 10,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 10_000,
      ...(needsSsl(url) ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    // Cegah unhandled error event mematikan lambda.
    globalForDb.__fmPool.on("error", () => {});
  }
  return globalForDb.__fmPool;
}

export function getDb(): NodePgDatabase {
  if (!globalForDb.__fmDb) {
    globalForDb.__fmDb = drizzle(getPool());
  }
  return globalForDb.__fmDb;
}

/**
 * Proxy `db` supaya sintaks lama `import { db } from "@/db"` tetap jalan,
 * tapi koneksi baru dibuka saat properti pertama diakses (runtime).
 */
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
  has(_target, prop) {
    return prop in (getDb() as unknown as object);
  },
});

/** Alias lama agar kode yang meng-import `pool` tidak rusak. */
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
