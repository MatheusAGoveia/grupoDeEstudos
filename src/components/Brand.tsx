import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="DevGroupX — início">
      <span className="brand__symbol" aria-hidden="true"><img src="/devgroupx-logo.png" alt="" width="1356" height="1160" /></span>
      <span>DevGroup<span className="brand__x">X</span><span className="brand__dot">.</span></span>
    </Link>
  )
}
