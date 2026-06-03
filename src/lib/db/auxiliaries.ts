import { createClient } from '@/lib/supabase/client'

export async function getAuxiliaries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('auxiliaries')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createAuxiliary(name: string, percentage: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('auxiliaries')
    .insert({ name, percentage })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAuxiliary(id: string, name: string, percentage: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('auxiliaries')
    .update({ name, percentage })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAuxiliary(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('auxiliaries').delete().eq('id', id)
  if (error) throw error
}
