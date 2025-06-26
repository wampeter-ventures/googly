"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface CountdownTimerProps {
  duration: number
  onComplete: () => void
}

export default function CountdownTimer({ duration, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-white font-bold text-9xl tabular-nums animate-pulse">{timeLeft}</div>
      </div>
      <div className="pb-8">
        <Button
          onClick={onComplete}
          variant="outline"
          className="bg-white/20 text-white hover:bg-white/30 hover:text-white border-white/50"
        >
          I'm Done
        </Button>
      </div>
    </div>
  )
}
