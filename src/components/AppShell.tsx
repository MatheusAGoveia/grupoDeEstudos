import type { ReactNode } from 'react'
import { LayoutDashboard, LogOut, UsersRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { Brand } from './Brand'

export function CandidateHeader({ children }: { children?: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="topbar">
      <Brand />
      <div className="topbar__actions">
        {children}
        <button className="icon-button" title="Sair" onClick={async () => { await logout(); navigate('/') }}><LogOut size={18} /></button>
      </div>
    </header>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Brand compact />
        <div className="sidebar__caption">Sala de comando</div>
        <nav>
          <NavLink to="/admin" end><LayoutDashboard size={18} />Visão geral</NavLink>
          <NavLink to="/admin"><UsersRound size={18} />Pessoas</NavLink>
        </nav>
        <button className="sidebar__logout" onClick={async () => { await logout(); navigate('/') }}><LogOut size={17} />Sair</button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
