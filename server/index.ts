import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import { ensureDatabase, one, rows, run, serializeCandidate, transaction } from './db.js'

const app = express()
app.set('trust proxy', 1)
const port = Number(process.env.PORT || 3333)
const isProduction = process.env.NODE_ENV === 'production'
const jwtSecret = process.env.JWT_SECRET || 'tripulacao-dev-secret-change-me'
const adminSecret = process.env.ADMIN_SECRET_PHRASE || ''

if (process.env.VERCEL && !process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurada.')

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

type Session = { id: string; role: 'candidate' | 'admin' }
type AuthedRequest = express.Request & { session?: Session }

function createToken(payload: Session) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '14d' })
}

function setSession(res: express.Response, session: Session) {
  res.cookie('tripulacao_session', createToken(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 14 * 24 * 60 * 60 * 1000,
  })
}

function readSession(req: express.Request): Session | undefined {
  const token = req.cookies.tripulacao_session
  if (!token) return undefined
  try {
    return jwt.verify(token, jwtSecret) as Session
  } catch {
    return undefined
  }
}

function requireRole(role: Session['role']) {
  return (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    const session = readSession(req)
    if (!session || session.role !== role) {
      res.status(401).json({ message: 'Acesso não autorizado.' })
      return
    }
    req.session = session
    next()
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

app.post('/api/auth/register', async (req, res) => {
  const parsed = credentialsSchema.extend({ name: z.string().min(2).max(80) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Confira seu nome, e-mail e senha.' })
  const { name, email, password } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  const exists = await one('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (exists) return res.status(409).json({ message: 'Este e-mail já possui um perfil.' })

  const userId = randomUUID()
  const candidateId = randomUUID()
  const passwordHash = await bcrypt.hash(password, 12)
  await transaction(async (client) => {
    await client.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [userId, normalizedEmail, passwordHash])
    await client.query('INSERT INTO candidates (id, user_id, name, email) VALUES ($1, $2, $3, $4)', [candidateId, userId, name.trim(), normalizedEmail])
    await client.query('INSERT INTO status_history (id, candidate_id, status) VALUES ($1, $2, $3)', [randomUUID(), candidateId, 'Perfil iniciado'])
  })
  setSession(res, { id: userId, role: 'candidate' })
  return res.status(201).json({ ok: true })
})

app.post('/api/auth/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Informe e-mail e senha.' })
  const user = await one<{ id: string; password_hash: string }>('SELECT * FROM users WHERE email = $1', [parsed.data.email.trim().toLowerCase()])
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return res.status(401).json({ message: 'E-mail ou senha não conferem.' })
  }
  setSession(res, { id: user.id, role: 'candidate' })
  return res.json({ ok: true })
})

app.post('/api/auth/admin', async (req, res) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  if (!adminSecret) return res.status(503).json({ message: 'O sinal secreto ainda não foi configurado.' })
  const attempt = await one<{ count: number; blocked_until: Date | null }>('SELECT count, blocked_until FROM admin_attempts WHERE ip = $1', [key])
  if (attempt?.blocked_until && attempt.blocked_until.getTime() > now) return res.status(429).json({ message: 'Muitas tentativas. Aguarde 15 minutos.' })

  const phrase = String(req.body.phrase || '').trim().toLocaleLowerCase('pt-BR')
  const expected = adminSecret.trim().toLocaleLowerCase('pt-BR')
  const phraseHash = createHash('sha256').update(phrase).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(phraseHash, expectedHash)) {
    const count = (attempt?.blocked_until && attempt.blocked_until.getTime() <= now ? 0 : attempt?.count || 0) + 1
    await run(`INSERT INTO admin_attempts (ip, count, blocked_until) VALUES ($1, $2, $3)
      ON CONFLICT (ip) DO UPDATE SET count = EXCLUDED.count, blocked_until = EXCLUDED.blocked_until`,
      [key, count, count >= 5 ? new Date(now + 15 * 60 * 1000) : null])
    return res.status(401).json({ message: count >= 5 ? 'Muitas tentativas. Aguarde 15 minutos.' : 'Frase de acesso incorreta.' })
  }
  await run('DELETE FROM admin_attempts WHERE ip = $1', [key])
  setSession(res, { id: 'admin', role: 'admin' })
  return res.json({ ok: true })
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('tripulacao_session')
  res.json({ ok: true })
})

app.get('/api/me', async (req, res) => {
  const session = readSession(req)
  if (!session) return res.status(401).json({ message: 'Sem sessão.' })
  if (session.role === 'admin') return res.json({ role: 'admin', name: 'Administrador' })
  const candidate = await one('SELECT id, name, application_state FROM candidates WHERE user_id = $1', [session.id])
  if (!candidate) return res.status(404).json({ message: 'Perfil não encontrado.' })
  return res.json({ role: 'candidate', ...candidate })
})

