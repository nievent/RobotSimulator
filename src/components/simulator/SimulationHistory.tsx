'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSimulationHistory } from '@/lib/actions/simulate'
import styles from './SimulationHistory.module.css'

interface Simulation {
  id: string
  commands: string
  final_position: { x: number; y: number }
  final_direction: string
  successes: number
  failures: number
  created_at: string
}

export default function SimulationHistory() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [refreshKey])

  // Exponer función de refresh globalmente
  useEffect(() => {
    const w = window as Window & { refreshSimulationHistory?: () => void }
    w.refreshSimulationHistory = () => {
      setRefreshKey(prev => prev + 1)
    }
    return () => {
      delete w.refreshSimulationHistory
    }
  }, [])

  const loadHistory = async () => {
    try {
      const data = await getSimulationHistory()
      setSimulations(data)
    } catch (error) {
      console.error('Error al cargar historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getSuccessRate = (successes: number, failures: number) => {
    const total = successes + failures
    return total > 0 ? Math.round((successes / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📜 Historial de simulaciones</h3>
        <div className={styles.loading}>Cargando...</div>
      </div>
    )
  }

  if (simulations.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📜 Historial de simulaciones</h3>
        <div className={styles.empty}>
          No tienes simulaciones guardadas aún. ¡Completa una simulación y guárdala!
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📜 Historial de simulaciones</h3>
      <div className={styles.list}>
        {simulations.map((sim, index) => {
          const successRate = getSuccessRate(sim.successes, sim.failures)
          
          return (
            <motion.div
              key={sim.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.date}>{formatDate(sim.created_at)}</span>
                <span className={styles.commandCount}>
                  {sim.commands.length} comandos
                </span>
              </div>

              <div className={styles.commands}>
                <span className={styles.commandsLabel}>Comandos:</span>
                <span className={styles.commandsText}>{sim.commands}</span>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Posición final:</span>
                  <span className={styles.statValue}>
                    ({sim.final_position.x}, {sim.final_position.y})
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Dirección:</span>
                  <span className={styles.statValue}>{sim.final_direction}</span>
                </div>
              </div>

              <div className={styles.results}>
                <div className={styles.resultItem}>
                  <span className={styles.success}>✅ {sim.successes}</span>
                  <span className={styles.failure}>❌ {sim.failures}</span>
                </div>
                <div className={styles.successRate}>
                  <div className={styles.successRateBar}>
                    <div 
                      className={styles.successRateFill}
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <span className={styles.successRateText}>{successRate}%</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}