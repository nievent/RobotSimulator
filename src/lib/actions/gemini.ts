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

    // Crear un JSON más detallado con TODA la información
    const gameState = {
      grid: {
        size: 5,
        coordinates: "De (0,0) a (4,4)",
        robotStart: { x: 0, y: 0 }
      },
      robot: {
        currentPosition: robotState.position,
        currentDirection: robotState.direction,
        facingAngle: {
          Norte: "Arriba (Y disminuye)",
          Este: "Derecha (X aumenta)", 
          Sur: "Abajo (Y aumenta)",
          Oeste: "Izquierda (X disminuye)"
        }[robotState.direction]
      },
      obstacles: robotState.obstacles.length > 0 
        ? robotState.obstacles.map(o => `Obstáculo en (${o.x},${o.y})`)
        : ["No hay obstáculos"],
      commandHistory: {
        total: robotState.commandHistory.length,
        commands: robotState.commandHistory || "ninguno",
        breakdown: robotState.commandHistory.split('').map(c => 
          c === 'A' ? 'Avanzar' : c === 'I' ? 'Girar izquierda' : 'Girar derecha'
        )
      },
      statistics: {
        successfulMoves: robotState.successes,
        failedMoves: robotState.failures,
        successRate: robotState.commandHistory.length > 0
          ? `${Math.round((robotState.successes / robotState.commandHistory.length) * 100)}%`
          : "0%"
      }
    }

    const prompt = `Eres un asistente experto en un simulador de robot. Analiza CUIDADOSAMENTE el siguiente JSON y responde con PRECISIÓN.

ESTADO COMPLETO DEL JUEGO:
${JSON.stringify(gameState, null, 2)}

REGLAS IMPORTANTES:
1. La cuadrícula es 5x5, con coordenadas de (0,0) a (4,4)
2. El robot empieza en (0,0) mirando al Norte
3. Comandos disponibles:
   - A = Avanzar UNA casilla hacia adelante en la dirección actual
   - I = Girar 90° a la IZQUIERDA
   - D = Girar 90° a la DERECHA
4. Sistema de coordenadas:
   - Norte: Y-1 (hacia arriba)
   - Este: X+1 (hacia derecha)
   - Sur: Y+1 (hacia abajo)
   - Oeste: X-1 (hacia izquierda)
5. Si el robot intenta avanzar a un obstáculo o fuera del tablero (X<0, X>4, Y<0, Y>4), el movimiento FALLA pero continúa con el siguiente comando

PREGUNTA DEL USUARIO: "${message}"

INSTRUCCIONES PARA RESPONDER:
- Lee el JSON completamente antes de responder
- Calcula posiciones exactas cuando sea relevante
- Si mencionas coordenadas, usa el formato (X,Y)
- Si sugieres comandos, explica brevemente qué harán
- Usa emojis: 🤖 (robot), 🎯 (objetivo), ⚠️ (obstáculo), ✅ (ok), ❌ (fallo), ⬆️➡️⬇️⬅️ (direcciones)
- Responde en 2-4 líneas, claro y directo
- IMPORTANTE: Verifica tus cálculos dos veces antes de responder

Responde ahora de forma precisa y útil:`

    console.log('🤖 Llamando a Gemini 3 Pro...')

    // Intentar con Gemini 3 Pro primero, luego fallback a otros modelos
    const modelsToTry = [
      'gemini-3-pro-preview',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
    ]

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
        
        console.log(`📡 Probando modelo: ${modelName}`)
        
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
              temperature: 0.7,
              maxOutputTokens: 2000, 
              topP: 0.95,
            }
          })
        })

        const data = await response.json()
        
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text
          
          // Verificar si la respuesta está completa
          const finishReason = data.candidates[0].finishReason
          console.log(`✅ Respuesta con ${modelName}`)
          console.log(`📏 Longitud: ${text.length} caracteres`)
          console.log(`🏁 Finish reason: ${finishReason}`)
          console.log(`📝 Texto completo: ${text}`)
          
          // Si se cortó por longitud, advertir
          if (finishReason === 'MAX_TOKENS') {
            console.log('⚠️ Respuesta cortada por MAX_TOKENS')
          }
          
          return { success: true, message: text }
        }
        
        if (!response.ok) {
          console.log(`❌ ${modelName} falló:`, data.error?.message || 'Sin detalles')
        }
        
      } catch (err) {
        console.log(`❌ Error con ${modelName}:`, err instanceof Error ? err.message : 'Error desconocido')
      }
    }

    return { 
      success: false, 
      message: 'No se pudo conectar con Gemini. Verifica tu API Key.' 
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