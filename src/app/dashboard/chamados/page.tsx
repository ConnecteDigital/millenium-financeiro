'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Phone, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

type Status = 'todos' | 'agendado' | 'aprovado' | 'nao_quis_visita' | 'cancelado'

const statusConfig: Record<string, { label: string, color: string, icon: React.ElementType }> = {
  agendado: { label: 'Agendado', color: 'bg-blue-100 text-blue-700', icon: Clock },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  nao_quis_visita: { label: 'Não quis visita', color: 'bg-slate-100 text-slate-600', icon: XCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-600', icon: XCircle },
}

const originLabel: Record<string, string> = {
  site_millenium: 'Site Millenium',
  site_praja: 'Site Pra Já',
  indicacao: 'Indicação',
  terceirizado: 'Terceirizado',
}

const mockChamados = [
  { id: '1', date: '2025-05-28', client: 'João Silva', origin: 'site_millenium', status: 'aprovado', value: 850, payment_status: 'pago' },
  { id: '2', date: '2025-05-28', client: 'Condomínio Boa Vista', origin: 'site_praja', status: 'agendado', value: 1200, payment_status: 'pendente' },
  { id: '3', date: '2025-05-27', client: 'Restaurante Sabor & Arte', origin: 'indicacao', status: 'aprovado', value: 600, payment_status: 'pago_parcial' },
  { id: '4', date: '2025-05-27', client: 'Carlos Eduardo', origin: 'site_millenium', status: 'nao_quis_visita', value: 0, payment_status: 'pendente' },
  { id: '5', date: '2025-05-26', client: 'Maria Santos', origin: 'terceirizado', status: 'aprovado', value: 700, payment_status: 'pago' },
  { id: '6', date: '2025-05-26', client: 'Empresa XPTO Ltda', origin: 'site_millenium', status: 'cancelado', value: 0, payment_status: 'pendente' },
]

const paymentBadge: Record<string, string> = {
  pago: 'bg-emerald-100 text-emerald-700',
  pago_parcial: 'bg-amber-100 text-amber-700',
  pendente: 'bg-red-100 text-red-600',
}
const paymentLabel: Record<string, string> = {
  pago: 'Pago',
  pago_parcial: 'Parcial',
  pendente: 'Pendente',
}

export default function ChamadosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status>('todos')

  const filtered = mockChamados.filter(c => {
    const matchSearch = c.client.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chamados</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gerencie todos os chamados e ordens de serviço</p>
        </div>
        <Link
          href="/dashboard/chamados/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Chamado
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['todos', 'agendado', 'aprovado', 'nao_quis_visita', 'cancelado'] as Status[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'todos' ? 'Todos' : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Origem</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Valor</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Pagamento</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => {
                const StatusIcon = statusConfig[c.status]?.icon || Phone
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(c.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-800">{c.client}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{originLabel[c.origin]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[c.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[c.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                      {c.value > 0 ? `R$ ${c.value.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'aprovado' ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadge[c.payment_status]}`}>
                          {paymentLabel[c.payment_status]}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/chamados/${c.id}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Nenhum chamado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
