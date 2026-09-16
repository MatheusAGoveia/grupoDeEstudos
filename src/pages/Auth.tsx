import { ArrowLeft, ArrowRight, Binary, Eye, EyeOff, Fingerprint, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { Brand } from '../components/Brand'
import { Notice } from '../components/UI'
import { api } from '../lib/api'

export function Auth({ mode }: { mode: 'login' | 'register' | 'admin' }) {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phrase: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (user) {
    const target = user.role === 'admin' ? '/admin' : user.application_state === 'draft' ? '/jornada' : '/meu-espaco'
    return <Navigate to={target} replace />
  }

  const content = mode === 'register'
    ? { eyebrow: 'Sua jornada começa aqui', title: 'Primeiro, como a gente pode te chamar?', subtitle: 'Crie seu acesso para salvar o perfil e continuar quando quiser.', action: 'Começar minha jornada' }
    : mode === 'admin'
      ? { eyebrow: 'Você encontrou a passagem', title: 'Sala Zero', subtitle: 'Uma porta sem nome. Uma resposta que não está escrita em lugar algum.', action: 'Confirmar o sinal' }
      : { eyebrow: 'Bom te ver de novo', title: 'Continue de onde parou.', subtitle: 'Seu perfil, status e feedbacks estão esperando por você.', action: 'Entrar no meu espaço' }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSending(true)
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : mode === 'admin' ? '/api/auth/admin' : '/api/auth/login'
      await api(endpoint, { method: 'POST', body: JSON.stringify(mode === 'admin' ? { phrase: form.phrase } : form) })
      await refresh()
      navigate(mode === 'admin' ? '/admin' : mode === 'register' ? '/jornada' : '/meu-espaco')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo não saiu como esperado.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={`auth-page ${mode === 'admin' ? 'auth-page--admin' : ''}`}>
      <div className="auth-page__top"><Brand /><Link to="/" className="nav-link"><ArrowLeft size={16} />Voltar</Link></div>
      <section className="auth-card">
        <div className="auth-card__visual">
          {mode === 'admin' ? <div className="cipher-orbit"><span>△</span><span>○</span><span>⌁</span><b>?</b></div> : <div className="auth-signal"><span /><span /><span /></div>}
          <div className="auth-visual__copy">
            <div className="eyebrow"><span /> {content.eyebrow}</div>
            <h2>{mode === 'admin' ? 'Quem observa o bastante não precisa de uma chave.' : 'Você não precisa ter todas as respostas.'}</h2>
            <p>{mode === 'admin' ? 'A sequência abre o caminho. A frase prova quem chegou até ele.' : 'Curiosidade, vontade e honestidade contam muito mais do que parecer perfeito.'}</p>
          </div>
          <div className="auth-quote">{mode === 'admin' ? '“O evidente distrai. O detalhe revela.”' : '“O que você gostaria de construir se tivesse um time junto?”'}</div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'admin' && <div className="admin-lock"><Fingerprint size={18} /> observador reconhecido</div>}
          <span className="form-kicker">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
          {error && <Notice tone="error">{error}</Notice>}
          {mode === 'admin' ? <>
            <div className="riddle-card"><Binary /><p><span>21 · 13 · 1</span><span>9 · 4 · 5 · 9 · 1</span><span>14 · 1 · 19 · 3 · 5</span><span>5 · 14 · 20 · 18 · 5</span><span>1 · 19</span><span>12 · 9 · 14 · 8 · 1 · 19</span></p><small>Você não precisa resolver isto. Precisa lembrar o que existe depois.</small></div>
            <label><span>A frase que ficou do outro lado</span><div className="input-with-icon"><LockKeyhole size={17} /><input autoFocus required type={showPassword ? 'text' : 'password'} value={form.phrase} onChange={(e) => setForm({ ...form, phrase: e.target.value })} placeholder="••••••••••••••••••••" autoComplete="off" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Esconder frase' : 'Mostrar frase'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          </> : <>
            {mode === 'register' && <label><span>Seu nome</span><input autoFocus required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como você gosta de ser chamado?" /></label>}
            <label><span>E-mail</span><input autoFocus={mode !== 'register'} required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" /></label>
            <label><span>Senha</span><div className="input-with-icon"><LockKeyhole size={17} /><input required minLength={6} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Pelo menos 6 caracteres" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          </>}
          <button className="button button--primary button--full" disabled={sending}>{sending ? 'Abrindo caminho...' : content.action}<ArrowRight size={18} /></button>
          {mode !== 'admin' && <div className="auth-switch">{mode === 'register' ? <>Já criou seu perfil? <Link to="/entrar">Entrar</Link></> : <>Chegando agora? <Link to="/comecar">Criar meu perfil</Link></>}</div>}
        </form>
      </section>
    </main>
  )
}
