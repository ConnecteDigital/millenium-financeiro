import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export async function getReportData(startDate: string, endDate: string) {
  const supabase = createClient()

  const [ordersRes, callsRes, expensesRes] = await Promise.all([
    supabase
      .from('service_orders')
      .select(`
        id, total_value, service_type, payment_status,
        outsource_fuel_cost, outsource_meal_cost, outsource_truck_cost, outsource_other_cost,
        date,
        client:clients(name, city),
        items:service_order_items(description, quantity, unit_price, total)
      `)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('calls')
      .select('id, status, origin, date')
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('expenses')
      .select('amount, status, category')
      .gte('due_date', startDate)
      .lte('due_date', endDate),
  ])

  const orders = ordersRes.data ?? []
  const calls = callsRes.data ?? []
  const expenses = expensesRes.data ?? []

  // Resumo geral
  const totalCalls = calls.length
  const approvedCalls = calls.filter(c => c.status === 'aprovado').length
  const grossRevenue = orders.reduce((s, o) => s + Number(o.total_value || 0), 0)
  const outsourceCosts = orders.reduce((s, o) =>
    s + Number(o.outsource_fuel_cost || 0) + Number(o.outsource_meal_cost || 0) +
    Number(o.outsource_truck_cost || 0) + Number(o.outsource_other_cost || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netRevenue = grossRevenue - outsourceCosts - totalExpenses

  // Por origem
  const originCount: Record<string, number> = {}
  calls.forEach(c => {
    originCount[c.origin] = (originCount[c.origin] || 0) + 1
  })
  const originLabels: Record<string, string> = {
    site_millenium: 'Site Millenium',
    site_praja: 'Site Pra Já',
    indicacao: 'Indicação',
    terceirizado: 'Terceirizado',
  }
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706']
  const byOrigin = Object.entries(originCount).map(([key, value], i) => ({
    name: originLabels[key] ?? key,
    value,
    color: colors[i % colors.length],
  }))

  // Por cidade
  const cityMap: Record<string, { calls: number; revenue: number }> = {}
  orders.forEach(o => {
    const city = (o.client as any)?.city || 'Não informado'
    if (!cityMap[city]) cityMap[city] = { calls: 0, revenue: 0 }
    cityMap[city].calls += 1
    cityMap[city].revenue += Number(o.total_value || 0)
  })
  const byCity = Object.entries(cityMap)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Por tipo de serviço (descrição dos itens mais comuns)
  const serviceMap: Record<string, { calls: number; revenue: number }> = {}
  orders.forEach(o => {
    const items = (o.items as any[]) ?? []
    const desc = items[0]?.description || 'Serviço geral'
    // Agrupar por palavra-chave
    const key = desc.toLowerCase().includes('fossa') ? 'Limpa Fossa'
      : desc.toLowerCase().includes('destup') || desc.toLowerCase().includes('desentup') ? 'Desentupimento'
      : 'Outros'
    if (!serviceMap[key]) serviceMap[key] = { calls: 0, revenue: 0 }
    serviceMap[key].calls += 1
    serviceMap[key].revenue += Number(o.total_value || 0)
  })
  const byService = Object.entries(serviceMap).map(([service, data]) => ({ service, ...data }))

  // Receita por semana (agrupar datas)
  const weekMap: Record<string, { bruto: number; liquido: number }> = {}
  orders.forEach(o => {
    const week = `Sem ${Math.ceil(new Date(o.date).getDate() / 7)}`
    if (!weekMap[week]) weekMap[week] = { bruto: 0, liquido: 0 }
    weekMap[week].bruto += Number(o.total_value || 0)
    const cost = Number(o.outsource_fuel_cost || 0) + Number(o.outsource_meal_cost || 0) +
      Number(o.outsource_truck_cost || 0) + Number(o.outsource_other_cost || 0)
    weekMap[week].liquido += Number(o.total_value || 0) - cost
  })
  const revenueByWeek = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, data]) => ({ name, ...data }))

  return {
    summary: { totalCalls, approvedCalls, grossRevenue, netRevenue },
    byOrigin,
    byCity,
    byService,
    revenueByWeek,
  }
}
