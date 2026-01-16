# 🤖 Robot Simulator - Prueba Técnica Lienzzo
Una aplicación web interactiva donde usuarios autenticados pueden simular un robot navegando en una cuadrícula 5x5 con obstáculos. Incluye visualización 3D, sistema de autenticación, persistencia de datos y un chatbot con IA potenciado por Gemini.

## ✨ Características

### 🎮 Simulador de Robot
- **Cuadrícula 5x5** con visualización interactiva
- **Robot 3D animado** renderizado con Three.js
- **Control en tiempo real** mediante teclado (IDA(izquierda, derecha, avanza), QWE y flechas)
- **Obstáculos dinámicos** (2-5 obstáculos aleatorios)
- **Editor visual** para colocar/quitar obstáculos manualmente
- **Animaciones fluidas** de movimiento, giros y colisiones
- **Feedback visual** instantáneo de éxitos y fallos

### 🎯 Lógica del Juego
- **Posición inicial:** (0,0) mirando al Norte
- **Comandos:**
  - `A` / `W` / `↑` - Avanzar
  - `I` / `Q` / `←` - Girar izquierda 90°
  - `D` / `E` / `→` - Girar derecha 90°
- **Colisiones:** Si el robot choca con un obstáculo o el borde, el movimiento falla pero continúa con el siguiente comando
- **Estadísticas en tiempo real:** Éxitos, fallos, tasa de éxito

### 🔐 Autenticación
- **Login/Registro** con email y contraseña
- **Rutas protegidas:** Solo usuarios autenticados pueden acceder al simulador
- **Gestión de sesiones** con Supabase Auth
- **Cierre de sesión** seguro

### 💾 Persistencia de Datos
- **Base de datos Supabase** con PostgreSQL
- **Row Level Security (RLS):** Cada usuario solo ve sus propias simulaciones
- **Guardado automático** de:
  - Comandos ejecutados
  - Posición final del robot
  - Dirección final
  - Estadísticas (éxitos/fallos)
  - Timestamp
- **Historial completo** de las últimas 10 simulaciones

### 🤖 Chatbot con IA (Gemini)
- **Asistente inteligente** potenciado por Google Gemini 3 pro
- **Contexto completo del juego** mediante JSON estructurado
- **Respuestas precisas** sobre:
  - Posición actual del robot
  - Obstáculos cercanos
  - Sugerencias de movimientos
  - Análisis de estadísticas
  - Cálculo de rutas
- **Interfaz conversacional** con animaciones y emojis
- **Respuestas en tiempo real** con feedback visual

### 🎨 Interfaz Moderna
- **Diseño recreativo moderno** con gradientes neón
- **Animaciones con Framer Motion**
- **Background dinámico** con shader de ruido
- **Tema oscuro** con efectos glassmorphism
- **Fondo animado** con ReactBits

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 16.1** (App Router)
- **React 19**
- **TypeScript**
- **Three.js** (Visualización 3D)
- **Framer Motion** (Animaciones)
- **CSS Modules** (Estilos)

### Backend
- **Next.js Server Actions**
- **Supabase** (Base de datos + Auth)
- **PostgreSQL** (Base de datos)
- **Google Gemini API** (Chatbot IA)

### Librerías
- `@supabase/ssr` - Cliente de Supabase
- `@google/generative-ai` - Cliente de Gemini
- `three` - Renderizado 3D
- `framer-motion` - Animaciones

## 📦 Instalación

> 🔒 **AVISO DE SEGURIDAD**: Este proyecto requiere que cada usuario configure sus propias credenciales. Por razones de seguridad, **NO** se incluyen API Keys ni credenciales de ningún tipo en el repositorio. Ambos servicios (Supabase y Gemini) tienen planes gratuitos generosos.

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- API Key de Google Gemini

### 1. Clonar el repositorio
```bash
git clone https://github.com/nievent/RobotSimulator 
cd robot-simulator
```

### 2. Instalar dependencias
```bash
npm install
```

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Gemini API
GEMINI_API_KEY=tu_gemini_api_key
```

#### 🔐 Cada desarrollador debe obtener sus propias credenciales:

**Credenciales de Supabase:**
1. Ve a [supabase.com](https://supabase.com)
2. **Crea tu propio proyecto** (gratis)
3. Ve a **Settings > API**
4. Copia TU `URL` y TU `anon key`
5. **Ejecuta el SQL** de la sección 4 para crear las tablas

**API Key de Gemini:**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Crea tu propia API Key** (gratis)
3. Cópiala en tu `.env.local`


### 4. Configurar la base de datos

Ejecuta este SQL en el editor de Supabase:

```sql
-- Crear tabla de simulaciones
CREATE TABLE simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commands TEXT NOT NULL,
  final_position JSONB NOT NULL,
  final_direction TEXT NOT NULL,
  successes INTEGER NOT NULL,
  failures INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias simulaciones
