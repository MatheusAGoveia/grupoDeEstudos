import { ArrowRight, Blocks, Code2, HeartHandshake, MessageCircleMore, Sparkles, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useRef } from 'react'
import { useAuth } from '../App'

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destination = user?.role === 'admin' ? '/admin' : user?.role === 'candidate' ? (user.application_state === 'draft' ? '/jornada' : '/meu-espaco') : '/comecar'

  return (
    <main className="home">
      <nav className="home__nav">
        <Brand />
        <div>
          <Link className="nav-link" to="/entrar">Já tenho um perfil</Link>
          <Link className="button button--small button--ghost" to={destination}>{user ? 'Continuar' : 'Bora conversar'}<ArrowRight size={16} /></Link>
        </div>
      </nav>

      <section className="home__hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Convite aberto para gente curiosa</div>
          <h1>Seu próximo projeto pode começar com um <em>“bora?”</em></h1>
          <p>Estamos juntando uma galera para aprender, trocar ideia e construir produtos reais. Sem currículo perfeito. Sem perguntas pegadinha. Só queremos conhecer você de verdade.</p>
          <div className="hero-copy__actions">
            <Link className="button button--primary button--large" to={destination}>{user ? 'Continuar de onde parei' : 'Criar meu perfil'}<ArrowRight size={19} /></Link>
            <span>leva cerca de 8 min<br />e você pode salvar no caminho</span>
          </div>
        </div>

        <div className="crew-orbit" aria-label="Uma equipe com pessoas de diferentes áreas criando juntas">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <div className="orbit__core"><Blocks size={30} /><strong>próximo<br />projeto</strong></div>
          <div className="player-card player-card--front"><span>FR</span><div><small>frontend</small><strong>faz acontecer</strong></div></div>
          <div className="player-card player-card--back"><span>BE</span><div><small>backend</small><strong>resolve o impossível</strong></div></div>
          <div className="player-card player-card--design"><span>UX</span><div><small>design</small><strong>pensa nas pessoas</strong></div></div>
          <div className="orbit__spark orbit__spark--a">✦</div>
          <div className="orbit__spark orbit__spark--b">+</div>
        </div>
      </section>

      <section className="home__promise">
        <div className="promise-intro"><span className="section-index">01 / A IDEIA</span><h2>Não é sobre provar que você já sabe tudo.</h2></div>
        <div className="promise-copy">
          <p>É sobre descobrir como você pensa, o que te dá curiosidade e o que faria seus olhos brilharem em um projeto.</p>
          <div className="promise-grid">
            <article><Code2 /><h3>O que você curte</h3><p>Tecnologias, áreas e ideias que despertam sua curiosidade.</p></article>
            <article><UsersRound /><h3>Como você funciona</h3><p>Seu jeito de aprender, colaborar e enfrentar algo novo.</p></article>
            <article><Sparkles /><h3>Onde quer chegar</h3><p>O que você quer praticar e construir junto com a gente.</p></article>
          </div>
        </div>
      </section>

      <section className="home__path">
        <span className="section-index">02 / SUA JORNADA</span>
        <div className="path-line">
          <div className="path-step"><b>1</b><div><strong>Crie seu perfil</strong><span>Conte quem é você</span></div></div>
          <div className="path-step"><b>2</b><div><strong>Mostre sua órbita</strong><span>Interesses e curiosidades</span></div></div>
          <div className="path-step"><b>3</b><div><strong>Vamos conversar</strong><span>Sem entrevista engessada</span></div></div>
          <div className="path-step"><b>4</b><div><strong>Receba um retorno</strong><span>Humano e útil de verdade</span></div></div>
        </div>
      </section>

      <section className="home__final">
        <div className="final-icon"><HeartHandshake /></div>
        <h2>Mesmo que não role agora,<br />a conversa precisa valer a pena.</h2>
        <p>Todo mundo merece sair com uma direção, uma ideia ou alguma coisa nova para construir.</p>
        <Link className="button button--primary button--large" to={destination}>Quero participar <MessageCircleMore size={19} /></Link>
      </section>

      <footer><Brand compact /><span>Feito para gente que aprende fazendo.</span><button className="secret-entry" aria-label="Elemento decorativo" onPointerDown={() => { secretTimer.current = setTimeout(() => navigate('/sala-zero'), 2200) }} onPointerUp={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }} onPointerLeave={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }}><i /><i /><i /></button></footer>
    </main>
  )
}
