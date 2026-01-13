import { motion } from 'framer-motion'
import styles from './Grid.module.css'

interface GridProps {
  robotPosition: { x: number; y: number }
  robotDirection: 'Norte' | 'Este' | 'Sur' | 'Oeste'
  obstacles: Array<{ x: number; y: number }>
  isAnimating?: boolean
  isEditMode?: boolean
  onCellClick?: (x: number, y: number) => void
}

const DIRECTION_ARROWS = {
  Norte: '↑',
  Este: '→',
  Sur: '↓',
  Oeste: '←'
}

export default function Grid({ robotPosition, robotDirection, obstacles, isAnimating, isEditMode, onCellClick }: GridProps) {
  const isObstacle = (x: number, y: number) => {
    return obstacles.some(obs => obs.x === x && obs.y === y)
  }

  const isRobot = (x: number, y: number) => {
    return robotPosition.x === x && robotPosition.y === y
  }

  return (
    <div className={styles.gridContainer}>
      {Array.from({ length: 5 }).map((_, y) => (
        <div key={y} className={styles.row}>
          {Array.from({ length: 5 }).map((_, x) => {
            const hasObstacle = isObstacle(x, y)
            const hasRobot = isRobot(x, y)
            
            return (
              <motion.div
                key={`${x}-${y}`}
                className={`${styles.cell} ${hasObstacle ? styles.obstacle : ''} ${hasRobot ? styles.robotCell : ''} ${isEditMode ? styles.editable : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (y * 5 + x) * 0.02 }}
                onClick={() => onCellClick?.(x, y)}
                style={{ cursor: isEditMode ? 'pointer' : 'default' }}
              >
                {/* Coordenadas */}
                <span className={styles.coords}>{x},{y}</span>
                
                {/* Obstáculo */}
                {hasObstacle && (
                  <motion.div
                    className={styles.obstacleIcon}
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ⚠️
                  </motion.div>
                )}
                
                {/* Robot */}
                {hasRobot && (
                  <motion.div
                    className={styles.robot}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      rotate: isAnimating ? 360 : 0 
                    }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 260, damping: 20 },
                      rotate: { duration: 0.5 }
                    }}
                  >
                    <div className={styles.robotBody}>
                      <span className={styles.robotArrow}>
                        {DIRECTION_ARROWS[robotDirection]}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}