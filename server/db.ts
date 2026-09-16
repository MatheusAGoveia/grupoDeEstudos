import { Pool, type PoolClient, type QueryResultRow } from 'pg'

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 })

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT DEFAULT '',
    age TEXT DEFAULT '',
    city TEXT DEFAULT '',
    course TEXT DEFAULT '',
    period TEXT DEFAULT '',
    area_interest TEXT DEFAULT '',
    technologies TEXT DEFAULT '[]',
    github TEXT DEFAULT '',
    linkedin TEXT DEFAULT '',
    portfolio TEXT DEFAULT '',
    availability TEXT DEFAULT '',
    learning_goals TEXT DEFAULT '',
    projects TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    motivation TEXT DEFAULT '',
    answers TEXT DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Nova inscrição',
    application_state TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    positives TEXT DEFAULT '',
    study_suggestions TEXT DEFAULT '',
    project_idea TEXT DEFAULT '',
    technologies TEXT DEFAULT '',
    next_steps TEXT DEFAULT '',
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    scheduled_at TEXT NOT NULL,
    observations TEXT DEFAULT '',
    impression TEXT DEFAULT '',
    interests TEXT DEFAULT '',
    next_steps TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ratings (
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    criterion TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
    PRIMARY KEY(candidate_id, criterion)
  );

  CREATE TABLE IF NOT EXISTS admin_attempts (
    ip TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMPTZ
  );
`

let initialized: Promise<void> | undefined

export function ensureDatabase(): Promise<void> {
  if (!connectionString) return Promise.reject(new Error('POSTGRES_URL não configurada.'))
  initialized ??= pool.query(schema).then(() => undefined).catch((error: unknown) => {
    initialized = undefined
    throw error
  })
  return initialized
}

export async function rows<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  await ensureDatabase()
  return (await pool.query<T>(sql, params)).rows
}

export async function one<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await rows<T>(sql, params))[0]
}

export async function run(sql: string, params: unknown[] = []): Promise<void> {
  await rows(sql, params)
}

export async function transaction<T>(action: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureDatabase()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await action(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function serializeCandidate(row: Record<string, unknown>) {
  return {
    ...row,
    technologies: parseJson<string[]>(row.technologies as string, []),
    answers: parseJson<Record<string, string>>(row.answers as string, {}),
  }
}
