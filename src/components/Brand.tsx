import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Tripulação — início">
      <span className="brand__mark" aria-hidden="true"><i /><i /><b /></span>
      <span>tripulação<span className="brand__dot">.</span></span>
    </Link>
  )
}
