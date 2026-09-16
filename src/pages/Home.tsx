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
    <main className="home">
      <nav className="home__nav" aria-label="Navegação principal">
        <Brand />
        <div>
          <Link className="nav-link" to="/entrar">Entrar</Link>
          <Link className="button button--small button--ghost" to={destination}>{user ? 'Meu espaço' : 'Criar perfil'}<ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className="home__hero">
        <div className="home__intro">
          <span className="home__label"><span /> Grupo de estudos e projetos</span>
          <h1>Aprender junto.<br /><em>Construir de verdade.</em></h1>
          <p>A Tripulação reúne pessoas de áreas diferentes para estudar, trocar ideias e criar projetos em equipe.</p>
          <div className="home__actions">
            <Link className="button button--primary" to={destination}>{user ? 'Continuar' : 'Apresentar meu perfil'}<ArrowRight size={17} /></Link>
            <span>Você pode salvar e continuar depois.</span>
          </div>
        </div>
        <aside className="home__note" aria-label="Sobre o grupo">
          <span>01 / SOBRE O GRUPO</span>
          <p>Tem espaço para quem já fez projetos e para quem está começando. O que importa é ter vontade de aprender com outras pessoas.</p>
          <div><span>estudo</span><span>troca</span><span>projetos</span></div>
        </aside>
      </section>

      <section className="home__details" aria-labelledby="home-details-title">
        <div className="home__details-intro">
          <span className="home__label">02 / COMO PARTICIPAR</span>
          <h2 id="home-details-title">Um perfil para começar.</h2>
          <p>O formulário ajuda a entender seus interesses, sua disponibilidade e o que você gostaria de fazer no grupo.</p>
        </div>
        <ol className="home__steps">
          <li><span>01</span><div><h3>Conte um pouco sobre você</h3><p>Interesses, projetos e experiências. Pode escrever do seu jeito.</p></div></li>
          <li><span>02</span><div><h3>A gente lê seu perfil</h3><p>A equipe conhece as respostas e registra o andamento no seu espaço.</p></div></li>
          <li><span>03</span><div><h3>Seguimos por aqui</h3><p>Se houver uma conversa ou um retorno, você encontra os detalhes no seu perfil.</p></div></li>
        </ol>
      </section>

      <footer className="home__footer">
        <Brand compact />
        <span>Um espaço para aprender fazendo.</span>
        <button className="secret-entry" aria-label="Elemento decorativo" onPointerDown={() => { secretTimer.current = setTimeout(() => navigate('/sala-zero'), 2200) }} onPointerUp={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }} onPointerLeave={() => { if (secretTimer.current) clearTimeout(secretTimer.current) }}><i /><i /><i /></button>
      </footer>
    </main>
  )
}
