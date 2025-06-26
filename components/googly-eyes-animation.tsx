"use client"

import { useState, useEffect, useRef } from "react"

interface GooglyEye {
  id: number
  x: number
  y: number
  size: number
  vx: number
  vy: number
  pupilX: number
  pupilY: number
}

const GooglyEyesAnimation = () => {
  const [eyes, setEyes] = useState<GooglyEye[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateEyes = () => {
      const newEyes: GooglyEye[] = Array.from({ length: 20 }, (_, i) => {
        const size = Math.random() * 40 + 20 // size between 20 and 60
        return {
          id: i,
          x: Math.random() * window.innerWidth,
          y: -Math.random() * window.innerHeight, // Start off-screen from top
          size,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 1,
          pupilX: 0,
          pupilY: 0,
        }
      })
      setEyes(newEyes)
    }
    generateEyes()
  }, [])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      setEyes((prevEyes) =>
        prevEyes.map((eye) => {
          let { x, y, vx, vy } = eye

          // Apply gravity
          vy += 0.1

          // Update position
          x += vx
          y += vy

          // Bounce off walls
          if (x < 0 || x > window.innerWidth - eye.size) {
            vx *= -0.8
            x = x < 0 ? 0 : window.innerWidth - eye.size
          }

          // Bounce off floor
          if (y > window.innerHeight - eye.size) {
            vy *= -0.6
            y = window.innerHeight - eye.size
            // Add some horizontal spin on bounce
            vx += (Math.random() - 0.5) * 2
          }

          // Reset if it goes way off screen
          if (y > window.innerHeight + 200) {
            y = -eye.size
          }

          // Jiggle pupil
          const pupilX = (Math.random() - 0.5) * (eye.size * 0.2)
          const pupilY = (Math.random() - 0.5) * (eye.size * 0.2)

          return { ...eye, x, y, vx, vy, pupilX, pupilY }
        }),
      )
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {eyes.map((eye) => (
        <div
          key={eye.id}
          className="absolute bg-white rounded-full border-2 border-black flex items-center justify-center"
          style={{
            left: eye.x,
            top: eye.y,
            width: eye.size,
            height: eye.size,
            transform: `translateZ(0)`, // Promote to own layer for performance
          }}
        >
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: eye.size * 0.5,
              height: eye.size * 0.5,
              transform: `translate(${eye.pupilX}px, ${eye.pupilY}px)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default GooglyEyesAnimation
