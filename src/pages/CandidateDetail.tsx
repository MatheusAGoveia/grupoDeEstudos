import { ArrowLeft, BriefcaseBusiness, CalendarPlus, Check, ChevronDown, CircleGauge, Code2, CodeXml, ExternalLink, GraduationCap, MapPin, MessageCircleMore, NotebookPen, Plus, Send, Sparkles, Target, UserRound, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminShell } from '../components/AppShell'
import { Notice, StatusPill } from '../components/UI'
import { api } from '../lib/api'
import { formatDate, initials, statuses } from '../lib/format'
import type { Candidate, Conversation, Feedback, Note, Rating, StatusHistory } from '../types'

type DetailData = {
  candidate: Candidate
  notes: Note[]
  feedback: Feedback[]
  conversations: Conversation[]
  ratings: Rating[]
  history: StatusHistory[]
}

const ratingCriteria = [
  ['interesse', 'Interesse'], ['curiosidade', 'Curiosidade'], ['comunicacao', 'Comunicação'], ['tecnico', 'Conhecimento técnico'],
  ['disponibilidade', 'Disponibilidade'], ['colaboracao', 'Perfil colaborativo'], ['aprendizado', 'Vontade de aprender'],
]

const answerLabels: Record<string, string> = {
  dreamProject: 'Que tipo de projeto gostaria de construir?', curiosity: 'Área que mais desperta curiosidade', unknown: 'O que faz quando não sabe algo?',
  teamStyle: 'Prefere trabalhar sozinho ou em grupo?', wishlist: 'Tecnologia que sempre quis aprender', proud: 'Algo que construiu e dá orgulho',
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal"><header><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19} /></button></header>{children}</section></div>
}

