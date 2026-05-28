import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Activity, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import api from '../api/client'

const schema = z.object({
  nome:  z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(1, 'Confirme a senha'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type Form = z.infer<typeof schema>

export default function Registro() {
  const navigate = useNavigate()
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError,    setApiError]    = useState('')
  const [sucesso,     setSucesso]     = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setApiError('')
    try {
      await api.post('/auth/registro', {
        nome:  data.nome.trim(),
        email: data.email.trim(),
        senha: data.senha,
      })
      setSucesso(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })
        ?.response?.data?.erro
      setApiError(msg || 'Erro ao criar conta')
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/50 mb-4">
              <Activity size={28} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Lab Control</h1>
            <p className="text-white/40 text-sm mt-1">Criar nova conta</p>
          </div>

          {/* Sucesso */}
          {sucesso ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium">Conta criada com sucesso!</p>
              <p className="text-white/40 text-sm mt-1">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Nome completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    {...register('nome')}
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    className={`w-full bg-white/10 border rounded-xl pl-9 pr-4 py-2.5
                      text-sm text-white placeholder:text-white/25
                      focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-150
                      ${errors.nome ? 'border-red-400' : 'border-white/20 focus:border-brand-400'}`}
                  />
                </div>
                {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome.message}</p>}
              </div>

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
                      focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-150
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
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className={`w-full bg-white/10 border rounded-xl pl-9 pr-10 py-2.5
                      text-sm text-white placeholder:text-white/25
                      focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-150
                      ${errors.senha ? 'border-red-400' : 'border-white/20 focus:border-brand-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.senha && <p className="mt-1 text-xs text-red-400">{errors.senha.message}</p>}
              </div>

              {/* Confirmar senha */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    {...register('confirmarSenha')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className={`w-full bg-white/10 border rounded-xl pl-9 pr-10 py-2.5
                      text-sm text-white placeholder:text-white/25
                      focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-150
                      ${errors.confirmarSenha ? 'border-red-400' : 'border-white/20 focus:border-brand-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmarSenha && <p className="mt-1 text-xs text-red-400">{errors.confirmarSenha.message}</p>}
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
                    Criando conta...
                  </>
                ) : 'Criar conta'}
              </button>
            </form>
          )}

          {/* Link para login */}
          {!sucesso && (
            <p className="text-center text-white/30 text-xs mt-6">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Entrar
              </Link>
            </p>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Lab Control © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}