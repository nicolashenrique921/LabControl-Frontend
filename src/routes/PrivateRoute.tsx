import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-surface-400 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return usuario ? <>{children}</> : <Navigate to="/login" replace />
}