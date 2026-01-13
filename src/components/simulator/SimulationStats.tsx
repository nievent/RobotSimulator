import { motion } from 'framer-motion'
import styles from './SimulationStats.module.css'

interface SimulationStatsProps {
  position: { x: number; y: number }
  direction: 'Norte' | 'Este' | 'Sur' | 'Oeste'
  successes: number
  failures: number
  totalCommands: number
}

const DIRECTION_EMOJIS = {
  Norte: '⬆️',
  Este: '➡️',
  Sur: '⬇️',
  Oeste: '⬅️'
}

export default function SimulationStats({ 
  position, 
  direction, 
  successes, 
  failures, 
  totalCommands 
}: SimulationStatsProps) {
  const successRate = totalCommands > 0 
    ? Math.round((successes / totalCommands) * 100) 
    : 0

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Estado del Robot</h3>
      
      <div className={styles.grid}>
        {/* Posición */}
        <motion.div 
          className={styles.stat}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.statIcon}>📍</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Posición</span>
            <span className={styles.statValue}>({position.x}, {position.y})</span>
          </div>
        </motion.div>

        {/* Dirección */}
        <motion.div 
          className={styles.stat}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.statIcon}>{DIRECTION_EMOJIS[direction]}</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Dirección</span>
            <span className={styles.statValue}>{direction}</span>
          </div>
        </motion.div>

        {/* Éxitos */}
        <motion.div 
          className={`${styles.stat} ${styles.success}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Éxitos</span>
            <span className={styles.statValue}>{successes}</span>
          </div>
        </motion.div>

        {/* Fallos */}
        <motion.div 
          className={`${styles.stat} ${styles.failure}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Fallos</span>
            <span className={styles.statValue}>{failures}</span>
          </div>
        </motion.div>
      </div>

      {/* Barra de progreso */}
      {totalCommands > 0 && (
        <motion.div 
          className={styles.progressSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.progressHeader}>
            <span>Tasa de éxito</span>
            <span className={styles.progressPercent}>{successRate}%</span>
          </div>
          <div className={styles.progressBar}>
            <motion.div 
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${successRate}%` }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}