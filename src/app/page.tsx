'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

function ConnectDigitalLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f97316" />
      <path d="M72 50c0 12.15-9.85 22-22 22s-22-9.85-22-22 9.85-22 22-22" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M58 28c0 0 8 4 10 14" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function MilleniumLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="16" fill="#1d4ed8"/>
      <text x="50" y="68" textAnchor="middle" fill="white" fontSize="58" fontWeight="900" fontFamily="system-ui">M</text>
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou senha incorretos.')
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Erro ao conectar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-zinc-900 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-500/5 blur-2xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <ConnectDigitalLogo size={36} />
            <div>
              <p className="text-white font-bold text-sm leading-none">Connect Digital</p>
              <p className="text-zinc-500 text-xs mt-0.5">A sua empresa na era digital</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          {/* Partnership card */}
          <div className="bg-zinc-800/60 backdrop-blur rounded-2xl p-6 border border-zinc-700/50">
            <div className="flex items-center gap-4 mb-4">
              <MilleniumLogo size={48} />
              <div>
                <p className="text-white font-bold text-lg leading-tight">Millenium</p>
                <p className="text-orange-400 text-sm font-medium">Desentupidora</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sistema financeiro e administrativo desenvolvido pela Connect Digital para gestão completa dos seus chamados, clientes e finanças.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Gestão completa de chamados e OS',
              'Dashboard financeiro em tempo real',
              'Relatórios e exportação em PDF',
              'Controle de clientes e histórico',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <p className="text-zinc-400 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Connect Digital · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logos */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <ConnectDigitalLogo size={32} />
          <div className="w-px h-8 bg-zinc-700" />
          <MilleniumLogo size={32} />
          <p className="text-white font-bold text-lg ml-1">Millenium</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
            <p className="text-zinc-400 text-sm">Acesse o sistema Millenium Financeiro</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-xl transition text-sm mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2">
            <ConnectDigitalLogo size={20} />
            <p className="text-zinc-600 text-xs">Desenvolvido por Connect Digital</p>
          </div>
        </div>
      </div>
    </div>
  )
}
