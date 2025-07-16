"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Edit2, Check, X, Loader2 } from "lucide-react"
import type { CardSuggestion } from "@/types"
import { cn, getCardStyle } from "@/lib/utils"

interface SuggestionCardProps {
  card: CardSuggestion
  onKeep: () => void
  onPass: () => void
  onEdit: (instructions: string) => void
  isProcessing: boolean
}

export default function SuggestionCard({ card, onKeep, onPass, onEdit, isProcessing }: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editInstructions, setEditInstructions] = useState("")
  const [showHint, setShowHint] = useState(false)

  const handleEdit = () => {
    if (editInstructions.trim()) {
      onEdit(editInstructions.trim())
    }
  }

  const handleCancelEdit = () => {
    setEditInstructions("")
    setIsEditing(false)
  }

  useEffect(() => {
    if (!isProcessing && isEditing) {
      setIsEditing(false)
      setEditInstructions("")
    }
  }, [isProcessing, isEditing])

  return (
    <Card className={cn("border-4 transition-all duration-300 flex flex-col", getCardStyle(card.category, card.color))}>
      <CardContent className="p-6 relative overflow-hidden flex-grow flex flex-col">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 text-4xl">{card.icon}</div>
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="font-sans text-sm bg-white/90 px-3 py-1 rounded-full">{card.category}</span>
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
          </div>

          <div className="mt-auto space-y-3">
            {isEditing ? (
              <>
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
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Apply Edit
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isProcessing}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={onKeep}
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
                <Button
                  onClick={onPass}
                  disabled={isProcessing}
                  variant="outline"
                  className="bg-white/80 hover:bg-white"
                >
                  Pass
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
