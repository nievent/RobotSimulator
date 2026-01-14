'use server'

import { createClient } from '@/lib/supabase/server'

type Position = { x: number; y: number }

interface Simulation {
  id: string
  commands: string
  final_position: Position
  final_direction: string
  successes: number
  failures: number
  created_at: string
}

export async function saveSimulation(
  commands: string,
  finalPosition: Position,
  finalDirection: string,
  successes: number,
  failures: number
) {
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado')
  }

  // Guardar en Supabase
  const { error: insertError } = await supabase
    .from('simulations')
    .insert({
      user_id: user.id,
      commands,
      final_position: finalPosition,
      final_direction: finalDirection,
      successes,
      failures,
    })

  if (insertError) {
    console.error('Error al guardar simulación:', insertError)
    throw new Error('Error al guardar en la base de datos')
  }

  return { success: true }
}

export async function getSimulationHistory(): Promise<Simulation[]> {
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado')
  }

  // Obtener últimas 10 simulaciones del usuario actual
  // RLS ya filtra por usuario automáticamente
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error al obtener historial:', error)
    throw new Error('Error al obtener el historial')
  }

  return data || []
}