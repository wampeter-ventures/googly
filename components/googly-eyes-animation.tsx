"use client"

import { useEffect, useState } from "react"

interface GooglyEye {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  pupilX: number
  pupilY: number
  color: string
}

export default function GooglyEyesAnimation() {
  const [eyes, setEyes] = useState<GooglyEye[]>([])

  useEffect(() => {
    // Initialize googly eyes
    const initialEyes: GooglyEye[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 30 + 20,
      pupilX: 0,
      pupilY: 0,
      color: ["#ffffff", "#f0f0f0", "#fafafa"][Math.floor(Math.random() * 3)],
    }))
    setEyes(initialEyes)

    const animateEyes = () => {
      setEyes((prevEyes) =>
        prevEyes.map((eye) => {
          let newX = eye.x + eye.vx
          let newY = eye.y + eye.vy
          let newVx = eye.vx
          let newVy = eye.vy + 0.2 // gravity

          // Bounce off walls
          if (newX <= 0 || newX >= window.innerWidth - eye.size) {
            newVx = -newVx * 0.8
            newX = Math.max(0, Math.min(window.innerWidth - eye.size, newX))
          }
          if (newY <= 0 || newY >= window.innerHeight - eye.size) {
            newVy = -newVy * 0.8
            newY = Math.max(0, Math.min(window.innerHeight - eye.size, newY))
          }

          // Jiggle pupils randomly
          const pupilRange = eye.size * 0.15
          const newPupilX = (Math.random() - 0.5) * pupilRange
          const newPupilY = (Math.random() - 0.5) * pupilRange

          return {
            ...eye,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            pupilX: newPupilX,
            pupilY: newPupilY,
          }
        }),
      )
    }

    const interval = setInterval(animateEyes, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {eyes.map((eye) => (
        <div
          key={eye.id}
          className="absolute rounded-full border-2 border-gray-300 shadow-lg"
          style={{
            left: eye.x,
            top: eye.y,
            width: eye.size,
            height: eye.size,
            backgroundColor: eye.color,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Pupil */}
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: eye.size * 0.4,
              height: eye.size * 0.4,
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${eye.pupilX}px, ${eye.pupilY}px)`,
            }}
          >
            {/* Highlight */}
            <div
              className="absolute bg-white rounded-full"
              style={{
                width: eye.size * 0.15,
                height: eye.size * 0.15,
                left: "20%",
                top: "20%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
