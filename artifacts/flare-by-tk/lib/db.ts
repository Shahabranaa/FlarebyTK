import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __flarePool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __flareSchemaReady: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!global.__flarePool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    global.__flarePool = new Pool({
      connectionString,
      // Serverless platforms (Vercel) run many isolated instances — keep the
      // per-instance pool tiny to avoid exhausting Postgres connections.
      max: process.env.VERCEL ? 1 : 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return global.__flarePool;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  calories INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price NUMERIC(10,2),
  deal_price NUMERIC(10,2) NOT NULL,
  discount_type TEXT,
  discount_value NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tracking_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  status TEXT NOT NULL DEFAULT 'new',
  total_amount NUMERIC(10,2) NOT NULL,
  special_instructions TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

function ensureSchema(): Promise<void> {
  if (!global.__flareSchemaReady) {
    const pool = getPool();
    global.__flareSchemaReady = pool
      // gen_random_uuid() is built into Postgres 13+, but older setups need
      // pgcrypto. Best-effort — ignore failure if the extension can't be
      // created (e.g. insufficient privileges on a managed instance).
      .query("CREATE EXTENSION IF NOT EXISTS pgcrypto")
      .catch(() => undefined)
      .then(() => pool.query(SCHEMA_SQL))
      .then(() => undefined)
      .catch((err) => {
        global.__flareSchemaReady = undefined;
        throw err;
      });
  }
  return global.__flareSchemaReady;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sql<T = any>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(text, params as never[]);
  return result.rows as T[];
}
