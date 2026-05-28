import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Activity, Eye, EyeOff, Lock, Mail } from 'lucide-react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})
type Form = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setApiError('')
    try {
      await login(data.email, data.senha)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })
        ?.response?.data?.erro
      setApiError(msg || 'Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-brand-950 to-surface-950 p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/50 mb-4">
              <Activity size={28} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Lab Control</h1>
            <p className="text-white/40 text-sm mt-1">Gestão de devoluções de equipamentos</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full bg-white/10 border rounded-xl pl-9 pr-4 py-2.5
                    text-sm text-white placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-brand-400
                    transition-all duration-150
                    ${errors.email ? 'border-red-400' : 'border-white/20 focus:border-brand-400'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('senha')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/10 border rounded-xl pl-9 pr-10 py-2.5
                    text-sm text-white placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-brand-400
                    transition-all duration-150
                    ${errors.senha ? 'border-red-400' : 'border-white/20 focus:border-brand-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.senha && <p className="mt-1 text-xs text-red-400">{errors.senha.message}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-500 active:bg-brand-700
                text-white font-semibold py-2.5 px-4 rounded-xl
                transition-all duration-150 shadow-lg shadow-brand-900/40
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>

          {/* Link para cadastro */}
          <p className="text-center text-white/30 text-xs mt-6">
            Não tem uma conta?{' '}
            <Link to="/registro" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Criar conta
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Lab Control © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}