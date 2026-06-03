'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, CheckCircle, XCircle, Clock, ChevronRight, CalendarDays, List, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCalls, updateCall } from '@/lib/db/calls'

type Status = 'todos' | 'agendado' | 'aprovado' | 'nao_quis_visita' | 'nao_aprovou' | 'cancelado'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  agendado:        { label: 'Agendado',     color: 'bg-blue-50 text-blue-700 border-blue-200',          icon: Clock },
  aprovado:        { label: 'Aprovado',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  nao_quis_visita: { label: 'Não quis',    color: 'bg-zinc-100 text-zinc-600 border-zinc-200',          icon: XCircle },
  nao_aprovou:     { label: 'Não aprovou', color: 'bg-orange-50 text-orange-700 border-orange-200',     icon: XCircle },
  cancelado:       { label: 'Cancelado',   color: 'bg-red-50 text-red-600 border-red-200',              icon: XCircle },
}

const paymentConfig: Record<string, { label: string; color: string }> = {
  pago:        { label: 'Pago',    color: 'text-emerald-600' },
  pago_parcial:{ label: 'Parcial', color: 'text-amber-600' },
  pendente:    { label: 'Pendente',color: 'text-red-500' },
}

const originLabel: Record<string, string> = {
  site_lider: 'Site Líder',
  site_poa: 'Site POA',
  indicacao: 'Indicacao',
  terceirizado: 'Terceirizado',
}

const filters: { value: Status; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'nao_quis_visita', label: 'Não quis' },
  { value: 'nao_aprovou', label: 'Não aprovou' },
  { value: 'cancelado', label: 'Cancelado' },
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days: (number | null)[] = Array(first.getDay()).fill(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)
  return days
}

