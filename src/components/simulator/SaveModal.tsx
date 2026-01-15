import { motion, AnimatePresence } from 'framer-motion'
import styles from './SaveModal.module.css'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  success: boolean
  message: string
}

export default function SaveModal({ isOpen, onClose, success, message }: SaveModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icono animado */}
          <motion.div
            className={styles.iconWrapper}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {success ? (
              <motion.div
                className={styles.iconSuccess}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(57, 255, 20, 0.5)',
                    '0 0 40px rgba(57, 255, 20, 0.8)',
                    '0 0 20px rgba(57, 255, 20, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✓
              </motion.div>
            ) : (
              <motion.div
                className={styles.iconError}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 7, 58, 0.5)',
                    '0 0 40px rgba(255, 7, 58, 0.8)',
                    '0 0 20px rgba(255, 7, 58, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✗
              </motion.div>
            )}
          </motion.div>

          {/* Título */}
          <motion.h2
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {success ? '¡Simulación guardada!' : 'Error al guardar'}
          </motion.h2>

          {/* Mensaje */}
          <motion.p
            className={styles.message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {message}
          </motion.p>

          {/* Botón */}
          <motion.button
            className={styles.button}
            onClick={onClose}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Entendido
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}