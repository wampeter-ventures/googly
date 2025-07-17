"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import SuggestionCard from "./suggestion-card"
import SavedCounter from "./saved-counter"
import { generateCardsAction, saveCardAction, editCardAction } from "@/app/admin/actions"
import type { CardSuggestion } from "@/types"

export default function CardDeck() {
  const [prompt, setPrompt] = useState("")
  const [cards, setCards] = useState<CardSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingCardIndex, setProcessingCardIndex] = useState<number | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const result = await generateCardsAction(prompt)
      if (result.success) {
        setCards(result.cards)
      } else {
        console.error("Error generating cards:", result.error)
      }
    } catch (error) {
      console.error("Error generating cards:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeep = async (card: CardSuggestion, index: number) => {
    setProcessingCardIndex(index)
    try {
      // Create a clean card object without React references
      const cleanCard = {
        challenge: card.challenge,
        category: card.category,
        icon: card.icon,
        color: card.color,
        timer: card.timer,
        hint: card.hint,
        modes: card.modes,
      }

      await saveCardAction(cleanCard)
      setSavedCount((prev) => prev + 1)

      // Remove the card from the list
      setCards((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error saving card:", error)
    } finally {
      setProcessingCardIndex(null)
    }
  }

  const handlePass = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEdit = async (card: CardSuggestion, instructions: string, index: number) => {
    setProcessingCardIndex(index)
    try {
      const result = await editCardAction(card, instructions)
      if (result.success && result.card) {
        setCards((prev) => prev.map((c, i) => (i === index ? result.card : c)))
      } else {
        console.error("Error editing card:", result.error)
      }
    } catch (error) {
      console.error("Error editing card:", error)
    } finally {
      setProcessingCardIndex(null)
    }
  }

  return (
    <div className="space-y-6">
      <SavedCounter count={savedCount} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Challenge Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Describe the type of challenges you want to create:
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g., 'Christmas themed challenges for families' or 'outdoor summer activities' or 'silly challenges for kids'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Cards...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 10 Cards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {cards.length > 0 && (
        <div className="space-y-4">
          {cards.map((card, index) => (
            <SuggestionCard
              key={index}
              card={card}
              onKeep={() => handleKeep(card, index)}
              onPass={() => handlePass(index)}
              onEdit={(instructions) => handleEdit(card, instructions, index)}
              isProcessing={processingCardIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
