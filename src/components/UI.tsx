import type { ReactNode } from 'react'

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '-')
  return <span className={`status-pill status-pill--${key}`}><i />{status}</span>
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state__icon">{icon}</div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function Notice({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'error' | 'success' }) {
  return <div className={`notice notice--${tone}`}>{children}</div>
}
