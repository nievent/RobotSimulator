'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatWithRobot } from '@/lib/actions/gemini'
import styles from './RobotChat.module.css'

interface RobotChatProps {
  robotState: {
    position: { x: number; y: number }
    direction: string
    obstacles: Array<{ x: number; y: number }>
    commandHistory: string
    successes: number
    failures: number
  }
  onOpenChange?: (isOpen: boolean) => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function RobotChat({ robotState, onOpenChange }: RobotChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 🤖 Soy el asistente del robot. Pregúntame sobre mi posición, obstáculos o pídeme consejos para navegar.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Notificar cuando cambia el estado abierto/cerrado
  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await chatWithRobot(userMessage, robotState)
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.success ? response.message : '❌ ' + response.message
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Error al procesar tu mensaje. Intenta de nuevo.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(0, 240, 255, 0.5)',
            '0 0 40px rgba(255, 0, 255, 0.7)',
            '0 0 20px rgba(0, 240, 255, 0.5)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isOpen ? '✕' : '🤖'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <span className={styles.headerIcon}>🤖</span>
                <div>
                  <h3 className={styles.headerTitle}>Robot Assistant</h3>
                  <p className={styles.headerSubtitle}>Powered by Gemini AI</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  className={styles.assistantMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className={styles.typing}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregúntame sobre el robot..."
                className={styles.input}
                disabled={isLoading}
              />
              <motion.button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={styles.sendButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ▶
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}