app.get('/api/candidate/me', requireRole('candidate'), async (req: AuthedRequest, res) => {
  const candidate = await one<Record<string, unknown>>('SELECT * FROM candidates WHERE user_id = $1', [req.session!.id])
  if (!candidate) return res.status(404).json({ message: 'Perfil não encontrado.' })
  const [history, feedback, conversations] = await Promise.all([
    rows('SELECT * FROM status_history WHERE candidate_id = $1 ORDER BY created_at DESC', [candidate.id]),
    rows('SELECT * FROM feedback WHERE candidate_id = $1 AND visible = TRUE ORDER BY created_at DESC', [candidate.id]),
    rows('SELECT id, scheduled_at, next_steps FROM conversations WHERE candidate_id = $1 ORDER BY scheduled_at DESC', [candidate.id]),
  ])
  return res.json({ candidate: serializeCandidate(candidate), history, feedback, conversations })
})

const candidateUpdateSchema = z.object({
  name: z.string().min(2).max(80),
  whatsapp: z.string().max(80).optional().default(''),
  age: z.string().max(3).optional().default(''),
  city: z.string().max(100).optional().default(''),
  course: z.string().max(140).optional().default(''),
  period: z.string().max(50).optional().default(''),
  area_interest: z.string().max(100).optional().default(''),
  technologies: z.array(z.string().max(40)).max(30).default([]),
  github: z.string().max(300).optional().default(''),
  linkedin: z.string().max(300).optional().default(''),
  portfolio: z.string().max(300).optional().default(''),
  availability: z.string().max(80).optional().default(''),
  learning_goals: z.string().max(2000).optional().default(''),
  projects: z.string().max(3000).optional().default(''),
  experience: z.string().max(3000).optional().default(''),
  motivation: z.string().max(3000).optional().default(''),
  answers: z.record(z.string(), z.string().max(3000)).default({}),
})

app.put('/api/candidate/me', requireRole('candidate'), async (req: AuthedRequest, res) => {
  const parsed = candidateUpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Alguns campos precisam ser revisados.' })
  const c = parsed.data
  await run(`UPDATE candidates SET
    name = $1, whatsapp = $2, age = $3, city = $4, course = $5, period = $6, area_interest = $7, technologies = $8,
    github = $9, linkedin = $10, portfolio = $11, availability = $12, learning_goals = $13, projects = $14, experience = $15,
    motivation = $16, answers = $17, updated_at = CURRENT_TIMESTAMP WHERE user_id = $18`, [
      c.name, c.whatsapp, c.age, c.city, c.course, c.period, c.area_interest, JSON.stringify(c.technologies),
      c.github, c.linkedin, c.portfolio, c.availability, c.learning_goals, c.projects, c.experience,
      c.motivation, JSON.stringify(c.answers), req.session!.id,
    ])
  return res.json({ ok: true })
})

