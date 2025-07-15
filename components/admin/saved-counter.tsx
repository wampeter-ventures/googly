"use client"

import { useEffect, useState } from "react"
import { getCardCountAction } from "@/app/admin/actions"

export default function SavedCounter() {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCount = async () => {
    setIsLoading(true)
    const result = await getCardCountAction()
    if (result.success) {
      setCount(result.count)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCount()
  }, [])

  // Refresh count when component receives focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => fetchCount()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  if (isLoading) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-sm text-green-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="text-2xl font-bold text-green-800">{count}</div>
      <div className="text-sm text-green-600">Cards Saved</div>
    </div>
  )
}