export default function ChamadosPage() {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [calDate, setCalDate] = useState(() => new Date())
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status>('todos')
  const [calls, setCalls] = useState<any[]>([])
  const [allCalls, setAllCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quickUpdating, setQuickUpdating] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleQuickStatus(e: React.MouseEvent, callId: string, newStatus: string) {
    e.preventDefault()
    e.stopPropagation()
    setQuickUpdating(callId + newStatus)
    try {
      await updateCall(callId, { status: newStatus })
      if (newStatus === 'aprovado') {
        router.push(`/dashboard/chamados/${callId}/editar`)
      } else {
        await load()
      }
    } catch {
      alert('Erro ao atualizar. Tente novamente.')
    } finally {
      setQuickUpdating(null)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 350)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [filtered, all] = await Promise.all([
        getCalls({ status: statusFilter, search: debouncedSearch }),
        getCalls({ status: 'agendado' }),
      ])
      setCalls(filtered)
      setAllCalls(all)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [statusFilter, debouncedSearch])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Chamados</h1>
          <p className="text-zinc-500 text-sm mt-0.5 hidden sm:block">Gerencie chamados e ordens de servico</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle lista/calendário */}
          <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button onClick={() => setView('list')}
              className={`p-2 transition ${view === 'list' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('calendar')}
              className={`p-2 transition ${view === 'calendar' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}>
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <Link href="/dashboard/chamados/novo"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Chamado</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input type="text" placeholder="Buscar cliente, contato ou código OS..."
          value={search} onChange={e => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
      </div>

      {/* Filters - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {filters.map(f => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition ${
              statusFilter === f.value
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Calendário */}
      {view === 'calendar' && (() => {
        const year = calDate.getFullYear()
        const month = calDate.getMonth()
        const days = buildCalendar(year, month)
        const monthLabel = calDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        // Group agendado calls by scheduled_date
        const byDay: Record<string, any[]> = {}
        for (const c of allCalls) {
          const d = c.scheduled_date ?? c.date
          if (!d) continue
          const [y, m] = d.split('-').map(Number)
          if (y === year && m - 1 === month) {
            const day = parseInt(d.split('-')[2])
            if (!byDay[day]) byDay[day] = []
            byDay[day].push(c)
          }
        }
        return (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-zinc-100 rounded-lg transition">
                <ChevronLeft className="w-4 h-4 text-zinc-500" />
              </button>
              <p className="font-semibold text-zinc-800 capitalize">{monthLabel}</p>
              <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-zinc-100 rounded-lg transition">
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-center text-[10px] font-semibold text-zinc-400 uppercase py-1">{w}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const today = new Date()
                const isToday = day !== null && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                const dayCalls = day ? (byDay[day] ?? []) : []
                return (
                  <div key={i} className={`min-h-[56px] rounded-lg p-1 ${day ? 'bg-zinc-50' : ''} ${isToday ? 'ring-2 ring-orange-400 bg-orange-50' : ''}`}>
                    {day && (
                      <>
                        <p className={`text-xs font-semibold mb-0.5 ${isToday ? 'text-orange-600' : 'text-zinc-500'}`}>{day}</p>
                        <div className="space-y-0.5">
                          {dayCalls.slice(0, 2).map(c => (
                            <Link key={c.id} href={`/dashboard/chamados/${c.id}`}
                              className="block text-[9px] leading-tight bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate hover:bg-blue-200 transition">
                              {c.scheduled_time ? String(c.scheduled_time).slice(0,5) + ' ' : ''}{c.client?.name ?? c.contact_name ?? 'Chamado'}
                            </Link>
                          ))}
                          {dayCalls.length > 2 && (
                            <p className="text-[9px] text-zinc-400 pl-1">+{dayCalls.length - 2}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Cards */}
      {view === 'list' && (loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <p className="text-zinc-400 text-sm">Nenhum chamado encontrado</p>
          <Link href="/dashboard/chamados/novo" className="text-orange-500 text-sm font-medium mt-2 inline-block">
            Registrar novo chamado
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {calls.map(c => {
            const so = c.service_orders?.[0]
            const cfg = statusConfig[c.status]
            const StatusIcon = cfg?.icon || Clock
            const pay = so ? paymentConfig[so.payment_status] : null
            const iconBg = c.status === 'aprovado' ? 'bg-emerald-50' : c.status === 'agendado' ? 'bg-blue-50' : c.status === 'cancelado' ? 'bg-red-50' : 'bg-zinc-50'
            const iconColor = c.status === 'aprovado' ? 'text-emerald-500' : c.status === 'agendado' ? 'text-blue-500' : c.status === 'cancelado' ? 'text-red-500' : 'text-zinc-400'

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-zinc-100 hover:border-orange-200 hover:shadow-sm transition">
                <Link href={`/dashboard/chamados/${c.id}`}
                  className="flex items-start gap-3 p-4 active:scale-[0.99]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <StatusIcon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-zinc-900 text-sm truncate">
                        {c.client?.name ?? c.contact_name ?? 'Sem identificacao'}
                      </p>
                      <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                    </div>
                    {c.service_category && <p className="text-xs text-zinc-500 mt-0.5">{c.service_category}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg?.color}`}>{cfg?.label}</span>
                      <span className="text-xs text-zinc-400">{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      <span className="text-xs text-zinc-400">{originLabel[c.origin]}</span>
                    </div>
                    {so && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50">
                        <span className={`text-xs font-semibold ${pay?.color}`}>{pay?.label}</span>
                        <span className="text-sm font-bold text-zinc-800">
                          R$ {Number(so.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                {/* Quick actions for agendado */}
                {c.status === 'agendado' && (
                  <div className="flex gap-2 px-4 pb-3 pt-0">
                    <button
                      onClick={e => handleQuickStatus(e, c.id, 'aprovado')}
                      disabled={quickUpdating === c.id + 'aprovado'}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50">
                      {quickUpdating === c.id + 'aprovado' ? '...' : '✓ Aprovado?'}
                    </button>
                    <button
                      onClick={e => handleQuickStatus(e, c.id, 'nao_aprovou')}
                      disabled={quickUpdating === c.id + 'nao_aprovou'}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-50">
                      {quickUpdating === c.id + 'nao_aprovou' ? '...' : '✗ Recusado?'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
