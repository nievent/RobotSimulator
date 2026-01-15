'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

interface RobotState {
  position: { x: number; y: number }
  direction: string
  obstacles: Array<{ x: number; y: number }>
  commandHistory: string
  successes: number
  failures: number
}

export async function chatWithRobot(message: string, robotState: RobotState) {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('API Key de Gemini no configurada')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Crear el contexto del robot
  const context = `
Eres un asistente inteligente de un robot que se mueve en una cuadrícula 5x5.

ESTADO ACTUAL DEL ROBOT:
- Posición: (${robotState.position.x}, ${robotState.position.y})
- Dirección: ${robotState.direction}
- Comandos ejecutados: ${robotState.commandHistory || 'Ninguno'}
- Movimientos exitosos: ${robotState.successes}
- Movimientos fallidos: ${robotState.failures}

OBSTÁCULOS EN LA CUADRÍCULA:
${robotState.obstacles.map(obs => `- Obstáculo en (${obs.x}, ${obs.y})`).join('\n')}

REGLAS DEL JUEGO:
- La cuadrícula es 5x5 (coordenadas de 0,0 a 4,4)
- El robot inicia en (0,0) mirando al Norte
- Comandos disponibles:
  • A = Avanzar en la dirección actual
  • I = Girar 90° a la izquierda
  • D = Girar 90° a la derecha
- Si el robot choca con un obstáculo o el borde, el movimiento falla pero continúa ejecutando comandos
- Direcciones: Norte (arriba, -Y), Este (derecha, +X), Sur (abajo, +Y), Oeste (izquierda, -X)

TU ROL:
- Responde de forma concisa y útil
- Analiza el entorno del robot
- Sugiere comandos cuando sea apropiado
- Explica qué puede ver el robot desde su posición
- Ayuda al usuario a navegar evitando obstáculos
- Usa emojis ocasionalmente (🤖, 🎯, ⚠️, ✅) para hacer las respuestas más amigables
- Sé breve y directo, máximo 3-4 líneas por respuesta

Pregunta del usuario: ${message}
`

  try {
    const result = await model.generateContent(context)
    const response = await result.response
    const text = response.text()
    
    return { success: true, message: text }
  } catch (error) {
    console.error('Error al llamar a Gemini:', error)
    return { 
      success: false, 
      message: 'Lo siento, no pude procesar tu pregunta. Intenta de nuevo.' 
    }
  }
}