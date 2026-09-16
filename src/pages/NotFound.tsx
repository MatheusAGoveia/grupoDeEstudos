import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'

export function NotFound() {
  return <main className="not-found"><Brand /><div className="not-found__code">404</div><h1>Você saiu do mapa.</h1><p>Esta parte da jornada ainda não existe.</p><Link className="button button--primary" to="/"><ArrowLeft size={18} />Voltar ao início</Link></main>
}
