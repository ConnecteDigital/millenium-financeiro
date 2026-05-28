'use client'

import { useState } from 'react'
import { Plus, Search, CheckCircle, Clock, AlertCircle, TrendingDown, Repeat } from 'lucide-react'
import Link from 'next/link'

const mockExpenses = [
  { id: '1', description: 'Parcela Caminhão', category: 'Frota', amount: 2100, type: 'fixo', status: 'pendente', due_date: '2025-05-30', recurrence_day: 30 },
  { id: '2', description: 'Contador', category: 'Administrativo', amount: 450, type: 'fixo', status: 'pago', due_date: '2025-05-10', recurrence_day: 10 },
  { id: '3', description: 'Tráfego Pago Google', category: 'Marketing', amount: 3000, type: 'fixo', status: 'pago', due_date: '2025-05-15', recurrence_day: 15 },
  { id: '4', description: 'Mensalidade Agência', category: 'Marketing', amount: 1500, type: 'fixo', status: 'pago', due_date: '2025-05-05', recurrence_day: 5 },
  { id: '5', description: 'Salário Funcionário - João', category: 'Pessoal', amount: 2200, type: 'fixo', status: 'pendente', due_date: '2025-05-31', recurrence_day: 31 },
  { id: '6', description: 'Gasolina', category: 'Operacional', amount: 380, type: 'avulso', status: 'pago', due_date: '2025-05-22', recurrence_day: null },
  { id: '7', description: 'Almoço equipe - Serviço Canoas', category: 'Operacional', amount: 85, type: 'avulso', status: 'pago', due_date: '2025-05-21', recurrence_day: null },
]

export default function SaidasPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'todos' | 'fixo' | 'avulso'>('todos')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos')

  const filtered = mockExpenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'todos' || e.type === typeFilter
    const matchStatus = statusFilter === 'todos' || e.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const totalPago = mockExpenses.filter(e => e.status === 'pago').reduce((s, e) => s + e.amount, 0)
  const totalPendente = mockExpenses.filter(e => e.status === 'pendente').reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Saídas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Controle de despesas fixas e variáveis</p>
        </div>
        <Link
          href="/dashboard/saidas/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Lançar Saída
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            Total do Mês
          </div>
          <p className="text-xl font-bold text-slate-800">R$ {(totalPago + totalPendente).toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium uppercase mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Pago
          </div>
          <p className="text-xl font-bold text-emerald-600">R$ {totalPago.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-medium uppercase mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Pendente
          </div>
          <p className="text-xl font-bold text-amber-600">R$ {totalPendente.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Buscar despesa..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'fixo', 'avulso'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t === 'todos' ? 'Todos' : t === 'fixo' ? 'Fixos' : 'Avulsos'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['todos', 'pago', 'pendente'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s === 'todos' ? 'Todos' : s === 'pago' ? 'Pago' : 'Pendente'}
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
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Descrição</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Tipo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Vencimento</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Valor</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {e.type === 'fixo' && <Repeat className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                      <span className="text-sm font-medium text-slate-800">{e.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{e.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.type === 'fixo' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {e.type === 'fixo' ? 'Fixo' : 'Avulso'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(e.due_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    R$ {e.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      e.status === 'pago'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}>
                      {e.status === 'pago'
                        ? <><CheckCircle className="w-3 h-3" /> Pago</>
                        : <><Clock className="w-3 h-3" /> Pendente</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-slate-400 hover:text-slate-600 transition">Editar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Nenhuma saída encontrada
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
