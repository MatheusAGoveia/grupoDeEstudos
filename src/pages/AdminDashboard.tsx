import { ArrowRight, Clock3, MessageCircleMore, Search, SlidersHorizontal, Sparkles, UserRoundCheck, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminShell } from '../components/AppShell'
import { EmptyState, StatusPill } from '../components/UI'
import { api } from '../lib/api'
import { formatDate, initials, statuses } from '../lib/format'
import type { Candidate } from '../types'

type Count = { status: string; total: number }

export function AdminDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [counts, setCounts] = useState<Count[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'cards' | 'compact'>('cards')

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (status) query.set('status', status)
      setLoading(true)
      api<{ candidates: Candidate[]; counts: Count[] }>(`/api/admin/candidates?${query}`).then((data) => {
        setCandidates(data.candidates)
        setCounts(data.counts)
      }).finally(() => setLoading(false))
    }, 220)
    return () => clearTimeout(timeout)
  }, [search, status])

  const total = useMemo(() => counts.reduce((sum, item) => sum + Number(item.total), 0), [counts])
  const countFor = (value: string) => Number(counts.find((item) => item.status === value)?.total || 0)

  return (
    <AdminShell>
      <header className="admin-header"><div><span className="page-kicker">VISÃO GERAL</span><h1>Quem chegou por aqui</h1><p>Conheça as pessoas sem transformar ninguém em uma planilha.</p></div><div className="admin-header__date"><span>Hoje</span><strong>{new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())}</strong></div></header>

      <section className="stat-grid">
        <article><div className="stat-icon stat-icon--lime"><UsersRound /></div><span><small>Perfis recebidos</small><strong>{total}</strong></span><em>todo mundo</em></article>
        <article><div className="stat-icon stat-icon--purple"><Sparkles /></div><span><small>Para conhecer</small><strong>{countFor('Nova inscrição') + countFor('Analisando')}</strong></span><em>pedem atenção</em></article>
        <article><div className="stat-icon stat-icon--blue"><MessageCircleMore /></div><span><small>Conversas</small><strong>{countFor('Quero conversar') + countFor('Conversa realizada')}</strong></span><em>em andamento</em></article>
        <article><div className="stat-icon stat-icon--orange"><UserRoundCheck /></div><span><small>Na tripulação</small><strong>{countFor('Selecionado')}</strong></span><em>até agora</em></article>
      </section>

      <section className="candidate-section">
        <div className="candidate-section__top"><div><h2>Pessoas</h2><p>{candidates.length} {candidates.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}</p></div><div className="view-toggle"><button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button><button className={view === 'compact' ? 'active' : ''} onClick={() => setView('compact')}>Lista</button></div></div>
        <div className="filters"><label className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, área ou tecnologia..." /></label><label className="select-box"><SlidersHorizontal size={17} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos os caminhos</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className={`candidate-list candidate-list--${view}`}>
          {loading ? Array.from({ length: 4 }).map((_, index) => <div className="candidate-skeleton" key={index} />) : candidates.length === 0 ? <EmptyState icon={<UsersRound />} title="Ninguém por aqui ainda" text={search || status ? 'Tente limpar os filtros para encontrar outros perfis.' : 'Quando alguém terminar a jornada, o perfil aparece aqui.'} /> : candidates.map((candidate) => <Link to={`/admin/candidatos/${candidate.id}`} className="candidate-card" key={candidate.id}>
            <div className="candidate-card__top"><div className="avatar">{initials(candidate.name)}</div><StatusPill status={candidate.status} /></div>
            <div className="candidate-card__name"><h3>{candidate.name}</h3><p>{candidate.course || 'Caminho autodidata'} {candidate.city && `· ${candidate.city}`}</p></div>
            <div className="candidate-card__focus"><small>Interesse principal</small><strong>{candidate.area_interest}</strong></div>
            <div className="candidate-card__tags">{candidate.technologies.slice(0, 4).map((tech) => <span key={tech}>{tech}</span>)}{candidate.technologies.length > 4 && <span>+{candidate.technologies.length - 4}</span>}</div>
            <div className="candidate-card__bottom"><span><Clock3 size={14} />{candidate.availability}</span><span>{formatDate(candidate.submitted_at)}</span><ArrowRight size={18} /></div>
          </Link>)}
        </div>
      </section>
    </AdminShell>
  )
}
