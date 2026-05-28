import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/client'

interface Usuario {
    id: number
    nome: string
    email: string
}

interface AuthContextType {
    usuario: Usuario | null
    token: string | null
    loading: boolean
    login: (email: string, senha: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Restaura sessão salva no localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('lc_token')
        const savedUser = localStorage.getItem('lc_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUsuario(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email: string, senha: string) => {
        const res = await api.post('/auth/login', { email, senha })
        const { token: t, usuario: u } = res.data
        localStorage.setItem('lc_token', t)
        localStorage.setItem('lc_user', JSON.stringify(u))
        setToken(t)
        setUsuario(u)
    }

    const logout = () => {
        localStorage.removeItem('lc_token')
        localStorage.removeItem('lc_user')
        setToken(null)
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
    return ctx
}