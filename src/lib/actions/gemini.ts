'use server'

interface RobotState {
  position: { x: number; y: number }
  direction: string
  obstacles: Array<{ x: number; y: number }>
  commandHistory: string
  successes: number
  failures: number
}

export async function chatWithRobot(message: string, robotState: RobotState) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return { 
        success: false, 
        message: 'API Key no configurada en .env.local' 
      }
    }

    const prompt = `Eres un asistente experto de un robot en una cuadrícula 5x5. Debes dar respuestas útiles y completas.

ESTADO ACTUAL DEL ROBOT:
- Posición actual: (${robotState.position.x}, ${robotState.position.y})
- Mirando hacia: ${robotState.direction}
- Comandos ya ejecutados: ${robotState.commandHistory || 'Ninguno todavía'}
- Movimientos exitosos: ${robotState.successes}
- Movimientos fallidos: ${robotState.failures}
- Total de comandos: ${robotState.commandHistory.length}

OBSTÁCULOS EN EL MAPA:
${robotState.obstacles.length > 0 
  ? robotState.obstacles.map(o => `- Obstáculo en posición (${o.x}, ${o.y})`).join('\n')
  : '- NO hay obstáculos en el mapa'}

REGLAS DEL JUEGO:
- Cuadrícula de 5x5 casillas (coordenadas van de 0 a 4 en X e Y)
- El robot inicia en (0,0) mirando al Norte
- Comandos disponibles:
  * A = Avanzar una casilla hacia adelante
  * I = Girar 90° a la izquierda
  * D = Girar 90° a la derecha
- Si el robot intenta avanzar hacia un obstáculo o fuera del borde, el movimiento FALLA pero continúa con el siguiente comando
- Las direcciones son: Norte (arriba, Y-1), Este (derecha, X+1), Sur (abajo, Y+1), Oeste (izquierda, X-1)

INSTRUCCIONES PARA TI:
- Responde de forma clara, útil y completa
- Analiza bien el estado y el entorno del robot antes de responder
- Si te preguntan sobre movimientos, explica qué pasaría y por qué
- Si te piden sugerencias, da comandos específicos con explicación
- Usa 2-4 líneas de texto, sé conciso pero informativo
- Usa emojis ocasionalmente: 🤖 (robot), 🎯 (objetivo), ⚠️ (peligro), ✅ (éxito), ❌ (fallo), 🔄 (girar), ⬆️➡️⬇️⬅️ (direcciones)

PREGUNTA DEL USUARIO: ${message}

Responde ahora de forma completa y útil:`

    console.log('🤖 Intentando conectar con Gemini API...')

    const urls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    ]

    for (const url of urls) {
      try {
        const modelName = url.split('/models/')[1].split(':')[0]
        console.log(`📡 Probando: ${modelName}`)
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 250,
            }
          })
        })

        const data = await response.json()
        console.log(`📥 Status: ${response.status}`)
        
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text
          console.log(`✅ ¡Funciona con ${modelName}!`)
          console.log(`📝 Respuesta: ${text.substring(0, 100)}...`)
          return { success: true, message: text }
        }
        
        if (!response.ok) {
          console.log(`❌ Error ${response.status}:`, data.error?.message || 'Sin detalles')
        }
        
      } catch (err) {
        console.log(`❌ Error de red:`, err instanceof Error ? err.message : 'Error desconocido')
      }
    }

    // Si llegamos aquí, intentemos listar los modelos disponibles
    console.log('🔍 Intentando listar modelos disponibles...')
    try {
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )
      const listData = await listResponse.json()
      
      if (listResponse.ok && listData.models) {
        console.log('📋 Modelos disponibles:')
        listData.models.forEach((m: { name: string }) => {
          console.log(`  - ${m.name}`)
        })
      }
    } catch (listErr) {
      console.log('No se pudo listar modelos:', listErr)
    }

    return { 
      success: false, 
      message: 'No se pudo conectar con ningún modelo de Gemini. Verifica tu API Key y que no tenga restricciones en Google AI Studio.' 
    }
    
  } catch (error) {
    console.error('💥 Error general:', error)
    
    if (error instanceof Error) {
      return { 
        success: false, 
        message: `Error: ${error.message}` 
      }
    }
    
    return { 
      success: false, 
      message: 'Error desconocido al conectar con Gemini' 
    }
  }
}