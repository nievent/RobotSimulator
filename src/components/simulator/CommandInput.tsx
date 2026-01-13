import { motion } from 'framer-motion'
import styles from './CommandInput.module.css'

interface CommandInputProps {
  commands: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
}

export default function CommandInput({ commands, onChange, onExecute, isExecuting }: CommandInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      onExecute()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Comandos</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <kbd>A</kbd> Avanzar
          </span>
          <span className={styles.legendItem}>
            <kbd>I</kbd> Izquierda
          </span>
          <span className={styles.legendItem}>
            <kbd>D</kbd> Derecha
          </span>
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={commands}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Ej: AAIADDAA"
          className={styles.input}
          disabled={isExecuting}
        />
        <div className={styles.counter}>
          {commands.length} comandos
        </div>
      </div>

      <motion.button
        onClick={onExecute}
        disabled={isExecuting || commands.length === 0}
        className={styles.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isExecuting ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⚡
            </motion.span>
            Ejecutando...
          </>
        ) : (
          <>
            <span>▶</span>
            Ejecutar simulación
          </>
        )}
      </motion.button>
    </div>
  )
}