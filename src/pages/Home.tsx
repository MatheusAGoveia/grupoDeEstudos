import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { Brand } from '../components/Brand'

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destination = user?.role === 'admin' ? '/admin' : user?.role === 'candidate' ? (user.application_state === 'draft' ? '/jornada' : '/meu-espaco') : '/comecar'

  return (
    <main className="home" id="inicio">
      <a className="skip-link" href="#apresentacao">Pular para o conteúdo</a>
      <nav className="home__nav" aria-label="Navegação principal">
        <Brand />
        <div>
          <a className="nav-link home__site-link" href="https://devgroupx.com/sobre">O grupo</a>
          <a className="nav-link home__site-link" href="https://devgroupx.com/suporte">Suporte</a>
          <Link className="nav-link" to="/entrar">Entrar</Link>
          <Link className="button button--small button--primary" to={destination}>{user ? 'Meu espaço' : 'Criar perfil'}<ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className="home__hero" id="apresentacao" aria-labelledby="home-title">
        <div className="home__brand-art" aria-hidden="true"><img src="/devgroupx-logo.png" alt="" width="1356" height="1160" /></div>
        <div className="home__grid" aria-hidden="true" />
        <div className="home__intro">
          <span className="home__label"><span /> SEU ESPAÇO NO DEVGROUPX</span>
          <h1 id="home-title">Um perfil.<br />Novas conexões.<br /><em>Projetos reais.</em></h1>
          <p>Conte o que você quer aprender e construir. Encontre seu lugar no grupo e acompanhe os próximos passos em um só espaço.</p>
          <div className="home__actions">
            <Link className="button button--primary" to={destination}>{user ? 'Continuar de onde parei' : 'Criar meu perfil'}<ArrowRight size={17} /></Link>
            <Link className="text-link" to="/entrar">Já tenho uma conta<ArrowRight size={15} /></Link>
          </div>
          <span className="home__save-note">Salve o progresso. Continue no seu tempo.</span>
        </div>
        <aside className="home__note" aria-label="Sobre o grupo">
          <span>DIFERENTES NÍVEIS. A MESMA CURIOSIDADE.</span>
          <p>Do primeiro projeto ao próximo desafio, tem espaço para aprender e contribuir com outras pessoas.</p>
          <div><span>estudo</span><span>troca</span><span>projetos</span></div>
        </aside>
      </section>

      <section className="home__details" aria-labelledby="home-details-title">
        <div className="home__details-intro">
          <span className="home__label">01 / DO PERFIL À PRÁTICA</span>
          <h2 id="home-details-title">O próximo passo<br /><span>é seu.</span></h2>
          <p>O formulário ajuda a entender seus interesses, sua disponibilidade e o que você gostaria de fazer no grupo.</p>
        </div>
        <ol className="home__steps">
          <li><span>01</span><div><h3>Conte um pouco sobre você</h3><p>Interesses, projetos e experiências. Pode escrever do seu jeito.</p></div></li>
          <li><span>02</span><div><h3>A gente lê seu perfil</h3><p>A equipe conhece as respostas e registra o andamento no seu espaço.</p></div></li>
          <li><span>03</span><div><h3>Seguimos por aqui</h3><p>Se houver uma conversa ou um retorno, você encontra os detalhes no seu perfil.</p></div></li>
        </ol>
      </section>

      <section className="home__invitation" aria-labelledby="home-invitation-title">
        <div><span className="home__label">CONHECIMENTO QUE CIRCULA</span><h2 id="home-invitation-title">Aprender. Construir.<br /><span>Evoluir juntos.</span></h2><p>Conheça a proposta do grupo, explore os projetos e traga suas ideias.</p></div>
        <a className="button button--ghost" href="https://devgroupx.com/">Conhecer o DevGroupX<ArrowRight size={17} /></a>
      </section>

      <footer className="home__footer">
        <Brand compact />
        <span>Feito de pessoas. Movido por curiosidade.</span>
        <a className="nav-link" href="https://devgroupx.com/faq">FAQ</a>
        <a className="nav-link" href="https://devgroupx.com/suporte">Suporte</a>
        <button className="secret-entry" aria-label="Elemento decorativo" onPointerDown={() => { secretTimer.current = setTimeout(() => navigate('/sala-zero'), 2200) }} onPointerUp={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }} onPointerLeave={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }}><i /><i /><i /></button>
      </footer>
    </main>
  )
}
