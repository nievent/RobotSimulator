import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Robot3DProps {
  direction: 'Norte' | 'Este' | 'Sur' | 'Oeste'
  isAnimating?: boolean
  lastCommandSuccess?: boolean
}

const DIRECTION_ANGLES = {
  Sur: 0,
  Este: Math.PI / 2,
  Norte: Math.PI,
  Oeste: -Math.PI / 2
}

export default function Robot3D({ direction, isAnimating, lastCommandSuccess }: Robot3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const robotRef = useRef<THREE.Group | null>(null)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return

    // Limpiar cualquier canvas existente
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }

    // Setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(120, 120)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x00f0ff, 1, 100)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100)
    pointLight2.position.set(-5, 5, -5)
    scene.add(pointLight2)

    // Crear robot
    const robot = new THREE.Group()
    robotRef.current = robot

    // Material neón
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.3,
      shininess: 100
    })

    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.3,
      shininess: 100
    })

    const eyeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff
    })

    // Cuerpo
    const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.8)
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0
    robot.add(body)

    // Cabeza
    const headGeometry = new THREE.BoxGeometry(0.8, 0.7, 0.7)
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 0.95
    robot.add(head)

    // Ojos
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8)
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.2, 0.95, 0.36)
    robot.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.2, 0.95, 0.36)
    robot.add(rightEye)

    // Brazos
    const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25)
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial)
    leftArm.position.set(-0.7, 0, 0)
    robot.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial)
    rightArm.position.set(0.7, 0, 0)
    robot.add(rightArm)

    // Piernas
    const legGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.3)
    
    const leftLeg = new THREE.Mesh(legGeometry, headMaterial)
    leftLeg.position.set(-0.25, -0.95, 0)
    robot.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, headMaterial)
    rightLeg.position.set(0.25, -0.95, 0)
    robot.add(rightLeg)

    // Antena
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4)
    const antenna = new THREE.Mesh(antennaGeometry, eyeMaterial)
    antenna.position.y = 1.5
    robot.add(antenna)

    const antennaTopGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const antennaTop = new THREE.Mesh(antennaTopGeometry, eyeMaterial)
    antennaTop.position.y = 1.7
    robot.add(antennaTop)

    robot.position.y = 0.3
    scene.add(robot)

    // Animación
    let time = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      time += 0.05

      // Balanceo sutil
      robot.position.y = 0.3 + Math.sin(time) * 0.05

      // Rotación de antena
      antennaTop.rotation.y += 0.05

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Actualizar rotación cuando cambia la dirección
  useEffect(() => {
    if (robotRef.current) {
      const targetRotation = DIRECTION_ANGLES[direction]
      
      const animate = () => {
        if (!robotRef.current) return
        
        const currentRotation = robotRef.current.rotation.y
        const diff = targetRotation - currentRotation
        
        if (Math.abs(diff) > 0.01) {
          robotRef.current.rotation.y += diff * 0.15
          requestAnimationFrame(animate)
        } else {
          robotRef.current.rotation.y = targetRotation
        }
      }
      
      animate()
    }
  }, [direction])

  // Animación de salto o choque cuando se mueve
  useEffect(() => {
    if (!isAnimating || !robotRef.current) return
    
    const startY = robotRef.current.position.y
    const startZ = robotRef.current.position.z
    let progress = 0
    
    if (lastCommandSuccess === false) {
      // Animación de choque EXAGERADA - retrocede más y tiembla fuerte
      const shake = () => {
        if (!robotRef.current) return
        progress += 0.12 // Más lento para que se note más
        
        if (progress <= 1) {
          // Temblor más intenso (x4 frecuencia, 3x amplitud)
          const shakeAmount = Math.sin(progress * Math.PI * 8) * 0.3
          // Retroceso más pronunciado
          const moveBack = Math.sin(progress * Math.PI) * 0.6
          // También tiembla verticalmente
          const shakeY = Math.sin(progress * Math.PI * 6) * 0.15
          
          robotRef.current.position.z = startZ - moveBack
          robotRef.current.position.x = shakeAmount
          robotRef.current.position.y = startY + shakeY
          
          // Inclina el robot al chocar
          robotRef.current.rotation.x = Math.sin(progress * Math.PI) * 0.3
          
          requestAnimationFrame(shake)
        } else {
          robotRef.current.position.z = startZ
          robotRef.current.position.x = 0
          robotRef.current.position.y = startY
          robotRef.current.rotation.x = 0
        }
      }
      shake()
    } else if (lastCommandSuccess === true) {
      // Animación de salto exitoso
      const jump = () => {
        if (!robotRef.current) return
        progress += 0.1
        
        if (progress <= 1) {
          const jumpHeight = Math.sin(progress * Math.PI) * 0.3
          robotRef.current.position.y = startY + jumpHeight
          requestAnimationFrame(jump)
        } else {
          robotRef.current.position.y = startY
        }
      }
      jump()
    }
  }, [isAnimating, lastCommandSuccess])

  return <div ref={containerRef} style={{ width: '120px', height: '120px' }} />
}