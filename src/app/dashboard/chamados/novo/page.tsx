'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Share2, Paperclip, Upload, FileText, Download, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createCall } from '@/lib/db/calls'
import { createServiceOrder } from '@/lib/db/service-orders'
import { getClients, createClient_ } from '@/lib/db/clients'
import { getTeams } from '@/lib/db/teams'
import { getAuxiliaries } from '@/lib/db/auxiliaries'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { p } from '@/lib/parse-decimal'

type ServiceExecType = 'proprio' | 'terceirizado_saida' | 'terceirizado_entrada'
type PaymentStatus = 'pago' | 'pago_parcial' | 'pendente'
type BillingSystem = 'metro_linear' | 'metro_cubico' | 'litros' | 'carga' | 'valor_fechado' | 'metro_quadrado'
interface Item { id: string; quantity: number; description: string; unit_price: number }

const SERVICE_TYPES_OPTIONS = [
  { id: 'desentupidora_ralo', label: 'Desentupidora de Ralo' },
  { id: 'desentupidora_pia', label: 'Desentupidora de Pia' },
  { id: 'desentupidora_cano', label: 'Desentupidora de Cano' },
  { id: 'desentupidora_vaso', label: 'Desentupidora de Vaso' },
  { id: 'desentupidora_coluna', label: 'Desentupidora de Coluna' },
  { id: 'desentupidora_esgoto', label: 'Desentupidora de Esgoto' },
  { id: 'limpa_fossa', label: 'Limpa Fossa' },
  { id: 'hidrojateamento', label: 'Hidrojateamento' },
]

