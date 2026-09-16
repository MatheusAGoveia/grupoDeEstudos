import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { api } from './lib/api'
import type { SessionUser } from './types'
import { Home } from './pages/Home'
import { Auth } from './pages/Auth'
import { Journey } from './pages/Journey'
import { CandidatePortal } from './pages/CandidatePortal'
import { AdminDashboard } from './pages/AdminDashboard'
import { CandidateDetail } from './pages/CandidateDetail'
import { NotFound } from './pages/NotFound'

type AuthContextValue = {
  user: SessionUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setUser(await api<SessionUser>('/api/me'))
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>
}

function Guard({ role, children }: { role: 'candidate' | 'admin'; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-loader"><span /><p>Abrindo seu espaço...</p></div>
  if (!user || user.role !== role) return <Navigate to={role === 'admin' ? '/sala-zero' : '/entrar'} replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Auth mode="login" />} />
          <Route path="/comecar" element={<Auth mode="register" />} />
          <Route path="/sala-zero" element={<Auth mode="admin" />} />
          <Route path="/jornada" element={<Guard role="candidate"><Journey /></Guard>} />
          <Route path="/meu-espaco" element={<Guard role="candidate"><CandidatePortal /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><AdminDashboard /></Guard>} />
          <Route path="/admin/candidatos/:id" element={<Guard role="admin"><CandidateDetail /></Guard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