app.post('/api/candidate/submit', requireRole('candidate'), async (req: AuthedRequest, res) => {
  const candidate = await one<Record<string, unknown>>('SELECT * FROM candidates WHERE user_id = $1', [req.session!.id])
  if (!candidate) return res.status(404).json({ message: 'Perfil não encontrado.' })
  if (!candidate.city || !candidate.area_interest || !candidate.availability || !candidate.motivation) {
    return res.status(400).json({ message: 'Complete as etapas essenciais antes de enviar.' })
  }
  await transaction(async (client) => {
    await client.query(`UPDATE candidates SET application_state = 'submitted', status = 'Nova inscrição', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [candidate.id])
    await client.query('INSERT INTO status_history (id, candidate_id, status) VALUES ($1, $2, $3)', [randomUUID(), candidate.id, 'Nova inscrição'])
  })
  return res.json({ ok: true })
})

app.get('/api/admin/candidates', requireRole('admin'), async (req, res) => {
  const search = String(req.query.search || '').trim()
  const status = String(req.query.status || '').trim()
  const params: string[] = []
  const clauses = ["application_state = 'submitted'"]
  if (search) {
    clauses.push('(name ILIKE $1 OR email ILIKE $2 OR area_interest ILIKE $3 OR technologies ILIKE $4)')
    const value = `%${search}%`
    params.push(value, value, value, value)
  }
  if (status) {
    clauses.push(`status = $${params.length + 1}`)
    params.push(status)
  }
  const [candidates, counts] = await Promise.all([
    rows<Record<string, unknown>>(`SELECT * FROM candidates WHERE ${clauses.join(' AND ')} ORDER BY COALESCE(submitted_at, created_at) DESC`, params),
    rows(`SELECT status, COUNT(*) as total FROM candidates WHERE application_state = 'submitted' GROUP BY status`),
  ])
  return res.json({ candidates: candidates.map(serializeCandidate), counts })
})

app.get('/api/admin/candidates/:id', requireRole('admin'), async (req, res) => {
  const candidate = await one<Record<string, unknown>>('SELECT * FROM candidates WHERE id = $1', [req.params.id])
  if (!candidate) return res.status(404).json({ message: 'Perfil não encontrado.' })
  const [notes, feedback, conversations, ratings, history] = await Promise.all([
    rows('SELECT * FROM notes WHERE candidate_id = $1 ORDER BY created_at DESC', [req.params.id]),
    rows('SELECT * FROM feedback WHERE candidate_id = $1 ORDER BY created_at DESC', [req.params.id]),
    rows('SELECT * FROM conversations WHERE candidate_id = $1 ORDER BY scheduled_at DESC', [req.params.id]),
    rows('SELECT criterion, score FROM ratings WHERE candidate_id = $1', [req.params.id]),
    rows('SELECT * FROM status_history WHERE candidate_id = $1 ORDER BY created_at DESC', [req.params.id]),
  ])
  return res.json({ candidate: serializeCandidate(candidate), notes, feedback, conversations, ratings, history })
})

app.patch('/api/admin/candidates/:id/status', requireRole('admin'), async (req, res) => {
  const allowed = ['Nova inscrição', 'Analisando', 'Quero conversar', 'Conversa realizada', 'Selecionado', 'Talvez futuramente', 'Não selecionado']
  const status = String(req.body.status || '')
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Status inválido.' })
  await transaction(async (client) => {
    await client.query('UPDATE candidates SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, req.params.id])
    await client.query('INSERT INTO status_history (id, candidate_id, status) VALUES ($1, $2, $3)', [randomUUID(), req.params.id, status])
  })
  return res.json({ ok: true })
})

app.post('/api/admin/candidates/:id/notes', requireRole('admin'), async (req, res) => {
  const content = String(req.body.content || '').trim()
  if (!content) return res.status(400).json({ message: 'Escreva uma anotação.' })
  await run('INSERT INTO notes (id, candidate_id, content) VALUES ($1, $2, $3)', [randomUUID(), req.params.id, content])
  return res.status(201).json({ ok: true })
})

app.put('/api/admin/candidates/:id/ratings', requireRole('admin'), async (req, res) => {
  const schema = z.record(z.string(), z.number().int().min(1).max(5))
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Impressões inválidas.' })
  await transaction(async (client) => {
    for (const [criterion, score] of Object.entries(parsed.data)) {
      await client.query(`INSERT INTO ratings (candidate_id, criterion, score) VALUES ($1, $2, $3)
        ON CONFLICT(candidate_id, criterion) DO UPDATE SET score = EXCLUDED.score`, [req.params.id, criterion, score])
    }
  })
  return res.json({ ok: true })
})

app.post('/api/admin/candidates/:id/feedback', requireRole('admin'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2), message: z.string().min(2), positives: z.string().optional().default(''),
    study_suggestions: z.string().optional().default(''), project_idea: z.string().optional().default(''),
    technologies: z.string().optional().default(''), next_steps: z.string().optional().default(''),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Escreva pelo menos um título e uma mensagem.' })
  const f = parsed.data
  await run(`INSERT INTO feedback (id, candidate_id, title, message, positives, study_suggestions, project_idea, technologies, next_steps)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [randomUUID(), req.params.id, f.title, f.message, f.positives, f.study_suggestions, f.project_idea, f.technologies, f.next_steps])
  return res.status(201).json({ ok: true })
})

app.post('/api/admin/candidates/:id/conversations', requireRole('admin'), async (req, res) => {
  const schema = z.object({ scheduled_at: z.string().min(1), observations: z.string().optional().default(''), impression: z.string().optional().default(''), interests: z.string().optional().default(''), next_steps: z.string().optional().default('') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Informe a data da conversa.' })
  const c = parsed.data
  await run(`INSERT INTO conversations (id, candidate_id, scheduled_at, observations, impression, interests, next_steps)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`, [randomUUID(), req.params.id, c.scheduled_at, c.observations, c.impression, c.interests, c.next_steps])
  return res.status(201).json({ ok: true })
})

app.get('/api/health', async (_req, res) => {
  await ensureDatabase()
  res.json({ ok: true })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro na API:', error)
  res.status(500).json({ message: 'Não foi possível concluir a operação agora.' })
})

if (isProduction) {
  const distPath = resolve('dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.use((_req, res) => res.sendFile(resolve(distPath, 'index.html')))
  }
}

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Tripulação disponível em http://localhost:${port}`))
}

export default app
