'use client'

import { useState } from 'react'
import {
  PhoneCall, CheckCircle, DollarSign, TrendingUp,
  TrendingDown, AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const mockNotifications = [
  { id: 1, type: 'agendado', text: 'Serviço agendado para hoje - João Silva (Av. Ipiranga, 1200)', time: '08:00' },
  { id: 2, type: 'agendado', text: 'Serviço agendado para hoje - Condomínio Boa Vista', time: '14:00' },
  { id: 3, type: 'receber', text: 'Falta receber R$ 350,00 - Carlos Eduardo (venc. hoje)', time: null },
  { id: 4, type: 'receber', text: 'Falta receber R$ 800,00 - Restaurante Sabor & Arte (venc. ontem)', time: null },
  { id: 5, type: 'conta', text: 'Conta a pagar: Parcela Caminhão R$ 2.100,00 (venc. em 2 dias)', time: null },
]

const mockStats = {
  total_calls: 24,
  approved_calls: 18,
  gross_revenue: 15800,
  net_revenue: 9240,
  pending_receivables: 3200,
  total_expenses: 6560,
}

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
        <div className={`p-2.5 rounded-lg bg-slate-50`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })

  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} – ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`

  const agendados = mockNotifications.filter(n => n.type === 'agendado')
  const receber = mockNotifications.filter(n => n.type === 'receber')
  const contas = mockNotifications.filter(n => n.type === 'conta')

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Visão geral do financeiro e operacional</p>
        </div>

        {/* Week selector */}
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={PhoneCall}
          label="Total de Chamados"
          value={String(mockStats.total_calls)}
          color="text-slate-700"
          sub={`${mockStats.approved_calls} aprovados`}
        />
        <StatCard
          icon={CheckCircle}
          label="Taxa de Aprovação"
          value={`${Math.round((mockStats.approved_calls / mockStats.total_calls) * 100)}%`}
          color="text-emerald-600"
          sub={`${mockStats.total_calls - mockStats.approved_calls} não aprovados`}
        />
        <StatCard
          icon={DollarSign}
          label="Receita Bruta"
          value={`R$ ${mockStats.gross_revenue.toLocaleString('pt-BR')}`}
          color="text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Receita Líquida"
          value={`R$ ${mockStats.net_revenue.toLocaleString('pt-BR')}`}
          color="text-emerald-600"
          sub="após todos os custos"
        />
        <StatCard
          icon={AlertCircle}
          label="A Receber"
          value={`R$ ${mockStats.pending_receivables.toLocaleString('pt-BR')}`}
          color="text-amber-600"
          sub="pagamentos em aberto"
        />
        <StatCard
          icon={TrendingDown}
          label="Total de Saídas"
          value={`R$ ${mockStats.total_expenses.toLocaleString('pt-BR')}`}
          color="text-red-500"
        />
      </div>

      {/* Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agendados hoje */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-blue-50">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-blue-800">Agendados Hoje</h3>
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{agendados.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {agendados.length === 0 ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhum agendamento hoje</p>
            ) : agendados.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">{n.time}</span>
                  <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* A receber */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-sm text-amber-800">Pagamentos Pendentes</h3>
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{receber.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {receber.length === 0 ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhum pendente</p>
            ) : receber.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contas a pagar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-red-50">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-sm text-red-800">Contas a Pagar</h3>
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{contas.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {contas.length === 0 ? (
              <p className="text-slate-400 text-sm px-4 py-6 text-center">Nenhuma conta pendente</p>
            ) : contas.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition">
                <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
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
