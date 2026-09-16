import { ArrowLeft, ArrowRight, Check, Code2, Compass, Link2, LoaderCircle, UserRound } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { CandidateHeader } from '../components/AppShell'
import { Notice } from '../components/UI'
import { api } from '../lib/api'
import type { Candidate } from '../types'

const questions = [
  ['dreamProject', 'Que tipo de projeto você gostaria de construir?', 'Pode ser uma ideia maluca, útil, divertida ou tudo isso junto.'],
  ['curiosity', 'Qual área da tecnologia mais desperta sua curiosidade hoje?', 'Conta o que vem chamando sua atenção ultimamente.'],
  ['unknown', 'Quando você não sabe fazer alguma coisa, o que costuma fazer?', 'Não existe resposta bonita. Queremos conhecer seu processo.'],
  ['teamStyle', 'Você prefere trabalhar sozinho ou em grupo?', 'E o que faz uma colaboração funcionar bem para você?'],
  ['wishlist', 'Existe alguma tecnologia que você sempre quis aprender?', 'Vale aquela que você vive adiando também.'],
  ['proud', 'Conte algo que você já construiu e que te dá orgulho.', 'Pode ser pequeno, inacabado ou nem ser código.'],
] as const

const steps = [
  { title: 'Você', subtitle: 'O básico para começarmos', icon: UserRound },
  { title: 'Interesses', subtitle: 'Áreas e tecnologias', icon: Compass },
  { title: 'Experiência', subtitle: 'Projetos e vivências', icon: Code2 },
  { title: 'Respostas', subtitle: 'Seu jeito de pensar', icon: UserRound },
  { title: 'Revisão', subtitle: 'Confira e envie', icon: Check },
]

const blank: Candidate = {
  id: '', name: '', email: '', whatsapp: '', age: '', city: '', course: '', period: '', area_interest: '', technologies: [],
  github: '', linkedin: '', portfolio: '', availability: '', learning_goals: '', projects: '', experience: '', motivation: '', answers: {},
  status: 'Nova inscrição', application_state: 'draft', created_at: '', updated_at: '',
}

