'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import DarkVeil from '@/components/DarkVeil'
import styles from './login.module.css'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      router.push('/simulator')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* DarkVeil - TODO EL FONDO */}
      <div className={styles.background}>
        <DarkVeil
          hueShift={335}
          noiseIntensity={0.05}
          speed={2.9}
          scanlineFrequency={2.7}
        />
      </div>

      {/* Contenido centrado */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
              <motion.div
                className={styles.iconWrapper}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.icon}>
                  🤖
                </div>
              </motion.div>

              <h1 className={styles.title}>ROBOT SIMULATOR</h1>
              <p className={styles.subtitle}>
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleAuth} className={styles.form}>
              <motion.div
                className={styles.field}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="email" className={styles.label}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className={styles.input}
                />
              </motion.div>

              <motion.div
                className={styles.field}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="password" className={styles.label}>
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={styles.input}
                />
              </motion.div>

              {error && (
                <motion.div
                  className={styles.error}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? (
                    <span>⚡ Procesando...</span>
                  ) : (
                    isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                  )}
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
                className={styles.toggleButton}
              >
                {isLogin ? (
                  <>
                    ¿No tienes cuenta? <span>Regístrate</span>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta? <span>Inicia sesión</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}