export function CandidateDetail() {
  const { id } = useParams()
  const [data, setData] = useState<DetailData | null>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [conversationOpen, setConversationOpen] = useState(false)

  const load = useCallback(() => {
    api<DetailData>(`/api/admin/candidates/${id}`).then(setData).catch((err: Error) => setError(err.message))
  }, [id])
  useEffect(load, [load])

  const ratings = useMemo(() => Object.fromEntries(data?.ratings.map((item) => [item.criterion, item.score]) || []), [data])

  async function changeStatus(status: string) {
    if (!data) return
    setData({ ...data, candidate: { ...data.candidate, status } })
    await api(`/api/admin/candidates/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    load()
  }

  async function addNote(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    setSaving('note')
    await api(`/api/admin/candidates/${id}/notes`, { method: 'POST', body: JSON.stringify({ content: note }) })
    setNote('')
    setSaving('')
    load()
  }

  async function rate(criterion: string, score: number) {
    if (!data) return
    const next = { ...ratings, [criterion]: score }
    setData({ ...data, ratings: Object.entries(next).map(([key, value]) => ({ criterion: key, score: Number(value) })) })
    await api(`/api/admin/candidates/${id}/ratings`, { method: 'PUT', body: JSON.stringify(next) })
  }

  if (!data) return <AdminShell><div className="screen-loader"><span /><p>{error || 'Conhecendo este perfil...'}</p></div></AdminShell>
  const { candidate, notes, feedback, conversations, history } = data

  return (
    <AdminShell>
      <div className="detail-topbar"><Link to="/admin" className="nav-link"><ArrowLeft size={17} />Todas as pessoas</Link><div className="detail-topbar__actions"><button className="button button--ghost button--small" onClick={() => setConversationOpen(true)}><CalendarPlus size={16} />Marcar conversa</button><button className="button button--primary button--small" onClick={() => setFeedbackOpen(true)}><MessageCircleMore size={16} />Enviar feedback</button></div></div>

      <header className="candidate-hero">
        <div className="avatar avatar--xl">{initials(candidate.name)}</div>
        <div className="candidate-hero__copy"><div><h1>{candidate.name}</h1><StatusPill status={candidate.status} /></div><p>{candidate.email} {candidate.whatsapp && `· ${candidate.whatsapp}`}</p><div className="candidate-hero__meta">{candidate.city && <span><MapPin />{candidate.city}</span>}{candidate.course && <span><GraduationCap />{candidate.course} {candidate.period && `· ${candidate.period}`}</span>}</div></div>
        <label className="status-select"><span>Caminho atual</span><div><select value={candidate.status} onChange={(e) => changeStatus(e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></div></label>
      </header>

      <main className="detail-grid">
        <div className="detail-primary">
          <section className="detail-card intro-card"><div className="detail-card__head"><div className="detail-icon"><Target /></div><div><span className="page-kicker">POR QUE ESTÁ AQUI</span><h2>Motivação e momento</h2></div></div><blockquote>{candidate.motivation || 'Não compartilhou uma motivação.'}</blockquote><div className="intro-card__learning"><small>O que gostaria de aprender</small><p>{candidate.learning_goals || 'Não informou.'}</p></div></section>

          <section className="detail-card"><div className="detail-card__head"><div className="detail-icon detail-icon--purple"><Sparkles /></div><div><span className="page-kicker">ALÉM DO CURRÍCULO</span><h2>Respostas pessoais</h2></div></div><div className="answer-list">{Object.entries(answerLabels).map(([key, label], index) => <article key={key}><b>{String(index + 1).padStart(2, '0')}</b><div><small>{label}</small><p>{candidate.answers[key] || 'Não respondeu.'}</p></div></article>)}</div></section>

          <section className="detail-card"><div className="detail-card__head"><div className="detail-icon detail-icon--blue"><Code2 /></div><div><span className="page-kicker">BAGAGEM</span><h2>Projetos e experiências</h2></div></div><div className="prose-block"><small>Projetos que já construiu</small><p>{candidate.projects || 'Nenhum projeto descrito.'}</p></div><div className="prose-block"><small>Outras experiências</small><p>{candidate.experience || 'Nenhuma experiência descrita.'}</p></div></section>

          <section className="detail-card"><div className="detail-card__head"><div className="detail-icon detail-icon--orange"><MessageCircleMore /></div><div><span className="page-kicker">CONTATO</span><h2>Conversas e feedbacks</h2></div></div><div className="activity-list">{conversations.map((item) => <article key={item.id}><CalendarPlus /><div><strong>Conversa · {formatDate(item.scheduled_at)}</strong><p>{item.impression || item.observations || 'Conversa marcada.'}</p>{item.next_steps && <small>Próximo: {item.next_steps}</small>}</div></article>)}{feedback.map((item) => <article key={item.id}><Send /><div><strong>Feedback enviado · {formatDate(item.created_at)}</strong><p>{item.title}</p></div></article>)}{conversations.length + feedback.length === 0 && <p className="muted-copy">Ainda não há conversas ou feedbacks registrados.</p>}</div></section>
        </div>

        <aside className="detail-side">
          <section className="detail-card impression-card"><div className="detail-card__head"><div className="detail-icon"><CircleGauge /></div><div><span className="page-kicker">SUAS IMPRESSÕES</span><h2>Leitura rápida</h2></div></div><p className="muted-copy">Não é uma nota final. É só um jeito de organizar o que você percebeu.</p><div className="rating-list">{ratingCriteria.map(([key, label]) => <div key={key}><span>{label}</span><div>{[1, 2, 3, 4, 5].map((score) => <button key={score} className={(ratings[key] || 0) >= score ? 'active' : ''} onClick={() => rate(key, score)} aria-label={`${label}: ${score} de 5`} />)}</div></div>)}</div></section>

          <section className="detail-card notes-card"><div className="detail-card__head"><div className="detail-icon detail-icon--purple"><NotebookPen /></div><div><span className="page-kicker">SÓ PARA A EQUIPE</span><h2>Anotações privadas</h2></div></div><form onSubmit={addNote}><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Registre algo que não pode se perder..." /><button className="button button--ghost button--full" disabled={saving === 'note'}><Plus size={16} />Adicionar nota</button></form><div className="notes-list">{notes.map((item) => <article key={item.id}><p>{item.content}</p><small>{formatDate(item.created_at)}</small></article>)}</div></section>

          <section className="detail-card quick-card"><span className="page-kicker">RESUMO</span><div><small>Área de interesse</small><strong>{candidate.area_interest}</strong></div><div><small>Disponibilidade</small><strong>{candidate.availability}</strong></div><div><small>Tecnologias</small><span className="mini-profile__tags">{candidate.technologies.map((tech) => <span key={tech}>{tech}</span>)}</span></div></section>

          <section className="detail-card links-card"><span className="page-kicker">LINKS</span>{candidate.github && <a href={withProtocol(candidate.github)} target="_blank" rel="noreferrer"><CodeXml />GitHub<ExternalLink /></a>}{candidate.linkedin && <a href={withProtocol(candidate.linkedin)} target="_blank" rel="noreferrer"><BriefcaseBusiness />LinkedIn<ExternalLink /></a>}{candidate.portfolio && <a href={withProtocol(candidate.portfolio)} target="_blank" rel="noreferrer"><UserRound />Portfólio<ExternalLink /></a>}{!candidate.github && !candidate.linkedin && !candidate.portfolio && <p className="muted-copy">Nenhum link compartilhado.</p>}</section>

          <section className="detail-card history-card"><span className="page-kicker">HISTÓRICO</span>{history.map((item, index) => <div key={item.id} className={index === 0 ? 'active' : ''}><i /><span><strong>{item.status}</strong><small>{formatDate(item.created_at)}</small></span></div>)}</section>
        </aside>
      </main>

      {feedbackOpen && <FeedbackModal id={id!} name={candidate.name.split(' ')[0]} onClose={() => setFeedbackOpen(false)} onDone={() => { setFeedbackOpen(false); load() }} />}
      {conversationOpen && <ConversationModal id={id!} onClose={() => setConversationOpen(false)} onDone={() => { setConversationOpen(false); load() }} />}
    </AdminShell>
  )
}

function FeedbackModal({ id, name, onClose, onDone }: { id: string; name: string; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ title: '', message: '', positives: '', study_suggestions: '', project_idea: '', technologies: '', next_steps: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setSending(true); setError('')
    try { await api(`/api/admin/candidates/${id}/feedback`, { method: 'POST', body: JSON.stringify(form) }); onDone() } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar.') } finally { setSending(false) }
  }
  const field = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value })
  return <Modal title={`Feedback para ${name}`} onClose={onClose}><form className="modal-form" onSubmit={submit}><p className="modal-intro">Escreva como você falaria com a pessoa. Os campos extras são opcionais.</p>{error && <Notice tone="error">{error}</Notice>}<label><span>Título do retorno</span><input required value={form.title} onChange={(e) => field('title', e.target.value)} placeholder="Ex.: Gostei muito da nossa conversa" /></label><label><span>Mensagem principal</span><textarea required rows={5} value={form.message} onChange={(e) => field('message', e.target.value)} placeholder="Seja direto, humano e específico..." /></label><div className="form-grid"><label><span>Pontos positivos</span><textarea rows={3} value={form.positives} onChange={(e) => field('positives', e.target.value)} /></label><label><span>O que pode estudar</span><textarea rows={3} value={form.study_suggestions} onChange={(e) => field('study_suggestions', e.target.value)} /></label><label><span>Sugestão de projeto</span><textarea rows={3} value={form.project_idea} onChange={(e) => field('project_idea', e.target.value)} /></label><label><span>Próximos passos</span><textarea rows={3} value={form.next_steps} onChange={(e) => field('next_steps', e.target.value)} /></label></div><div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cancelar</button><button className="button button--primary" disabled={sending}>{sending ? 'Enviando...' : 'Enviar feedback'}<Send size={17} /></button></div></form></Modal>
}

function ConversationModal({ id, onClose, onDone }: { id: string; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ scheduled_at: '', observations: '', impression: '', interests: '', next_steps: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setSending(true); setError('')
    try { await api(`/api/admin/candidates/${id}/conversations`, { method: 'POST', body: JSON.stringify(form) }); onDone() } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível registrar.') } finally { setSending(false) }
  }
  const field = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value })
  return <Modal title="Registrar conversa" onClose={onClose}><form className="modal-form" onSubmit={submit}>{error && <Notice tone="error">{error}</Notice>}<label><span>Data e horário</span><input required type="datetime-local" value={form.scheduled_at} onChange={(e) => field('scheduled_at', e.target.value)} /></label><label><span>Observações</span><textarea rows={3} value={form.observations} onChange={(e) => field('observations', e.target.value)} placeholder="O que foi conversado?" /></label><label><span>Impressão geral</span><textarea rows={3} value={form.impression} onChange={(e) => field('impression', e.target.value)} /></label><label><span>Interesses identificados</span><textarea rows={3} value={form.interests} onChange={(e) => field('interests', e.target.value)} /></label><label><span>Próximos passos</span><textarea rows={3} value={form.next_steps} onChange={(e) => field('next_steps', e.target.value)} /></label><div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cancelar</button><button className="button button--primary" disabled={sending}>{sending ? 'Salvando...' : 'Salvar conversa'}<Check size={17} /></button></div></form></Modal>
}

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
