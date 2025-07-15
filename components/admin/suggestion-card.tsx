"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Edit2, Check, X } from "lucide-react"
import type { ChallengeCard } from "@/types"

interface SuggestionCardProps {
  card: Omit<ChallengeCard, "id" | "created_at">
  onKeep: (card: Omit<ChallengeCard, "id" | "created_at">) => void
  onPass: () => void
  onEdit: (card: Omit<ChallengeCard, "id" | "created_at">, instructions: string) => void
  isProcessing: boolean
}

export default function SuggestionCard({ card, onKeep, onPass, onEdit, isProcessing }: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editInstructions, setEditInstructions] = useState("")
  const [showHint, setShowHint] = useState(false)

  const handleEdit = () => {
    if (editInstructions.trim()) {
      onEdit(card, editInstructions.trim())
      setEditInstructions("")
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditInstructions("")
    setIsEditing(false)
  }

  return (
    <Card className={`${card.color} border-2 transition-all duration-300`}>
      <CardContent className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 text-4xl">{card.icon}</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span className="font-semibold text-sm bg-white/90 px-2 py-1 rounded-full">{card.category}</span>
            {card.timer && (
              <span className="font-semibold text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {card.timer}s
              </span>
            )}
          </div>
          <p className="text-lg font-medium text-gray-900 leading-tight mb-4">{card.challenge}</p>

          {card.hint && (
            <>
              {!showHint && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4 text-xs py-1 bg-white/80 hover:bg-white"
                  onClick={() => setShowHint(true)}
                >
                  <HelpCircle className="w-3 h-3 mr-1" /> Show Hint
                </Button>
              )}
              {showHint && (
                <div className="mb-4 text-xs text-gray-800 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <p className="font-semibold mb-1 text-yellow-700">Hint:</p>
                  <p>{card.hint}</p>
                </div>
              )}
            </>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <Input
                placeholder="What would you like to change?"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="bg-white/90"
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleEdit}
                  disabled={!editInstructions.trim() || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Apply Edit
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isProcessing}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => onKeep(card)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Keep
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
                variant="outline"
                className="bg-white/80 hover:bg-white"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button onClick={onPass} disabled={isProcessing} variant="outline" className="bg-white/80 hover:bg-white">
                Pass
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
