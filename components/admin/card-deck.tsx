"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles } from "lucide-react"
import SuggestionCard from "./suggestion-card"
import { generateCardsAction, saveCardAction, editCardAction } from "@/app/admin/actions"
import type { ChallengeCard } from "@/types"

export default function CardDeck() {
  const [suggestions, setSuggestions] = useState<Omit<ChallengeCard, "id" | "created_at">[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [theme, setTheme] = useState("")
  const [error, setError] = useState<string | null>(null)

  const generateCards = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateCardsAction(theme.trim() || undefined)
      if (result.success) {
        setSuggestions(result.cards)
      } else {
        setError(result.error || "Failed to generate cards")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeep = async (card: Omit<ChallengeCard, "id" | "created_at">) => {
    setIsProcessing(true)
    try {
      const result = await saveCardAction(card)
      if (result.success) {
        setSuggestions((prev) => prev.filter((c) => c !== card))
      } else {
        setError(result.error || "Failed to save card")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePass = (card: Omit<ChallengeCard, "id" | "created_at">) => {
    setSuggestions((prev) => prev.filter((c) => c !== card))
  }

  const handleEdit = async (card: Omit<ChallengeCard, "id" | "created_at">, instructions: string) => {
    setIsProcessing(true)
    try {
      // Create a temporary card with an ID for the edit action
      const tempCard: ChallengeCard = {
        ...card,
        id: 0, // Temporary ID
        created_at: new Date().toISOString(),
      }

      const result = await editCardAction(tempCard, instructions)
      if (result.success) {
        // Replace the card in suggestions with the edited version
        setSuggestions((prev) =>
          prev.map((c) =>
            c === card
              ? {
                  category: result.card.category,
                  challenge: result.card.challenge,
                  color: result.card.color,
                  icon: result.card.icon,
                  hint: result.card.hint,
                  timer: result.card.timer,
                }
              : c,
          ),
        )
      } else {
        setError(result.error || "Failed to edit card")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Optional theme (e.g., 'holiday party', 'office team building')"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={generateCards}
          disabled={isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Cards...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Cards
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Review Suggestions ({suggestions.length} remaining)</h3>
          {suggestions.map((card, index) => (
            <SuggestionCard
              key={index}
              card={card}
              onKeep={handleKeep}
              onPass={() => handlePass(card)}
              onEdit={handleEdit}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  )
}
