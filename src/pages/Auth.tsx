import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole } from 'lucide-react'
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
    ? { eyebrow: 'CRIAR PERFIL', title: 'Vamos começar pelo básico.', subtitle: 'Crie seu acesso para preencher o perfil no seu tempo.', action: 'Criar perfil' }
    : mode === 'admin'
      ? { eyebrow: 'ACESSO DA EQUIPE', title: 'Sala Zero', subtitle: 'Informe a frase de acesso.', action: 'Entrar' }
      : { eyebrow: 'ENTRAR', title: 'Acesse seu perfil.', subtitle: 'Continue o preenchimento ou acompanhe sua inscrição.', action: 'Entrar' }

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
          <span className="auth-card__index">TRIPULAÇÃO / {mode === 'admin' ? 'EQUIPE' : 'PESSOAS'}</span>
          <div className="auth-visual__copy">
            <h2>{mode === 'admin' ? 'Um lugar para acompanhar o grupo.' : 'Projetos ficam melhores quando são feitos juntos.'}</h2>
            <p>{mode === 'admin' ? 'Acesse os perfis e registre os próximos passos.' : 'Conte o que você tem vontade de aprender e construir.'}</p>
          </div>
          <span className="auth-card__footer">estudo · troca · projetos</span>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'admin' && <div className="admin-lock"><Fingerprint size={18} /> acesso restrito</div>}
          <span className="form-kicker">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
          {error && <Notice tone="error">{error}</Notice>}
          {mode === 'admin' ? <>
            <label><span>Frase de acesso</span><div className="input-with-icon"><LockKeyhole size={17} /><input autoFocus required type={showPassword ? 'text' : 'password'} value={form.phrase} onChange={(e) => setForm({ ...form, phrase: e.target.value })} placeholder="Frase de acesso" autoComplete="off" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Esconder frase' : 'Mostrar frase'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          </> : <>
            {mode === 'register' && <label><span>Seu nome</span><input autoFocus required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como você gosta de ser chamado?" /></label>}
            <label><span>E-mail</span><input autoFocus={mode !== 'register'} required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" /></label>
            <label><span>Senha</span><div className="input-with-icon"><LockKeyhole size={17} /><input required minLength={6} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Pelo menos 6 caracteres" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          </>}
          <button className="button button--primary button--full" disabled={sending}>{sending ? 'Aguarde...' : content.action}<ArrowRight size={18} /></button>
          {mode !== 'admin' && <div className="auth-switch">{mode === 'register' ? <>Já criou seu perfil? <Link to="/entrar">Entrar</Link></> : <>Chegando agora? <Link to="/comecar">Criar meu perfil</Link></>}</div>}
        </form>
      </section>
    </main>
  )
}
