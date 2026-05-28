import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, PackageOpen, Search, Cpu, Users, LogOut, Activity,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

const nav = [
  { to: '/',            label: 'Registrar Devolução', icon: PackageOpen },
  { to: '/consulta',    label: 'Consulta',            icon: Search },
  { to: '/equipamentos',label: 'Equipamentos',        icon: Cpu },
  { to: '/tecnicos',    label: 'Técnicos',            icon: Users },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* ── Mobile overlay ─────────────────────────── */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col
          w-60 bg-surface-900 text-white transition-transform duration-200
          ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-base leading-none">Lab Control</p>
              <p className="text-[10px] text-white/40 mt-0.5 font-mono">v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSideOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-150
                 ${isActive
                   ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                   : 'text-white/60 hover:text-white hover:bg-white/10'
                 }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-white/40">Logado como</p>
            <p className="text-sm font-medium text-white/90 truncate">{usuario?.nome}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
              text-sm font-medium text-white/60 hover:text-white hover:bg-white/10
              transition-all duration-150"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-surface-200">
          <button
            onClick={() => setSideOpen(true)}
            aria-label="Abrir menu de navegação"
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-600"
          >
            <LayoutDashboard size={20} />
          </button>
          <span className="font-display font-bold text-surface-900">Lab Control</span>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}