export function Journey() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [candidate, setCandidate] = useState<Candidate>(blank)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    api<{ candidate: Candidate }>('/api/candidate/me').then(({ candidate: value }) => {
      setCandidate(value)
    }).catch((err: Error) => setMessage(err.message)).finally(() => setLoading(false))
  }, [navigate])

  const progress = (step + 1) * 20

  function field(key: keyof Candidate, value: string) {
    setCandidate((current) => ({ ...current, [key]: value }))
  }

  function answer(key: string, value: string) {
    setCandidate((current) => ({ ...current, answers: { ...current.answers, [key]: value } }))
  }

  function addTech(event?: KeyboardEvent<HTMLInputElement>) {
    if (event && event.key !== 'Enter' && event.key !== ',') return
    event?.preventDefault()
    const value = techInput.trim().replace(/,$/, '')
    if (value && !candidate.technologies.includes(value)) {
      setCandidate((current) => ({ ...current, technologies: [...current.technologies, value] }))
    }
    setTechInput('')
  }

  async function save(next?: number) {
    setSaving(true)
    setMessage('')
    try {
      await api('/api/candidate/me', { method: 'PUT', body: JSON.stringify(candidate) })
      if (typeof next === 'number') {
        setStep(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível salvar agora.')
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    setSaving(true)
    setMessage('')
    try {
      await api('/api/candidate/me', { method: 'PUT', body: JSON.stringify(candidate) })
      if (candidate.application_state !== 'submitted') await api('/api/candidate/submit', { method: 'POST' })
      await refresh()
      navigate('/meu-espaco', { state: { justSubmitted: true } })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível enviar agora.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="screen-loader"><span /><p>Carregando perfil...</p></div>

  return (
    <div className="journey-page">
      <CandidateHeader><div className="save-indicator">{saving ? <><LoaderCircle className="spin" size={15} /> salvando</> : <><Check size={15} /> progresso salvo</>}</div></CandidateHeader>
      <div className="journey-layout">
        <aside className="journey-map">
          <div className="journey-map__head"><span>Seu perfil</span><strong>{progress}%</strong></div>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          <nav>
            {steps.map((item, index) => {
              const Icon = item.icon
              return <button key={item.title} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => index < step && setStep(index)}><b>{index < step ? <Check size={16} /> : <Icon size={17} />}</b><span><strong>{item.title}</strong><small>{item.subtitle}</small></span></button>
            })}
          </nav>
        </aside>

        <main className="journey-content">
          <div className="step-count">ETAPA {String(step + 1).padStart(2, '0')} <span>/ 05</span></div>
          {message && <Notice tone="error">{message}</Notice>}

          {step === 0 && <section className="mission">
            <header><h1>Sobre você</h1><p>Dados básicos para a equipe entrar em contato. Idade é opcional.</p></header>
            <div className="form-grid">
              <label className="span-2"><span>Como você gosta de ser chamado?</span><input value={candidate.name} onChange={(e) => field('name', e.target.value)} placeholder="Seu nome" /></label>
              <label><span>WhatsApp ou Discord</span><input value={candidate.whatsapp} onChange={(e) => field('whatsapp', e.target.value)} placeholder="(31) 99999-9999 ou @discord" /></label>
              <label><span>Idade <i>opcional</i></span><input inputMode="numeric" value={candidate.age} onChange={(e) => field('age', e.target.value)} placeholder="Ex.: 21" /></label>
              <label className="span-2"><span>De onde você fala?</span><input value={candidate.city} onChange={(e) => field('city', e.target.value)} placeholder="Cidade e estado" /></label>
              <label><span>Faculdade ou curso <i>se fizer</i></span><input value={candidate.course} onChange={(e) => field('course', e.target.value)} placeholder="Ex.: Sistemas de Informação" /></label>
              <label><span>Período atual</span><input value={candidate.period} onChange={(e) => field('period', e.target.value)} placeholder="Ex.: 4º período" /></label>
            </div>
          </section>}

          {step === 1 && <section className="mission">
            <header><h1>Interesses e disponibilidade</h1><p>Escolha as áreas que chamam sua atenção hoje.</p></header>
            <label><span>Área que mais chama sua atenção hoje</span><div className="choice-grid">{['Frontend', 'Backend', 'Mobile', 'UX / UI', 'Dados & IA', 'Produto', 'DevOps', 'Ainda descobrindo'].map((area) => <button type="button" key={area} className={candidate.area_interest === area ? 'selected' : ''} onClick={() => field('area_interest', area)}>{candidate.area_interest === area && <Check size={15} />}{area}</button>)}</div></label>
            <label><span>Tecnologias com que já teve algum contato</span><div className="tag-input">{candidate.technologies.map((tech) => <button type="button" key={tech} onClick={() => setCandidate({ ...candidate, technologies: candidate.technologies.filter((item) => item !== tech) })}>{tech}<b>×</b></button>)}<input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={addTech} onBlur={() => addTech()} placeholder={candidate.technologies.length ? 'Adicionar outra...' : 'Digite e pressione Enter. Ex.: JavaScript'} /></div><small className="field-hint">Vale contato em aula, tutorial ou projeto pessoal.</small></label>
            <label><span>Quanto tempo cabe na sua semana?</span><div className="choice-grid choice-grid--wide">{['Até 2 horas', '3–5 horas', '6–8 horas', 'Mais de 8 horas', 'Depende da semana'].map((value) => <button type="button" key={value} className={candidate.availability === value ? 'selected' : ''} onClick={() => field('availability', value)}>{candidate.availability === value && <Check size={15} />}{value}</button>)}</div></label>
            <label><span>O que você mais gostaria de aprender agora?</span><textarea value={candidate.learning_goals} onChange={(e) => field('learning_goals', e.target.value)} placeholder="Pode falar de tecnologia, produto, trabalho em equipe..." rows={4} /></label>
          </section>}

          {step === 2 && <section className="mission">
            <header><h1>Projetos e experiências</h1><p>Inclua trabalhos de estudo, projetos pessoais ou outras experiências relevantes.</p></header>
            <div className="form-grid">
              <label><span><Link2 size={15} /> GitHub</span><input value={candidate.github} onChange={(e) => field('github', e.target.value)} placeholder="github.com/seuusuario" /></label>
              <label><span><Link2 size={15} /> LinkedIn</span><input value={candidate.linkedin} onChange={(e) => field('linkedin', e.target.value)} placeholder="linkedin.com/in/voce" /></label>
              <label className="span-2"><span><Link2 size={15} /> Portfólio <i>se tiver</i></span><input value={candidate.portfolio} onChange={(e) => field('portfolio', e.target.value)} placeholder="Seu site, Behance, Notion ou outro link" /></label>
              <label className="span-2"><span>Projetos que já desenvolveu</span><textarea value={candidate.projects} onChange={(e) => field('projects', e.target.value)} placeholder="Conta o que você fez, por que fez e qual parte foi sua. Pode colar links também." rows={5} /></label>
              <label className="span-2"><span>Outras experiências</span><textarea value={candidate.experience} onChange={(e) => field('experience', e.target.value)} placeholder="Grupo de estudo, trabalho, voluntariado, evento, curso... Se ainda não tiver, tudo bem." rows={4} /></label>
            </div>
          </section>}

          {step === 3 && <section className="mission mission--questions">
            <header><h1>Algumas perguntas</h1><p>Queremos entender como você aprende, cria e trabalha com outras pessoas.</p></header>
            {questions.map(([key, title, hint], index) => <label className="question-card" key={key}><div><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{title}</strong><small>{hint}</small></span></div><textarea rows={4} value={candidate.answers[key] || ''} onChange={(e) => answer(key, e.target.value)} placeholder="Sua resposta..." /></label>)}
            <label className="question-card"><div><b>07</b><span><strong>Por que você gostaria de participar?</strong><small>O que te trouxe até aqui e o que espera dessa experiência?</small></span></div><textarea rows={5} value={candidate.motivation} onChange={(e) => field('motivation', e.target.value)} placeholder="Sua resposta..." /></label>
          </section>}

          {step === 4 && <section className="mission mission--review">
            <header><h1>Revise seu perfil</h1><p>Confira as informações antes de enviar. Depois, você poderá acompanhar a inscrição no seu espaço.</p></header>
            <div className="profile-preview">
              <div className="profile-preview__top"><div className="avatar avatar--large">{candidate.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div><h2>{candidate.name || 'Seu nome'}</h2><p>{candidate.area_interest || 'Área ainda não escolhida'} · {candidate.city || 'Cidade não informada'}</p></div><button className="button button--ghost button--small" onClick={() => setStep(0)}>Editar perfil</button></div>
              <div className="preview-stats"><div><small>Disponibilidade</small><strong>{candidate.availability || '—'}</strong></div><div><small>Tecnologias</small><strong>{candidate.technologies.length || 0} adicionadas</strong></div><div><small>Respostas pessoais</small><strong>{Object.values(candidate.answers).filter(Boolean).length} de 6</strong></div></div>
              <div className="preview-tags">{candidate.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
              <div className="preview-text"><small>Por que quer participar</small><p>{candidate.motivation || 'Você ainda não contou isso pra gente.'}</p></div>
            </div>
            <div className="send-note"><div><strong>Depois do envio</strong><p>A equipe lê seu perfil e registra qualquer atualização no seu espaço.</p></div></div>
            <label className="check-line"><input type="checkbox" required defaultChecked /><span>Li meu perfil e estou feliz em compartilhar essas respostas com a equipe.</span></label>
          </section>}

          <footer className="journey-actions">
            <button className="button button--ghost" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}><ArrowLeft size={18} />Voltar</button>
            {step < 4 ? <button className="button button--primary" disabled={saving} onClick={() => save(step + 1)}>{saving ? 'Salvando...' : 'Continuar'}<ArrowRight size={18} /></button> : <button className="button button--primary button--launch" disabled={saving} onClick={submit}>{saving ? 'Salvando...' : candidate.application_state === 'submitted' ? 'Salvar alterações' : 'Enviar perfil'}<ArrowRight size={18} /></button>}
          </footer>
        </main>
      </div>
    </div>
  )
}
