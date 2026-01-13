'use server'

import { createClient } from '@/lib/supabase/server'
import { OBSTACLES } from '@/lib/constants'

type Position = { x: number; y: number }
type Direction = 'Norte' | 'Este' | 'Sur' | 'Oeste'

interface SimulationResult {
  finalPosition: Position
  finalDirection: Direction
  successes: number
  failures: number
  steps: Array<{
    command: string
    position: Position
    direction: Direction
    success: boolean
  }>
}

const GRID_SIZE = 5

const DIRECTIONS: Direction[] = ['Norte', 'Este', 'Sur', 'Oeste']

function turnLeft(direction: Direction): Direction {
  const currentIndex = DIRECTIONS.indexOf(direction)
  return DIRECTIONS[(currentIndex + 3) % 4]
}

function turnRight(direction: Direction): Direction {
  const currentIndex = DIRECTIONS.indexOf(direction)
  return DIRECTIONS[(currentIndex + 1) % 4]
}

function getNextPosition(position: Position, direction: Direction): Position {
  const deltas = {
    Norte: { x: 0, y: -1 },
    Este: { x: 1, y: 0 },
    Sur: { x: 0, y: 1 },
    Oeste: { x: -1, y: 0 },
  }
  const delta = deltas[direction]
  return { x: position.x + delta.x, y: position.y + delta.y }
}

function isValidPosition(position: Position): boolean {
  if (position.x < 0 || position.x >= GRID_SIZE) return false
  if (position.y < 0 || position.y >= GRID_SIZE) return false
  
  const hasObstacle = OBSTACLES.some(
    obs => obs.x === position.x && obs.y === position.y
  )
  return !hasObstacle
}

export async function simulateRobot(commands: string) {
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado')
  }

  // Estado inicial
  let position: Position = { x: 0, y: 0 }
  let direction: Direction = 'Norte'
  let successes = 0
  let failures = 0
  const steps: SimulationResult['steps'] = []

  // Procesar comandos
  const commandArray = commands.toUpperCase().split('')
  
  for (const cmd of commandArray) {
    if (cmd === 'A') {
      // Avanzar
      const nextPosition = getNextPosition(position, direction)
      if (isValidPosition(nextPosition)) {
        position = nextPosition
        successes++
        steps.push({ command: cmd, position, direction, success: true })
      } else {
        failures++
        steps.push({ command: cmd, position, direction, success: false })
      }
    } else if (cmd === 'I') {
      // Girar izquierda
      direction = turnLeft(direction)
      successes++
      steps.push({ command: cmd, position, direction, success: true })
    } else if (cmd === 'D') {
      // Girar derecha
      direction = turnRight(direction)
      successes++
      steps.push({ command: cmd, position, direction, success: true })
    } else {
      // Comando inválido
      failures++
      steps.push({ command: cmd, position, direction, success: false })
    }
  }

  const result: SimulationResult = {
    finalPosition: position,
    finalDirection: direction,
    successes,
    failures,
    steps,
  }

  // Guardar en Supabase
  const { error: insertError } = await supabase
    .from('simulations')
    .insert({
      user_id: user.id,
      commands,
      final_position: position,
      final_direction: direction,
      successes,
      failures,
    })

  if (insertError) {
    console.error('Error al guardar simulación:', insertError)
  }

  return result
}

// Esta función NO es Server Action, es una función normal exportada
export const OBSTACLES_LIST = OBSTACLES