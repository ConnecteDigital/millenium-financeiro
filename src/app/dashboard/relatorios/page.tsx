'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Download, TrendingUp, MapPin, Globe, Filter, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getReportData } from '@/lib/db/reports'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'

const fmt = (v: number) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

async function exportPDF(data: any, startDate: string, endDate: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const s = data?.summary

  // Header
  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235)
  doc.text('Millenium Financeiro', 14, 20)
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139)
  doc.text(`Relatório: ${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}`, 14, 28)
  doc.setDrawColor(226, 232, 240)
  doc.line(14, 32, 196, 32)

  // Resumo
  doc.setFontSize(13)
  doc.setTextColor(30, 41, 59)
  doc.text('Resumo do Período', 14, 42)
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`Total de Chamados: ${s?.totalCalls ?? 0}`, 14, 52)
  doc.text(`Aprovados: ${s?.approvedCalls ?? 0}`, 14, 59)
  doc.text(`Receita Bruta: ${fmt(s?.grossRevenue ?? 0)}`, 14, 66)
  doc.text(`Receita Líquida: ${fmt(s?.netRevenue ?? 0)}`, 14, 73)

  // Por cidade
  if (data?.byCity?.length) {
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('Ranking por Cidade', 14, 88)
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    data.byCity.slice(0, 8).forEach((c: any, i: number) => {
      doc.text(`${i + 1}. ${c.city} — ${c.calls} OS — ${fmt(c.revenue)}`, 14, 98 + i * 8)
    })
  }

  // Por origem
  if (data?.byOrigin?.length) {
    const startY = data?.byCity?.length ? 98 + Math.min(data.byCity.length, 8) * 8 + 10 : 88
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('Chamados por Origem', 14, startY)
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    data.byOrigin.forEach((o: any, i: number) => {
      doc.text(`${o.name}: ${o.value} chamados`, 14, startY + 10 + i * 8)
    })
  }

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} · Millenium Desentupidora`, 14, 285)

  doc.save(`relatorio-millenium-${startDate}-${endDate}.pdf`)
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<'semana' | 'mes'>('mes')
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getReportData(startDate, endDate)
      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { load() }, [load])

  function handlePeriodChange(p: 'semana' | 'mes') {
    setPeriod(p)
    const now = new Date()
    if (p === 'mes') {
      setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'))
      setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
    } else {
      setStartDate(format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
      setEndDate(format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
    }
  }

  const summary = data?.summary
  const isEmpty = !loading && (!data?.revenueByWeek?.length && !data?.byOrigin?.length)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análise completa do desempenho financeiro e operacional</p>
        </div>
        <button
          onClick={() => data && exportPDF(data, startDate, endDate)}
          disabled={!data || loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex gap-2">
            {(['semana', 'mes'] as const).map(p => (
              <button key={p} onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {p === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400 text-sm">até</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
          <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum dado para o período selecionado</p>
          <p className="text-slate-400 text-sm mt-1">Lance chamados e serviços para ver os relatórios aqui</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Chamados', value: String(summary?.totalCalls ?? 0), color: 'text-slate-700' },
              { label: 'Aprovados', value: String(summary?.approvedCalls ?? 0), color: 'text-emerald-600' },
              { label: 'Receita Bruta', value: fmt(summary?.grossRevenue ?? 0), color: 'text-blue-600' },
              { label: 'Receita Líquida', value: fmt(summary?.netRevenue ?? 0), color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          {data?.revenueByWeek?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Receita por Semana</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.revenueByWeek} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `R$${(Number(v)/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                  <Bar dataKey="bruto" name="Bruto" fill="#bfdbfe" radius={[4,4,0,0]} />
                  <Bar dataKey="liquido" name="Líquido" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Origin */}
            {data?.byOrigin?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-slate-800">Chamados por Origem</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.byOrigin} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {data.byOrigin.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} chamados`, '']} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By Service */}
            {data?.byService?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-800">Por Tipo de Serviço</h3>
                </div>
                <div className="space-y-3">
                  {data.byService.map((s: any) => (
                    <div key={s.service}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{s.service}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{s.calls} OS</span>
                          <span className="font-semibold text-slate-800">{fmt(s.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min((s.calls / (summary?.approvedCalls || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* By City */}
          {data?.byCity?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-800">Ranking por Cidade</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">#</th>
                      <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Cidade</th>
                      <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Chamados</th>
                      <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.byCity.map((c: any, i: number) => (
                      <tr key={c.city} className="hover:bg-slate-50 transition">
                        <td className="py-3 pr-4">
                          <span className={`text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-800 text-sm">{c.city}</td>
                        <td className="py-3 pr-4 text-sm text-slate-600">{c.calls} OS</td>
                        <td className="py-3 text-sm font-semibold text-slate-800">{fmt(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