const BILLING_FOR_TYPE: Record<string, { label: string; value: BillingSystem }[]> = {
  desentupidora_ralo:    [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  desentupidora_pia:     [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  desentupidora_cano:    [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  desentupidora_vaso:    [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  desentupidora_coluna:  [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  desentupidora_esgoto:  [{ label: 'Metro Linear', value: 'metro_linear' }, { label: 'Valor Fechado', value: 'valor_fechado' }, { label: 'Metro Cúbico', value: 'metro_cubico' }],
  limpa_fossa:           [{ label: 'Litros', value: 'litros' }, { label: 'Carga', value: 'carga' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
  hidrojateamento:       [{ label: 'Metro Quadrado', value: 'metro_quadrado' }, { label: 'Valor Fechado', value: 'valor_fechado' }],
}

interface ServiceCalc {
  typeId: string
  billing: BillingSystem | ''
  quantity: string
  unitPrice: string
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const iCls = "w-full px-3 py-2.5 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
const sCls = "w-full px-3 py-2.5 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"

export default function NovoChamadoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [auxiliaries, setAuxiliaries] = useState<any[]>([])
  const [savedCallId, setSavedCallId] = useState<string | null>(null)
  const [savedOsNumber, setSavedOsNumber] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chamado básico
  const [callDate, setCallDate] = useState(localToday())
  const [origin, setOrigin] = useState('site_millenium')
  const [callStatus, setCallStatus] = useState('agendado')
  const [callNotes, setCallNotes] = useState('')
  const [clientId, setClientId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Agendamento
  const [scheduledDate, setScheduledDate] = useState(localToday())
  const [scheduledTime, setScheduledTime] = useState('')
  const [callAddress, setCallAddress] = useState('')

  // Serviços selecionados (checklist multi-select)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([])
  const [serviceCalcs, setServiceCalcs] = useState<Record<string, ServiceCalc>>({})
  const [serviceCategory, setServiceCategory] = useState('') // fallback text

  const isApproved = callStatus === 'aprovado'
  const isScheduled = callStatus === 'agendado'

  // OS
  const [serviceExecType, setServiceExecType] = useState<ServiceExecType>('proprio')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendente')
  const [billingSystems, setBillingSystems] = useState<BillingSystem[]>([])
  const [items, setItems] = useState<Item[]>([{ id: '1', quantity: 1, description: '', unit_price: 0 }])
  const [discount, setDiscount] = useState('')
  const [taxes, setTaxes] = useState('')
  const [equipmentRentalPct, setEquipmentRentalPct] = useState('')
  const [equipmentRentalValue, setEquipmentRentalValue] = useState('')
  const [hasFloorPlan, setHasFloorPlan] = useState(false)
  const [hasNoFloorPlan, setHasNoFloorPlan] = useState(false)
  const [hasNoKnowledge, setHasNoKnowledge] = useState(false)
  const [hasHydraulicPlan, setHasHydraulicPlan] = useState(false)
  const [hasNoHydraulicPlan, setHasNoHydraulicPlan] = useState(false)
  const [hasGuarantee, setHasGuarantee] = useState(false)
  const [hasGuarantee60, setHasGuarantee60] = useState(false)
  const [hasGuarantee90, setHasGuarantee90] = useState(false)
  const [hasNoGuarantee, setHasNoGuarantee] = useState(false)
  const [teamId, setTeamId] = useState('')
  const [auxiliaryId, setAuxiliaryId] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [myRevenuePct, setMyRevenuePct] = useState('100')
  const [driver, setDriver] = useState('')
  const [nfNumber, setNfNumber] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [otherServiceValue, setOtherServiceValue] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [remainingAmount, setRemainingAmount] = useState('')
  const [remainingDueDate, setRemainingDueDate] = useState('')
  const [conditions, setConditions] = useState('')
  const [observations, setObservations] = useState('')
  // Custos terceirizado
  const [fuelCost, setFuelCost] = useState('')
  const [mealCost, setMealCost] = useState('')
  const [truckCost, setTruckCost] = useState('')
  const [otherCost, setOtherCost] = useState('')
  // Custos próprio
  const [ownMaterialCost, setOwnMaterialCost] = useState('')
  const [ownFuelCost, setOwnFuelCost] = useState('')
  const [ownOtherCost, setOwnOtherCost] = useState('')

  useEffect(() => {
    Promise.all([getClients(), getTeams(), getAuxiliaries()])
      .then(([c, t, a]) => { setClients(c); setTeams(t); setAuxiliaries(a) })
      .catch(console.error)
  }, [])

  // Sync service calcs when service types change
  function toggleServiceType(typeId: string) {
    setSelectedServiceTypes(prev => {
      if (prev.includes(typeId)) return prev.filter(x => x !== typeId)
      return [...prev, typeId]
    })
    if (!serviceCalcs[typeId]) {
      const defaultBilling = BILLING_FOR_TYPE[typeId]?.[0]?.value ?? ''
      setServiceCalcs(prev => ({ ...prev, [typeId]: { typeId, billing: defaultBilling, quantity: '1', unitPrice: '' } }))
    }
  }

  function updateCalc(typeId: string, field: keyof ServiceCalc, value: any) {
    setServiceCalcs(prev => ({ ...prev, [typeId]: { ...prev[typeId], [field]: value } }))
  }

  // Auto-generate items from service calcs
  function buildItemsFromCalcs(): Item[] {
    const generated: Item[] = []
    for (const typeId of selectedServiceTypes) {
      const calc = serviceCalcs[typeId]
      if (!calc || p(calc.unitPrice) === 0) continue
      const typeName = SERVICE_TYPES_OPTIONS.find(t => t.id === typeId)?.label ?? typeId
      const billingLabel = calc.billing ? BILLING_FOR_TYPE[typeId]?.find(b => b.value === calc.billing)?.label ?? calc.billing : ''
      generated.push({
        id: typeId,
        quantity: p(calc.quantity),
        description: `${typeName}${billingLabel ? ` - ${billingLabel}` : ''}`,
        unit_price: p(calc.unitPrice),
      })
    }
    // Include manual items that have description
    const manualItems = items.filter(i => i.description.trim() && !selectedServiceTypes.includes(i.id))
    return [...generated, ...manualItems]
  }

  const allItems = isApproved ? buildItemsFromCalcs() : []
  const subtotal = allItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const total = subtotal - p(discount) + p(taxes)

  const addItem = () => setItems(prev => [...prev, { id: Date.now().toString(), quantity: 1, description: '', unit_price: 0 }])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof Item, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  async function loadAttachments(callId: string) {
    try {
      const supabase = createSupabaseClient()
      const { data } = await supabase.storage.from('chamados-anexos').list(callId, { sortBy: { column: 'created_at', order: 'desc' } })
      setAttachments(data ?? [])
    } catch { /* bucket pode não existir ainda */ }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !savedCallId) return
    setUploading(true)
    try {
      const supabase = createSupabaseClient()
      const path = `${savedCallId}/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('chamados-anexos').upload(path, file)
      if (error) throw error
      await loadAttachments(savedCallId)
    } catch (err: any) {
      alert('Erro ao fazer upload: ' + (err.message ?? 'Tente novamente'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteAttachment(name: string) {
    if (!savedCallId || !confirm(`Remover o arquivo "${name}"?`)) return
    try {
      const supabase = createSupabaseClient()
      await supabase.storage.from('chamados-anexos').remove([`${savedCallId}/${name}`])
      await loadAttachments(savedCallId)
    } catch { alert('Erro ao remover arquivo') }
  }

  async function getDownloadUrl(name: string) {
    if (!savedCallId) return
    const supabase = createSupabaseClient()
    const { data } = supabase.storage.from('chamados-anexos').getPublicUrl(`${savedCallId}/${name}`)
    window.open(data.publicUrl, '_blank')
  }

  async function handleShare(osNumber: string) {
    const callData = {
      nome: contactName || clients.find(c => c.id === clientId)?.name || 'Cliente',
      os: osNumber,
      data: new Date(scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR'),
      horario: scheduledTime ? scheduledTime.slice(0, 5) : '—',
      endereco: callAddress || '—',
      servico: serviceCategory || selectedServiceTypes.map(id => SERVICE_TYPES_OPTIONS.find(t => t.id === id)?.label).filter(Boolean).join(', ') || '—',
    }
    const text = `📋 OS ${callData.os} - Desentupidora Líder\n👤 Cliente: ${callData.nome}\n📅 Data: ${callData.data}\n🕐 Horário: ${callData.horario}\n📍 Endereço: ${callData.endereco}\n🔧 Serviço: ${callData.servico}`

    if (navigator.share) {
      await navigator.share({ title: `OS ${callData.os}`, text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Dados da OS copiados!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contactName.trim() && !clientId) {
      setError('Informe o nome do contato ou selecione um cliente cadastrado.')
      return
    }
    setSaving(true)
    setError('')
    try {
      let finalClientId = clientId
      if (!clientId && contactName.trim()) {
        const newClient = await createClient_({ name: contactName.trim() })
        finalClientId = newClient.id
      }

      const serviceCategoryFinal = selectedServiceTypes.length > 0
        ? selectedServiceTypes.map(id => SERVICE_TYPES_OPTIONS.find(t => t.id === id)?.label).filter(Boolean).join(', ')
        : serviceCategory || null

      const call = await createCall({
        date: callDate,
        client_id: finalClientId || null,
        contact_name: contactName || null,
        contact_phone: contactPhone || null,
        origin,
        status: callStatus,
        notes: callNotes || null,
        service_category: serviceCategoryFinal,
        scheduled_time: scheduledTime || null,
        scheduled_date: isScheduled ? scheduledDate || callDate : null,
        call_address: callAddress || null,
      })

      // Gerar OS para agendado também (OS de agendamento)
      if (isScheduled || isApproved) {
        const finalItems = isApproved
          ? allItems.filter(i => i.description.trim()).map(i => ({ quantity: i.quantity, description: i.description, unit_price: i.unit_price }))
          : []

        const orderData: Record<string, any> = {
          call_id: call.id,
          date: isApproved ? callDate : (scheduledDate || callDate),
          client_id: finalClientId || null,
          service_type: isApproved ? serviceExecType : 'proprio',
          billing_system: billingSystems.join(',') || null,
          payment_status: isApproved ? paymentStatus : 'pendente',
          subtotal: isApproved ? subtotal : 0,
          total_value: isApproved ? total : 0,
        }

        if (isApproved) {
          Object.assign(orderData, {
            team_id: teamId || null,
            auxiliary_id: auxiliaryId || null,
            partner_name: partnerName || null,
            my_revenue_pct: p(myRevenuePct) || 100,
            driver: driver || null,
            nf_number: nfNumber || null,
            vehicle: vehicle || null,
            due_date: dueDate || null,
            has_floor_plan: hasFloorPlan,
            has_no_floor_plan: hasNoFloorPlan,
            has_no_knowledge: hasNoKnowledge,
            has_hydraulic_plan: hasHydraulicPlan,
            has_no_hydraulic_plan: hasNoHydraulicPlan,
            has_guarantee: hasGuarantee,
            has_guarantee_60: hasGuarantee60,
            has_guarantee_90: hasGuarantee90,
            has_no_guarantee: hasNoGuarantee,
            equipment_rental_pct: p(equipmentRentalPct),
            equipment_rental_value: p(equipmentRentalValue),
            discount: p(discount),
            taxes: p(taxes),
            outsource_fuel_cost: p(fuelCost),
            outsource_meal_cost: p(mealCost),
            outsource_truck_cost: p(truckCost),
            outsource_other_cost: p(otherCost),
            other_service_value: p(otherServiceValue),
            own_material_cost: p(ownMaterialCost),
            own_fuel_cost: p(ownFuelCost),
            own_other_cost: p(ownOtherCost),
            payment_method: paymentMethod || null,
            amount_paid: p(amountPaid),
            remaining_amount: p(remainingAmount),
            remaining_due_date: remainingDueDate || null,
            conditions: conditions || null,
            observations: observations || null,
          })
        }

        const so = await createServiceOrder(orderData, finalItems)
        setSavedOsNumber(so.os_number)
      }

      setSavedCallId(call.id)
      await loadAttachments(call.id)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao salvar chamado. Tente novamente.')
      setSaving(false)
    } finally {
      setSaving(false)
    }
  }

  // After save: show success with attachments
  if (savedCallId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/chamados" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Chamado Salvo!</h1>
            <p className="text-slate-500 text-sm">Adicione documentos ou vá para o chamado</p>
          </div>
        </div>

        {savedOsNumber && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-emerald-800">OS gerada: {savedOsNumber}</p>
              <p className="text-emerald-700 text-sm mt-0.5">{isScheduled ? 'OS de agendamento criada com sucesso.' : 'Ordem de serviço aprovada criada.'}</p>
            </div>
            <div className="flex gap-2">
              {isScheduled ? (
                <button
                  onClick={() => handleShare(savedOsNumber)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition">
                  <Share2 className="w-4 h-4" />
                  Enviar WhatsApp
                </button>
              ) : (
                <Link href={`/os/${savedCallId}`} target="_blank"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition">
                  <Share2 className="w-4 h-4" />
                  Ver / Compartilhar OS
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Anexos */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-orange-500" />
              Documentos Anexados
            </h2>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Enviando...' : 'Anexar arquivo'}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
          </div>

          {attachments.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Paperclip className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Nenhum documento anexado</p>
              <p className="text-slate-300 text-xs mt-1">Clique em "Anexar arquivo" para adicionar documentos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((file: any) => {
                const displayName = file.name.replace(/^\d+_/, '')
                const sizeKb = file.metadata?.size ? Math.round(file.metadata.size / 1024) : null
                return (
                  <div key={file.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{displayName}</p>
                        {sizeKb && <p className="text-xs text-slate-400">{sizeKb} KB</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => getDownloadUrl(file.name)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAttachment(file.name)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/chamados" className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            Ver todos chamados
          </Link>
          <Link href={`/dashboard/chamados/${savedCallId}`} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition">
            Ir para o Chamado →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/chamados" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Chamado</h1>
          <p className="text-slate-500 text-sm">Registre um novo chamado recebido</p>
        </div>
      </div>

      {/* Informações básicas */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Informações do Chamado</h2>

        {/* Origem primeiro */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Origem *</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'site_millenium', label: 'Site Millenium' },
              { value: 'site_praja', label: 'Site Pra Já' },
              { value: 'indicacao', label: 'Indicação' },
              { value: 'terceirizado', label: 'Terceirizado' },
            ].map(s => (
              <button key={s.value} type="button" onClick={() => setOrigin(s.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${origin === s.value ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'agendado', label: 'Agendado' },
              { value: 'aprovado', label: 'Aprovado' },
              { value: 'nao_aprovou', label: 'Não aprovou' },
              { value: 'nao_quis_visita', label: 'Não quis visita' },
              { value: 'cancelado', label: 'Cancelado' },
            ].map(s => (
              <button key={s.value} type="button" onClick={() => setCallStatus(s.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${callStatus === s.value ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data do chamado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Data do Chamado *</label>
            <input type="date" required value={callDate} onChange={e => setCallDate(e.target.value)}
              className={iCls} />
          </div>
        </div>

        {/* Nome do contato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nome do Contato *
              <span className="text-slate-400 font-normal ml-1">(quem ligou)</span>
            </label>
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
              placeholder="Ex: João Silva"
              className={iCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
              placeholder="(51) 99999-9999"
              className={iCls} />
          </div>
        </div>

        {/* Cliente cadastrado */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Cliente cadastrado
            <span className="text-slate-400 font-normal ml-1">(opcional)</span>
          </label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className={sCls}>
            <option value="">— Não vincular —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.city ? ` - ${c.city}` : ''}</option>)}
          </select>
        </div>

        {/* Campos de agendamento */}
        {isScheduled && (
          <div className="border border-orange-200 bg-orange-50/60 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-600">📅 Detalhes do Agendamento</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Data do Serviço</label>
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                  className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Horário</label>
                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                  className={iCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço do Serviço</label>
                <input type="text" value={callAddress} onChange={e => setCallAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className={iCls} />
              </div>
            </div>
          </div>
        )}

        {/* Endereço para não quis visita */}
        {callStatus === 'nao_quis_visita' && (
          <div className="border border-zinc-200 bg-zinc-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço</label>
            <input type="text" value={callAddress} onChange={e => setCallAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className={iCls} />
          </div>
        )}

        {/* Tipos de serviço — disponível em agendado e aprovado */}
        {(isScheduled || isApproved) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo(s) de Serviço</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES_OPTIONS.map(st => (
                <button key={st.id} type="button" onClick={() => toggleServiceType(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${selectedServiceTypes.includes(st.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
          <textarea rows={2} value={callNotes} onChange={e => setCallNotes(e.target.value)}
            placeholder="Anotações sobre o chamado..."
            className={`${iCls} resize-none`} />
        </div>
      </div>

      {/* OS — só quando aprovado */}
      {isApproved && (
        <>
          {/* Checklist de serviços */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-orange-500" />
              Tipo(s) de Serviço Realizado
            </h2>
            <div className="space-y-2">
              {SERVICE_TYPES_OPTIONS.map(st => (
                <div key={st.id}>
                  <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedServiceTypes.includes(st.id)}
                      onChange={() => toggleServiceType(st.id)}
                      className="w-4 h-4 mt-0.5 text-orange-500 rounded border-orange-300"
                    />
                    <span className="text-sm text-slate-700">{st.label}</span>
                  </label>

                  {/* Calculadora de cobrança por tipo */}
                  {selectedServiceTypes.includes(st.id) && serviceCalcs[st.id] && (
                    <div className="ml-7 mt-1 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Cobrança</label>
                          <select
                            value={serviceCalcs[st.id].billing}
                            onChange={e => updateCalc(st.id, 'billing', e.target.value)}
                            className="w-full px-2 py-1.5 border border-orange-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                          >
                            {BILLING_FOR_TYPE[st.id]?.map(b => (
                              <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            {serviceCalcs[st.id].billing === 'litros' ? 'Quantidade (L)' :
                             serviceCalcs[st.id].billing?.includes('metro') ? 'Quantidade (m)' :
                             'Quantidade'}
                          </label>
                          <input
                            type="text" inputMode="decimal"
                            value={serviceCalcs[st.id].quantity || ''}
                            onChange={e => updateCalc(st.id, 'quantity', parseFloat(e.target.value.replace(',', '.')) || 0)}
                            className="w-full px-2 py-1.5 border border-orange-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            {serviceCalcs[st.id].billing === 'litros' ? 'Preço/Litro (R$)' :
                             serviceCalcs[st.id].billing?.includes('metro') ? 'Preço/Metro (R$)' :
                             'Valor (R$)'}
                          </label>
                          <input
                            type="text" inputMode="decimal"
                            value={serviceCalcs[st.id].unitPrice || ''}
                            onChange={e => updateCalc(st.id, 'unitPrice', parseFloat(e.target.value.replace(',', '.')) || 0)}
                            className="w-full px-2 py-1.5 border border-orange-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Total</label>
                          <div className="px-2 py-1.5 bg-orange-100 rounded text-xs font-bold text-orange-700">
                            R$ {(p(serviceCalcs[st.id].quantity) * p(serviceCalcs[st.id].unitPrice)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Descontos (R$)</span>
                <input type="text" inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)}
                  className="w-24 px-2 py-1 border border-orange-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white" />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Impostos (R$)</span>
                <input type="text" inputMode="decimal" value={taxes} onChange={e => setTaxes(e.target.value)}
                  className="w-24 px-2 py-1 border border-orange-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white" />
              </div>
              <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2">
                <span className="text-slate-800">Valor Total</span>
                <span className="text-orange-500">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* OS Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Ordem de Serviço</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Equipe</label>
                <select value={teamId} onChange={e => setTeamId(e.target.value)} className={sCls}>
                  <option value="">Selecione...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Auxiliar</label>
                <select value={auxiliaryId} onChange={e => setAuxiliaryId(e.target.value)} className={sCls}>
                  <option value="">— Nenhum —</option>
                  {auxiliaries.map(a => <option key={a.id} value={a.id}>{a.name} ({a.percentage}%)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Motorista</label>
                <input type="text" value={driver} onChange={e => setDriver(e.target.value)} className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nº da NF</label>
                <input type="text" value={nfNumber} onChange={e => setNfNumber(e.target.value)} className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Veículo</label>
                <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)} className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vencimento</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={iCls} />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Forma de Pagamento</label>
                <div className="flex flex-wrap gap-2">
                  {['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Cheque', 'Outro'].map(m => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(paymentMethod === m ? '' : m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${paymentMethod === m ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {isApproved && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço do Serviço</label>
                  <input type="text" value={callAddress} onChange={e => setCallAddress(e.target.value)} placeholder="Rua, número, bairro" className={iCls} />
                </div>
              )}
            </div>
          </div>

          {/* Split de parceiro */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Parceiro Terceirizado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da empresa parceira <span className="text-slate-400 font-normal">(se houver)</span></label>
                <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)}
                  placeholder="Ex: Elite Desentupidora"
                  className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Minha % da receita</label>
                <input type="text" inputMode="decimal" value={myRevenuePct} onChange={e => setMyRevenuePct(e.target.value)}
                  placeholder="100"
                  className={iCls} />
              </div>
            </div>
            {partnerName && total > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Minha receita ({myRevenuePct || 100}%)</p>
                  <p className="text-lg font-bold text-emerald-800">R$ {(total * p(myRevenuePct) / 100).toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Repasse a {partnerName} ({(100 - p(myRevenuePct)).toFixed(0)}%)</p>
                  <p className="text-lg font-bold text-orange-700">R$ {(total * (100 - p(myRevenuePct)) / 100).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tipo execução */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Tipo de Execução</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'proprio', label: 'Serviço Próprio' },
                { value: 'terceirizado_saida', label: 'Terceirizado (passamos)' },
                { value: 'terceirizado_entrada', label: 'Recebido de parceiro' },
              ].map(s => (
                <button key={s.value} type="button" onClick={() => setServiceExecType(s.value as ServiceExecType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${serviceExecType === s.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            {serviceExecType !== 'proprio' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Gasolina (R$)', val: fuelCost, set: setFuelCost },
                  { label: 'Almoço (R$)', val: mealCost, set: setMealCost },
                  { label: 'Aluguel Caminhão (R$)', val: truckCost, set: setTruckCost },
                  { label: 'Outros (R$)', val: otherCost, set: setOtherCost },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                    <input type="text" inputMode="decimal" value={f.val} onChange={e => f.set(e.target.value)}
                      className={iCls} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Material (R$)</label>
                  <input type="text" inputMode="decimal" value={ownMaterialCost} onChange={e => setOwnMaterialCost(e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Combustível (R$)</label>
                  <input type="text" inputMode="decimal" value={ownFuelCost} onChange={e => setOwnFuelCost(e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Outros Custos (R$)</label>
                  <input type="text" inputMode="decimal" value={ownOtherCost} onChange={e => setOwnOtherCost(e.target.value)} className={iCls} />
                </div>
                {(p(ownMaterialCost) + p(ownFuelCost) + p(ownOtherCost)) > 0 && (
                  <div className="col-span-2 sm:col-span-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-800">Total de Custos do Serviço:</span>
                    <span className="text-sm font-bold text-emerald-800">R$ {(p(ownMaterialCost) + p(ownFuelCost) + p(ownOtherCost)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            {/* Outro serviço contratado */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contratou algum outro serviço? <span className="text-slate-400 font-normal">(valor pago a terceiro)</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">R$</span>
                <input type="text" inputMode="decimal" value={otherServiceValue} placeholder="0,00"
                  onChange={e => setOtherServiceValue(e.target.value)}
                  className="w-40 px-3 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white" />
              </div>
            </div>
          </div>

          {/* Levantamento */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Levantamento e Cobrança</h2>
            <div className="flex flex-wrap gap-2">
              {(['metro_linear','metro_cubico','litros','carga','valor_fechado','metro_quadrado'] as BillingSystem[]).map(b => {
                const labels: Record<string,string> = { metro_linear:'Metro Linear', metro_cubico:'Metro Cúbico', litros:'Litros', carga:'Carga', valor_fechado:'Valor Fechado', metro_quadrado:'Metro Quadrado' }
                return (
                  <button key={b} type="button" onClick={() => setBillingSystems(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${billingSystems.includes(b) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                    {labels[b]}
                  </button>
                )
              })}
            </div>
            <div className="space-y-3">
              {[
                { title: 'Planta baixa', options: [
                  { label: 'Com planta baixa', val: hasFloorPlan, set: setHasFloorPlan },
                  { label: 'Sem planta baixa', val: hasNoFloorPlan, set: setHasNoFloorPlan },
                  { label: 'Sem conhecimento', val: hasNoKnowledge, set: setHasNoKnowledge },
                ]},
                { title: 'Planta hidráulica', options: [
                  { label: 'Com planta hidráulica', val: hasHydraulicPlan, set: setHasHydraulicPlan },
                  { label: 'Sem planta hidráulica', val: hasNoHydraulicPlan, set: setHasNoHydraulicPlan },
                ]},
                { title: 'Garantia', options: [
                  { label: 'Garantia 30 dias', val: hasGuarantee, set: setHasGuarantee },
                  { label: 'Garantia 60 dias', val: hasGuarantee60, set: setHasGuarantee60 },
                  { label: 'Garantia 90 dias', val: hasGuarantee90, set: setHasGuarantee90 },
                  { label: 'Sem garantia', val: hasNoGuarantee, set: setHasNoGuarantee },
                ]},
              ].map(group => (
                <div key={group.title}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">{group.title}</p>
                  <div className="flex flex-wrap gap-4">
                    {group.options.map(({ label, val, set }) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="w-4 h-4 rounded text-orange-500" />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Condições de Pagamento</label>
              <input type="text" value={conditions} onChange={e => setConditions(e.target.value)} className={iCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações da OS</label>
              <textarea rows={2} value={observations} onChange={e => setObservations(e.target.value)} className={`${iCls} resize-none`} />
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-base border-b border-slate-100 pb-3">Status de Pagamento</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'pago', label: 'Pago' },
                { value: 'pago_parcial', label: 'Pago parcialmente' },
                { value: 'pendente', label: 'Pendente' },
              ].map(s => (
                <button key={s.value} type="button" onClick={() => setPaymentStatus(s.value as PaymentStatus)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${paymentStatus === s.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            {paymentStatus === 'pago_parcial' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor Pago (R$)</label>
                  <input type="text" inputMode="decimal" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor Restante (R$)</label>
                  <input type="text" inputMode="decimal" value={remainingAmount} onChange={e => setRemainingAmount(e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data do Restante</label>
                  <input type="date" value={remainingDueDate} onChange={e => setRemainingDueDate(e.target.value)} className={iCls} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="flex gap-3 justify-end pb-8">
        <Link href="/dashboard/chamados"
          className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          Cancelar
        </Link>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar Chamado'}
        </button>
      </div>
    </form>
  )
}