CREATE POLICY "Users can view own simulations"
ON simulations FOR SELECT
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden crear sus propias simulaciones
CREATE POLICY "Users can create own simulations"
ON simulations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_simulations_user_id ON simulations(user_id);
CREATE INDEX idx_simulations_created_at ON simulations(created_at DESC);
```

### 5. Configurar autenticación en Supabase

En el dashboard de Supabase:
1. Ve a **Authentication > Providers**
2. Habilita **Email** provider
3. En **URL Configuration**, añade:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.


## 🎮 Cómo Usar

### 1. Registro/Login
- Crea una cuenta con email y contraseña
- Inicia sesión para acceder al simulador

### 2. Controlar el Robot
- Usa el **teclado** para controlar el robot en tiempo real:
  - `A`, `W`, o `↑` para avanzar
  - `I`, `Q`, o `←` para girar a la izquierda
  - `D`, `E`, o `→` para girar a la derecha
- Observa las **animaciones 3D** del robot moviéndose
- Verifica las **estadísticas** en tiempo real

### 3. Editar Obstáculos
- Click en **"Editar obstáculos"**
- Click en las casillas para añadir/quitar obstáculos (máx. 5)
- Click en **"Terminar edición"** cuando acabes

### 4. Guardar Simulación
- Click en **"Guardar simulación"**
- Tu simulación se guardará en la base de datos
- Podrás verla en el historial de la columna derecha

### 5. Chatbot con IA
- Click en el **botón flotante 🤖** (esquina inferior derecha)
- Pregunta al asistente sobre:
  - "¿Dónde estoy?"
  - "¿Tengo obstáculos cerca?"
  - "¿Puedo avanzar?"
  - "Dame una ruta para llegar a (4,4)"
  - "¿Cómo van mis estadísticas?"
- El chatbot analizará el estado completo del juego y te dará respuestas precisas

### 6. Reiniciar
- Click en **"Reiniciar"** para volver al estado inicial
- Se generarán nuevos obstáculos aleatorios

## 📝 Notas Técnicas

### Lógica del Simulador
La lógica de movimiento se ejecuta completamente en el **cliente** (frontend) para una experiencia fluida en tiempo real. Solo se comunica con el servidor para:
- Guardar simulaciones
- Obtener historial
- Consultar el chatbot

### Row Level Security (RLS)
Todas las simulaciones están protegidas con RLS a nivel de base de datos. Esto significa que:
- Los usuarios solo pueden ver sus propias simulaciones
- No es posible acceder a datos de otros usuarios, incluso manipulando la API
- La seguridad se aplica en la capa de base de datos, no solo en el frontend

### Chatbot con Gemini
El chatbot envía un JSON completo con:
- Estado del robot (posición, dirección)
- Todos los obstáculos
- Historial de comandos
- Estadísticas completas
- Reglas del juego

Esto permite que Gemini tenga contexto total y pueda calcular rutas, detectar colisiones y dar sugerencias precisas.


## 🐛 Troubleshooting

### Error: "No autenticado"
- Verifica que has iniciado sesión
- Revisa que las URLs de Supabase estén correctamente configuradas

### El chatbot no responde
- Verifica que `GEMINI_API_KEY` esté en `.env.local`
- Revisa la consola del servidor para ver errores
- Comprueba que no has agotado la cuota de Gemini

### Las simulaciones no se guardan
- Verifica que RLS esté configurado correctamente
- Revisa la consola para errores de Supabase
- Comprueba que el usuario esté autenticado

### El robot 3D no se ve
- Asegúrate de que Three.js se instaló correctamente: `npm install three`
- Revisa la consola del navegador para errores
- Prueba en un navegador moderno (Chrome, Firefox, Safari)

## 👤 Autor

**Nieves Ventura Vazquez**
- GitHub: [@nievent](https://github.com/nievent/)
- Email: nieves.venturav@gmail.com

## Link del proyecto en Vercel

- https://robot-simulator-nievent-o1x4ygztb-nievents-projects.vercel.app/login