'use client'

import { useState } from 'react'
import { Plus, Search, Eye, MapPin, Phone, FileText } from 'lucide-react'
import Link from 'next/link'

const mockClients = [
  { id: '1', code: 'CLI-001', name: 'João Silva', city: 'Porto Alegre', phone: '(51) 99999-1111', total_os: 3, total_value: 2400 },
  { id: '2', code: 'CLI-002', name: 'Condomínio Boa Vista', city: 'Canoas', phone: '(51) 98888-2222', total_os: 5, total_value: 8500 },
  { id: '3', code: 'CLI-003', name: 'Restaurante Sabor & Arte', city: 'Porto Alegre', phone: '(51) 97777-3333', total_os: 2, total_value: 1800 },
  { id: '4', code: 'CLI-004', name: 'Carlos Eduardo Moraes', city: 'Gravataí', phone: '(51) 96666-4444', total_os: 1, total_value: 600 },
  { id: '5', code: 'CLI-005', name: 'Empresa XPTO Ltda', city: 'Cachoeirinha', phone: '(51) 95555-5555', total_os: 4, total_value: 5200 },
]

export default function ClientesPage() {
  const [search, setSearch] = useState('')

  const filtered = mockClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Banco de dados de clientes e histórico de serviços</p>
        </div>
        <Link
          href="/dashboard/clientes/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-slate-400">{c.code}</span>
                <h3 className="font-semibold text-slate-800 mt-0.5">{c.name}</h3>
              </div>
              <Link href={`/dashboard/clientes/${c.id}`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Eye className="w-3.5 h-3.5" />
                Ver
              </Link>
            </div>

            <div className="space-y-1.5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{c.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{c.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>{c.total_os} OS</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                R$ {c.total_value.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  )
}
