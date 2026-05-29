'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PhoneCall, CheckCircle, DollarSign, TrendingUp,
  TrendingDown, AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getDashboardStats, getNotifications } from '@/lib/db/dashboard'

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

export default function DashboardPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [stats, setStats] = useState<Stats | null>(null)
  const [notifications, setNotifications] = useState<Notifications | null>(null)
  const [loading, setLoading] = useState(true)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} – ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, n] = await Promise.all([
        getDashboardStats(currentWeek),
        getNotifications(),
      ])
      setStats(s)
      setNotifications(n)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [currentWeek])

  useEffect(() => { load() }, [load])

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Visão geral do financeiro e operacional</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="text-slate-400 hover:text-slate-700 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">{weekLabel}</span>
          </div>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="text-slate-400 hover:text-slate-700 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
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
