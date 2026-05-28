'use client'

import { useState } from 'react'
import { BarChart3, Download, TrendingUp, MapPin, Globe, Users, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const revenueByWeek = [
  { name: 'Sem 1', bruto: 12400, liquido: 7200 },
  { name: 'Sem 2', bruto: 18200, liquido: 10800 },
  { name: 'Sem 3', bruto: 9800, liquido: 5900 },
  { name: 'Sem 4', bruto: 15800, liquido: 9240 },
]

const byOrigin = [
  { name: 'Site Millenium', value: 18, color: '#2563eb' },
  { name: 'Site Pra Já', value: 12, color: '#7c3aed' },
  { name: 'Indicação', value: 8, color: '#059669' },
  { name: 'Terceirizado', value: 6, color: '#d97706' },
]

const byCity = [
  { city: 'Porto Alegre', calls: 18, revenue: 24500 },
  { city: 'Canoas', calls: 12, revenue: 16800 },
  { city: 'Gravataí', calls: 8, revenue: 9200 },
  { city: 'Cachoeirinha', calls: 5, revenue: 6100 },
  { city: 'São Leopoldo', calls: 3, revenue: 3800 },
]

const byService = [
  { service: 'Desentupimento', calls: 28, revenue: 32400 },
  { service: 'Limpa Fossa', calls: 14, revenue: 21600 },
  { service: 'Outros', calls: 4, revenue: 2800 },
]

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<'semana' | 'mes'>('mes')
  const [startDate, setStartDate] = useState('2025-05-01')
  const [endDate, setEndDate] = useState('2025-05-31')

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análise completa do desempenho financeiro e operacional</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex gap-2">
            <button onClick={() => setPeriod('semana')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${period === 'semana' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Semana
            </button>
            <button onClick={() => setPeriod('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${period === 'mes' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Mês
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400 text-sm">até</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Chamados', value: '46', color: 'text-slate-700' },
          { label: 'Aprovados', value: '34', color: 'text-emerald-600' },
          { label: 'Receita Bruta', value: 'R$ 56.200', color: 'text-blue-600' },
          { label: 'Receita Líquida', value: 'R$ 33.140', color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Receita por Semana</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueByWeek} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']} />
            <Bar dataKey="bruto" name="Bruto" fill="#bfdbfe" radius={[4,4,0,0]} />
            <Bar dataKey="liquido" name="Líquido" fill="#2563eb" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Origin */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">Chamados por Origem</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byOrigin} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {byOrigin.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} chamados`, '']} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Service */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Por Tipo de Serviço</h3>
          </div>
          <div className="space-y-3">
            {byService.map(s => (
              <div key={s.service}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{s.service}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{s.calls} OS</span>
                    <span className="font-semibold text-slate-800">R$ {s.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(s.calls / 46) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By City */}
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
              {byCity.map((c, i) => (
                <tr key={c.city} className="hover:bg-slate-50 transition">
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-800 text-sm">{c.city}</td>
                  <td className="py-3 pr-4 text-sm text-slate-600">{c.calls} chamados</td>
                  <td className="py-3 text-sm font-semibold text-slate-800">R$ {c.revenue.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
