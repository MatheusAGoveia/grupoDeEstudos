import assert from 'node:assert/strict'

const port = process.argv[2] || '3333'
const base = `http://127.0.0.1:${port}`
const email = `teste.${Date.now()}@example.com`
let candidateCookie = ''
let adminCookie = ''

async function request(path, { body, cookie, method = 'GET' } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  return { response, data, cookie: response.headers.get('set-cookie')?.split(';')[0] || '' }
}

const registration = await request('/api/auth/register', { method: 'POST', body: { name: 'Pessoa Teste', email, password: 'teste-seguro' } })
assert.equal(registration.response.status, 201)
candidateCookie = registration.cookie

const profile = {
  name: 'Pessoa Teste', whatsapp: '@teste', age: '22', city: 'Betim, MG', course: 'Sistemas de Informação', period: '4º',
  area_interest: 'Backend', technologies: ['Java', 'Spring'], github: 'github.com/teste', linkedin: '', portfolio: '',
  availability: '3–5 horas', learning_goals: 'Arquitetura e trabalho em equipe', projects: 'Uma API para a faculdade',
  experience: 'Grupo de estudos', motivation: 'Quero aprender construindo com outras pessoas.',
  answers: { dreamProject: 'Uma plataforma útil', curiosity: 'IA', unknown: 'Pesquiso e peço ajuda', teamStyle: 'Grupo', wishlist: 'Rust', proud: 'Minha primeira API' },
}
assert.equal((await request('/api/candidate/me', { method: 'PUT', cookie: candidateCookie, body: profile })).response.status, 200)
assert.equal((await request('/api/candidate/submit', { method: 'POST', cookie: candidateCookie })).response.status, 200)

const wrongAccess = await request('/api/auth/admin', { method: 'POST', body: { phrase: 'uma tentativa errada' } })
assert.equal(wrongAccess.response.status, 401)
const adminAccess = await request('/api/auth/admin', { method: 'POST', body: { phrase: process.env.ADMIN_SECRET_PHRASE } })
assert.equal(adminAccess.response.status, 200)
adminCookie = adminAccess.cookie

const list = await request('/api/admin/candidates', { cookie: adminCookie })
assert.equal(list.response.status, 200)
const candidate = list.data.candidates.find((item) => item.email === email)
assert.ok(candidate?.id)

assert.equal((await request(`/api/admin/candidates/${candidate.id}/status`, { method: 'PATCH', cookie: adminCookie, body: { status: 'Quero conversar' } })).response.status, 200)
assert.equal((await request(`/api/admin/candidates/${candidate.id}/notes`, { method: 'POST', cookie: adminCookie, body: { content: 'Esta nota precisa continuar privada.' } })).response.status, 201)
assert.equal((await request(`/api/admin/candidates/${candidate.id}/ratings`, { method: 'PUT', cookie: adminCookie, body: { curiosidade: 5, colaboracao: 4 } })).response.status, 200)
assert.equal((await request(`/api/admin/candidates/${candidate.id}/feedback`, { method: 'POST', cookie: adminCookie, body: { title: 'Bom começo', message: 'Gostei da forma como você aprende.', positives: 'Curiosidade', next_steps: 'Vamos conversar.' } })).response.status, 201)
assert.equal((await request(`/api/admin/candidates/${candidate.id}/conversations`, { method: 'POST', cookie: adminCookie, body: { scheduled_at: '2026-09-20T19:00', observations: 'Primeira conversa', next_steps: 'Confirmar horário' } })).response.status, 201)

const candidateView = await request('/api/candidate/me', { cookie: candidateCookie })
assert.equal(candidateView.response.status, 200)
assert.equal(candidateView.data.candidate.status, 'Quero conversar')
assert.equal(candidateView.data.feedback.length, 1)
assert.equal(candidateView.data.conversations.length, 1)
assert.equal('notes' in candidateView.data, false)
assert.equal('ratings' in candidateView.data, false)

console.log('✓ cadastro, perfil e envio')
console.log('✓ Sala Zero rejeita sinal incorreto e aceita a frase privada')
console.log('✓ status, nota, impressões, conversa e feedback')
console.log('✓ notas e impressões privadas não vazam para o candidato')
