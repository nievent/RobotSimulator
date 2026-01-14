'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DarkVeil from '@/components/DarkVeil'
import Grid from '@/components/simulator/Grid'
import SimulationStats from '@/components/simulator/SimulationStats'
import { simulateRobot } from '@/lib/actions/simulate'
import { createClient } from '@/lib/supabase/client'
import styles from './simulator.module.css'

type Position = { x: number; y: number }
type Direction = 'Norte' | 'Este' | 'Sur' | 'Oeste'

const DIRECTIONS: Direction[] = ['Norte', 'Este', 'Sur', 'Oeste']

// Generar obstáculos aleatorios de 2 a 5
function generateRandomObstacles(): Position[] {
  const numObstacles = Math.floor(Math.random() * 4) + 2 // 2-5 obstáculos
  const obstacles: Position[] = []
  
  while (obstacles.length < numObstacles) {
    const x = Math.floor(Math.random() * 5)
    const y = Math.floor(Math.random() * 5)
    
    // No colocar obstáculo en la posición inicial (0,0)
    if (x === 0 && y === 0) continue
    
    // No duplicar obstáculos
    if (obstacles.some(obs => obs.x === x && obs.y === y)) continue
    
    obstacles.push({ x, y })
  }
  
  return obstacles
}

export default function SimulatorPage() {
  const router = useRouter()
  const [obstacles, setObstacles] = useState<Position[]>(() => generateRandomObstacles())
  const [isEditMode, setIsEditMode] = useState(false)
  const [robotPosition, setRobotPosition] = useState<Position>({ x: 0, y: 0 })
  const [robotDirection, setRobotDirection] = useState<Direction>('Norte')
  const [successes, setSuccesses] = useState(0)
  const [failures, setFailures] = useState(0)
  const [commandHistory, setCommandHistory] = useState<string>('')
  const [lastCommand, setLastCommand] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastCommandSuccess, setLastCommandSuccess] = useState<boolean | undefined>(undefined)

  // Verificar sesión al montar
  useEffect(() => {
    const supabase = createClient()
    
    // Verificar sesión actual
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    
    checkSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Girar a la izquierda
  const turnLeft = useCallback(() => {
    setRobotDirection(prev => {
      const currentIndex = DIRECTIONS.indexOf(prev)
      return DIRECTIONS[(currentIndex + 3) % 4]
    })
    setSuccesses(prev => prev + 1)
    setCommandHistory(prev => prev + 'I')
    setLastCommand('I - Giro izquierda ✓')
    setLastCommandSuccess(true)
  }, [])

  // Girar a la derecha
  const turnRight = useCallback(() => {
    setRobotDirection(prev => {
      const currentIndex = DIRECTIONS.indexOf(prev)
      return DIRECTIONS[(currentIndex + 1) % 4]
    })
    setSuccesses(prev => prev + 1)
    setCommandHistory(prev => prev + 'D')
    setLastCommand('D - Giro derecha ✓')
    setLastCommandSuccess(true)
  }, [])

  // Avanzar
  const moveForward = useCallback(() => {
    const deltas = {
      Norte: { x: 0, y: -1 },
      Este: { x: 1, y: 0 },
      Sur: { x: 0, y: 1 },
      Oeste: { x: -1, y: 0 },
    }
    const delta = deltas[robotDirection]
    const nextPos = { x: robotPosition.x + delta.x, y: robotPosition.y + delta.y }

    // Verificar si la posición es válida
    if (nextPos.x < 0 || nextPos.x >= 5 || nextPos.y < 0 || nextPos.y >= 5) {
      setFailures(f => f + 1)
      setCommandHistory(h => h + 'A')
      setLastCommand('A - Choque con borde ✗')
      setLastCommandSuccess(false)
      return // No se mueve
    }

    // Verificar obstáculos
    const hasObstacle = obstacles.some(obs => obs.x === nextPos.x && obs.y === nextPos.y)
    if (hasObstacle) {
      setFailures(f => f + 1)
      setCommandHistory(h => h + 'A')
      setLastCommand('A - Choque con obstáculo ✗')
      setLastCommandSuccess(false)
      return // No se mueve
    }

    // Movimiento exitoso
    setRobotPosition(nextPos)
    setSuccesses(s => s + 1)
    setCommandHistory(h => h + 'A')
    setLastCommand('A - Avance exitoso ✓')
    setLastCommandSuccess(true)
  }, [robotDirection, robotPosition, obstacles])

  // Event listener para el teclado (solo si NO está en modo edición)
  useEffect(() => {
    if (isEditMode) return // No escuchar teclas en modo edición
    
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      
      if (key === 'A' || key === 'W' || key === 'ARROWUP') {
        e.preventDefault()
        setIsAnimating(true)
        moveForward()
        setTimeout(() => setIsAnimating(false), 300)
      } else if (key === 'I' || key === 'Q' || key === 'ARROWLEFT') {
        e.preventDefault()
        setIsAnimating(true)
        turnLeft()
        setTimeout(() => setIsAnimating(false), 300)
      } else if (key === 'D' || key === 'E' || key === 'ARROWRIGHT') {
        e.preventDefault()
        setIsAnimating(true)
        turnRight()
        setTimeout(() => setIsAnimating(false), 300)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveForward, turnLeft, turnRight, isEditMode])

  const handleReset = () => {
    setRobotPosition({ x: 0, y: 0 })
    setRobotDirection('Norte')
    setSuccesses(0)
    setFailures(0)
    setCommandHistory('')
    setLastCommand('')
    setObstacles(generateRandomObstacles()) // Nuevos obstáculos aleatorios
    setIsEditMode(false) // Salir del modo edición
  }

  const handleCellClick = (x: number, y: number) => {
    if (!isEditMode) return
    if (x === 0 && y === 0) return // No permitir obstáculo en inicio

    // Si ya hay un obstáculo ahí, quitarlo
    const existingIndex = obstacles.findIndex(obs => obs.x === x && obs.y === y)
    if (existingIndex !== -1) {
      setObstacles(obstacles.filter((_, i) => i !== existingIndex))
      return
    }

    // Si hay menos de 5 obstáculos, añadir uno nuevo
    if (obstacles.length < 5) {
      setObstacles([...obstacles, { x, y }])
    }
  }

  const handleSaveSimulation = async () => {
    if (commandHistory.length === 0) {
      alert('No hay comandos para guardar')
      return
    }

    try {
      await simulateRobot(commandHistory)
      alert('¡Simulación guardada en el historial!')
    } catch (error) {
      alert('Error al guardar: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className={styles.container}>
      {/* DarkVeil Background */}
      <div className={styles.background}>
        <DarkVeil
          hueShift={335}
          noiseIntensity={0.05}
          speed={2.9}
          scanlineFrequency={2.7}
        />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.headerContent}
        >
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🤖</span>
            ROBOT SIMULATOR
          </h1>
          <div className={styles.headerActions}>
            <p className={styles.subtitle}>
              Usa las teclas para controlar el robot en tiempo real
            </p>
            <button onClick={handleLogout} className={styles.logoutButton}>
              🚪 Cerrar sesión
            </button>
          </div>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        <div className={styles.mainSection}>
          {/* Grid del robot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Grid
              robotPosition={robotPosition}
              robotDirection={robotDirection}
              obstacles={obstacles}
              isAnimating={isAnimating}
              isEditMode={isEditMode}
              onCellClick={handleCellClick}
              lastCommandSuccess={lastCommandSuccess}
            />
          </motion.div>

          {/* Controles */}
          <motion.div
            className={styles.controls}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.controlsTitle}>🎮 Controles</h3>
            <div className={styles.keyboardHint}>
              <div className={styles.keyGroup}>
                <kbd className={styles.key}>A</kbd>
                <kbd className={styles.key}>W</kbd>
                <kbd className={styles.key}>↑</kbd>
                <span>Avanzar</span>
              </div>
              <div className={styles.keyGroup}>
                <kbd className={styles.key}>I</kbd>
                <kbd className={styles.key}>Q</kbd>
                <kbd className={styles.key}>←</kbd>
                <span>Girar izquierda</span>
              </div>
              <div className={styles.keyGroup}>
                <kbd className={styles.key}>D</kbd>
                <kbd className={styles.key}>E</kbd>
                <kbd className={styles.key}>→</kbd>
                <span>Girar derecha</span>
              </div>
            </div>

            {lastCommand && (
              <motion.div
                className={styles.lastCommand}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={lastCommand}
              >
                {lastCommand}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Sidebar con stats */}
        <div className={styles.sidebar}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SimulationStats
              position={robotPosition}
              direction={robotDirection}
              successes={successes}
              failures={failures}
              totalCommands={commandHistory.length}
            />
          </motion.div>

          {/* Historial de comandos */}
          <motion.div
            className={styles.historyBox}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className={styles.historyTitle}>📜 Comandos ejecutados</h4>
            <div className={styles.historyContent}>
              {commandHistory || 'Ninguno aún...'}
            </div>
          </motion.div>

          {/* Botones */}
          <motion.button
            onClick={() => setIsEditMode(!isEditMode)}
            className={isEditMode ? styles.editButtonActive : styles.editButton}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{isEditMode ? '✓' : '✏️'}</span>
            {isEditMode ? 'Terminar edición' : 'Editar obstáculos'}
          </motion.button>

          {isEditMode && (
            <motion.div
              className={styles.editHint}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Click en las casillas para añadir/quitar obstáculos (máx. 5)
            </motion.div>
          )}

          <motion.button
            onClick={handleSaveSimulation}
            className={styles.saveButton}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={commandHistory.length === 0}
          >
            <span>💾</span>
            Guardar simulación
          </motion.button>

          <motion.button
            onClick={handleReset}
            className={styles.resetButton}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🔄</span>
            Reiniciar
          </motion.button>

          {/* Info */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h4 className={styles.infoTitle}>ℹ️ Información</h4>
            <ul className={styles.infoList}>
              <li>El robot inicia en (0,0) mirando al Norte</li>
              <li>Los obstáculos están marcados con ⚠️</li>
              <li>Usa el teclado para controlar el robot</li>
              <li>Guarda tu simulación cuando termines</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}