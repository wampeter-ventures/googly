"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import SavedCounter from "@/components/admin/saved-counter"
import { approveCardAction, generateCardsAction } from "./actions"
import type { CardSuggestion } from "@/types"
import { nanoid } from "nanoid"
import { useToast } from "@/hooks/use-toast"
import SuggestionCard from "@/components/admin/suggestion-card" // Import SuggestionCard
import CardDeck from "@/components/admin/card-deck" // Import CardDeck

export default function AdminPage() {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const { toast } = useToast()

  const handleGenerateCards = async () => {
    setIsGenerating(true)
    const res = await generateCardsAction(customPrompt)
    if (res.success && res.cards) {
      setSuggestions(res.cards.map((c) => ({ ...c, id: nanoid() })))
    } else {
      toast({ title: res.error, variant: "destructive" })
    }
    setIsGenerating(false)
  }

  const handleSaveCard = async (card: CardSuggestion) => {
    const res = await approveCardAction(card)
    if (res.success) {
      setSavedCount((prev) => prev + 1)
      setSuggestions((prev) => prev.filter((s) => s.id !== card.id))
      toast({ title: "Card saved!", className: "bg-green-100" })
    } else {
      toast({ title: res.error, variant: "destructive" })
    }
  }

  const handlePassCard = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleReplaceCard = (id: string, newCardData: Omit<CardSuggestion, "id">) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, ...newCardData }
        }
        return s
      }),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Challenge Card Admin</h1>
          <p className="text-gray-600">Generate, review, and manage challenge cards</p>
        </div>

        <div className="mb-6">
          <SavedCounter count={savedCount} />
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Generate New Cards</h2>
            <p className="text-gray-500">Add a theme or topic to guide the AI, or leave it blank for random ideas.</p>
            <div className="flex justify-center">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  placeholder="e.g., 'Summer vacation'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <Button onClick={handleGenerateCards} disabled={isGenerating}>
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Review Suggestions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((card) => (
                <SuggestionCard
                  key={card.id}
                  card={card}
                  onPass={() => handlePassCard(card.id)}
                  onKeep={() => handleSaveCard(card)}
                  replaceCard={handleReplaceCard}
                />
              ))}
            </div>
            <div className="text-center">
              <Button onClick={() => setSuggestions([])} disabled={isGenerating}>
                Done for now
              </Button>
            </div>
          </div>
        )}

        <CardDeck suggestions={suggestions} setSuggestions={setSuggestions} />
      </div>
    </div>
  )
}
