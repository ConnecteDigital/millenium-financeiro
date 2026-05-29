'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PhoneCall, CheckCircle, DollarSign, TrendingUp,
  TrendingDown, AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getDashboardStatsRange, getNotifications } from '@/lib/db/dashboard'

interface Stats {
  total_calls: number
  approved_calls: number
  gross_revenue: number
  net_revenue: number
  pending_receivables: number
  total_expenses: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notifications = any

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType, label: string, value: string, color: string, sub?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

type DateMode = 'dia' | 'semana' | 'mes' | 'livre'

export default function DashboardPage() {
  const today = new Date()
  const [mode, setMode] = useState<DateMode>('semana')
  const [refDate, setRefDate] = useState(today)
  const [customStart, setCustomStart] = useState(format(today, 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(today, 'yyyy-MM-dd'))
  const [stats, setStats] = useState<Stats | null>(null)
  const [notifications, setNotifications] = useState<Notifications | null>(null)
  const [loading, setLoading] = useState(true)

  // Calcular start/end com base no modo
  const { start, end, label } = (() => {
    if (mode === 'dia') {
      const d = format(refDate, 'yyyy-MM-dd')
      return { start: d, end: d, label: format(refDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) }
    }
    if (mode === 'semana') {
      const s = startOfWeek(refDate, { weekStartsOn: 1 })
      const e = endOfWeek(refDate, { weekStartsOn: 1 })
      return {
        start: format(s, 'yyyy-MM-dd'), end: format(e, 'yyyy-MM-dd'),
        label: `${format(s, "d 'de' MMM", { locale: ptBR })} – ${format(e, "d 'de' MMM", { locale: ptBR })}`
      }
    }
    if (mode === 'mes') {
      const s = startOfMonth(refDate)
      const e = endOfMonth(refDate)
      return {
        start: format(s, 'yyyy-MM-dd'), end: format(e, 'yyyy-MM-dd'),
        label: format(refDate, "MMMM 'de' yyyy", { locale: ptBR })
      }
    }
    // livre
    return { start: customStart, end: customEnd, label: `${new Date(customStart + 'T12:00:00').toLocaleDateString('pt-BR')} – ${new Date(customEnd + 'T12:00:00').toLocaleDateString('pt-BR')}` }
  })()

  function prev() {
    if (mode === 'dia') setRefDate(d => subDays(d, 1))
    else if (mode === 'semana') setRefDate(d => subWeeks(d, 1))
    else if (mode === 'mes') setRefDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function next() {
    if (mode === 'dia') setRefDate(d => addDays(d, 1))
    else if (mode === 'semana') setRefDate(d => addWeeks(d, 1))
    else if (mode === 'mes') setRefDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, n] = await Promise.all([
        getDashboardStatsRange(start, end),
        getNotifications(),
      ])
      setStats(s)
      setNotifications(n)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [start, end])

  useEffect(() => { load() }, [load])

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Visão geral do financeiro e operacional</p>
          </div>
          {/* Modo */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(['dia','semana','mes','livre'] as DateMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition ${mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'dia' ? 'Dia' : m === 'semana' ? 'Semana' : m === 'mes' ? 'Mês' : 'Livre'}
              </button>
            ))}
          </div>
        </div>

        {/* Navegação de datas */}
        {mode !== 'livre' ? (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm w-fit">
            <button onClick={prev} className="text-slate-400 hover:text-slate-700 transition p-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700 capitalize">{label}</span>
            </div>
            <button onClick={next} className="text-slate-400 hover:text-slate-700 transition p-1">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setRefDate(today)}
              className="ml-1 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-2 py-1 rounded">
              Hoje
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="text-sm text-slate-700 focus:outline-none" />
              <span className="text-slate-400">–</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="text-sm text-slate-700 focus:outline-none" />
            </div>
            <button onClick={load} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
              <div className="h-7 bg-slate-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={PhoneCall} label="Total de Chamados" value={String(stats.total_calls)} color="text-slate-700" sub={`${stats.approved_calls} aprovados`} />
          <StatCard icon={CheckCircle} label="Taxa de Aprovação"
            value={stats.total_calls > 0 ? `${Math.round((stats.approved_calls / stats.total_calls) * 100)}%` : '0%'}
            color="text-emerald-600" sub={`${stats.total_calls - stats.approved_calls} não aprovados`} />
          <StatCard icon={DollarSign} label="Receita Bruta" value={fmt(stats.gross_revenue)} color="text-blue-600" />
          <StatCard icon={TrendingUp} label="Receita Líquida" value={fmt(stats.net_revenue)} color="text-emerald-600" sub="após todos os custos" />
          <StatCard icon={AlertCircle} label="A Receber" value={fmt(stats.pending_receivables)} color="text-amber-600" sub="pagamentos em aberto" />
          <StatCard icon={TrendingDown} label="Total de Saídas" value={fmt(stats.total_expenses)} color="text-red-500" />
        </div>
      ) : null}

      {/* Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agendados */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-blue-50">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-blue-800">Agendados Hoje</h3>
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications?.scheduled.length ?? 0}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {!notifications?.scheduled.length ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhum agendamento hoje</p>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) : notifications.scheduled.map((n: any) => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <p className="text-sm font-medium text-slate-700">{n.client?.name ?? 'Cliente não informado'}</p>
                {n.notes && <p className="text-xs text-slate-400 mt-0.5">{n.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Pagamentos pendentes */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-sm text-amber-800">Pagamentos Pendentes</h3>
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications?.pendingPayments.length ?? 0}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {!notifications?.pendingPayments.length ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhum pendente</p>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) : notifications.pendingPayments.map((n: any) => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <p className="text-sm font-medium text-slate-700">{n.client?.name ?? 'Cliente'}</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Falta: {fmt(n.remaining_amount || n.total_value || 0)}
                  {n.remaining_due_date && ` · venc. ${new Date(n.remaining_due_date).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contas a pagar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-red-50">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-sm text-red-800">Contas a Pagar</h3>
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications?.pendingExpenses.length ?? 0}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {!notifications?.pendingExpenses.length ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhuma conta pendente</p>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) : notifications.pendingExpenses.map((n: any) => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <p className="text-sm font-medium text-slate-700">{n.description}</p>
                <p className="text-xs text-red-500 mt-0.5">
                  {fmt(n.amount)} · venc. {new Date(n.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard/chamados/novo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <PhoneCall className="w-4 h-4" />
            Novo Chamado
          </a>
          <a href="/dashboard/clientes/novo" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Novo Cliente
          </a>
          <a href="/dashboard/saidas/novo" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Lançar Saída
          </a>
          <a href="/dashboard/relatorios" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Ver Relatórios
          </a>
        </div>
      </div>
    </div>
  )
}
