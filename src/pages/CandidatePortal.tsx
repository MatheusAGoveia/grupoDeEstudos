import { ArrowRight, CalendarClock, CheckCircle2, Code2, Compass, Lightbulb, MessageCircleHeart, Pencil, Rocket, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CandidateHeader } from '../components/AppShell'
import { EmptyState, StatusPill } from '../components/UI'
import { api } from '../lib/api'
import { formatDate, initials } from '../lib/format'
import type { Candidate, Conversation, Feedback, StatusHistory } from '../types'

type PortalData = { candidate: Candidate; feedback: Feedback[]; history: StatusHistory[]; conversations: Conversation[] }

const statusCopy: Record<string, { title: string; text: string }> = {
  'Nova inscrição': { title: 'Seu perfil chegou por aqui!', text: 'Agora vamos conhecer suas respostas com calma. Você não precisa fazer mais nada por enquanto.' },
  'Analisando': { title: 'Estamos conhecendo seu perfil.', text: 'Estamos lendo sua história, interesses e ideias. Assim que houver um próximo passo, avisamos por aqui.' },
  'Quero conversar': { title: 'Bora trocar uma ideia?', text: 'Gostamos do que vimos e queremos conhecer você além da tela. Confira os próximos passos.' },
  'Conversa realizada': { title: 'Valeu pela conversa!', text: 'Estamos organizando as impressões e em breve você recebe um retorno por aqui.' },
  'Selecionado': { title: 'Tem espaço para você na tripulação.', text: 'Que bom ter você com a gente. Confira os próximos passos para começarmos a construir.' },
  'Talvez futuramente': { title: 'Queremos manter essa ponte.', text: 'Talvez o momento ou o projeto ainda não encaixe, mas gostamos do seu perfil e queremos continuar por perto.' },
  'Não selecionado': { title: 'A jornada continua daqui.', text: 'Não vamos seguir juntos neste momento, mas deixamos um retorno pensado para ajudar nos seus próximos passos.' },
}

export function CandidatePortal() {
  const location = useLocation()
  const [data, setData] = useState<PortalData | null>(null)
  const [error, setError] = useState('')
  const justSubmitted = Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted)

  useEffect(() => {
    api<PortalData>('/api/candidate/me').then(setData).catch((err: Error) => setError(err.message))
  }, [])

  if (!data) return <div className="screen-loader"><span /><p>{error || 'Abrindo seu espaço...'}</p></div>
  const { candidate, feedback, history, conversations } = data
  const current = statusCopy[candidate.status] || statusCopy['Nova inscrição']
  const nextConversation = conversations[0]

  return (
    <div className="portal-page">
      <CandidateHeader><Link className="button button--small button--ghost" to="/jornada"><Pencil size={15} />Editar perfil</Link></CandidateHeader>
      {justSubmitted && <div className="success-banner"><div><Rocket /></div><span><strong>Perfil enviado. Agora deixa com a gente!</strong><small>Você pode acompanhar tudo nesta página.</small></span></div>}
      <main className="portal-wrap">
        <header className="portal-welcome">
          <div><span className="page-kicker">SEU ESPAÇO</span><h1>Oi, {candidate.name.split(' ')[0]}.</h1><p>Aqui você acompanha a jornada sem precisar ficar caçando mensagem.</p></div>
          <div className="profile-chip"><div className="avatar">{initials(candidate.name)}</div><span><strong>{candidate.name}</strong><small>{candidate.area_interest}</small></span></div>
        </header>

        <section className="status-hero">
          <div className="status-hero__glow" />
          <div className="status-hero__icon"><Compass /></div>
          <div className="status-hero__copy"><StatusPill status={candidate.status} /><h2>{current.title}</h2><p>{current.text}</p></div>
          <div className="status-hero__stamp"><small>Última atualização</small><strong>{formatDate(candidate.updated_at)}</strong></div>
        </section>

        <div className="portal-grid">
          <section className="panel panel--feedback">
            <div className="panel__head"><div><span className="page-kicker">FEEDBACKS</span><h2>Recados para sua jornada</h2></div><MessageCircleHeart /></div>
            {feedback.length === 0 ? <EmptyState icon={<MessageCircleHeart />} title="Nenhum feedback por enquanto" text="Quando tivermos um retorno, ele vai aparecer aqui — escrito para você, não por um robô de RH." /> : <div className="feedback-list">{feedback.map((item) => <article className="feedback-card" key={item.id}><div className="feedback-card__top"><Sparkles /><span>{formatDate(item.created_at)}</span></div><h3>{item.title}</h3><p>{item.message}</p><div className="feedback-details">{item.positives && <div><strong><CheckCircle2 />Pontos que chamaram atenção</strong><p>{item.positives}</p></div>}{item.study_suggestions && <div><strong><Lightbulb />Uma direção para estudar</strong><p>{item.study_suggestions}</p></div>}{item.project_idea && <div><strong><Code2 />Ideia para construir</strong><p>{item.project_idea}</p></div>}{item.next_steps && <div className="next-step"><strong>Próximo passo</strong><p>{item.next_steps}</p></div>}</div></article>)}</div>}
          </section>

          <aside className="portal-side">
            <section className="panel">
              <div className="panel__head"><div><span className="page-kicker">PRÓXIMOS PASSOS</span><h2>O que vem agora</h2></div><CalendarClock /></div>
              {nextConversation ? <div className="conversation-next"><span>Conversa marcada</span><strong>{formatDate(nextConversation.scheduled_at)}</strong>{nextConversation.next_steps && <p>{nextConversation.next_steps}</p>}</div> : <p className="muted-copy">Por enquanto, é só aguardar. Se quisermos conversar, os detalhes aparecem aqui.</p>}
            </section>
            <section className="panel mini-profile">
              <div className="panel__head"><div><span className="page-kicker">SEU PERFIL</span><h2>O que você compartilhou</h2></div></div>
              <div className="mini-profile__row"><span>Área</span><strong>{candidate.area_interest}</strong></div>
              <div className="mini-profile__row"><span>Disponibilidade</span><strong>{candidate.availability}</strong></div>
              <div className="mini-profile__tags">{candidate.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
              <Link to="/jornada" className="text-link">Ver ou editar tudo <ArrowRight size={15} /></Link>
            </section>
          </aside>
        </div>

        <section className="panel timeline-panel"><div className="panel__head"><div><span className="page-kicker">HISTÓRICO</span><h2>Sua linha do tempo</h2></div></div><div className="timeline">{history.map((item, index) => <div key={item.id} className={index === 0 ? 'active' : ''}><i /><span><strong>{item.status}</strong><small>{formatDate(item.created_at)}</small></span></div>)}</div></section>
      </main>
    </div>
  )
}
