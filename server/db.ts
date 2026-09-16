import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const databasePath = resolve(process.env.DATABASE_PATH || './data/tripulacao.db')
mkdirSync(dirname(databasePath), { recursive: true })

export const db = new Database(databasePath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    scheduled_at TEXT NOT NULL,
    observations TEXT DEFAULT '',
    impression TEXT DEFAULT '',
    interests TEXT DEFAULT '',
    next_steps TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ratings (
    candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    criterion TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
    PRIMARY KEY(candidate_id, criterion)
  );
`)

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
