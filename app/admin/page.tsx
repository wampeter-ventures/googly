"use client"

import { useState } from "react"
import { approveCardAction, editCardAction } from "./actions"
import type { CardSuggestion } from "@/types"
import { useToast } from "@/hooks/use-toast"
import SuggestionCard from "@/components/admin/suggestion-card"
import CardDeck from "@/components/admin/card-deck"
import BackfillModes from "@/components/admin/backfill-modes"

export default function AdminPage() {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [processingCardId, setProcessingCardId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSaveCard = async (card: CardSuggestion) => {
    setProcessingCardId(card.id)
    const res = await approveCardAction(card)
    if (res.success) {
      setSavedCount((prev) => prev + 1)
      setSuggestions((prev) => prev.filter((s) => s.id !== card.id))
      toast({ title: "Card saved!", className: "bg-green-100" })
    } else {
      toast({ title: "Error saving card", description: res.error, variant: "destructive" })
    }
    setProcessingCardId(null)
  }

  const handlePassCard = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleEditCard = async (card: CardSuggestion, instructions: string) => {
    setProcessingCardId(card.id)
    const { id, ...cardData } = card
    const res = await editCardAction(cardData, instructions)

    if (res.success && res.card) {
      setSuggestions((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return { ...s, ...res.card }
          }
          return s
        }),
      )
      toast({ title: "Card updated!", className: "bg-blue-100" })
    } else {
      toast({ title: "Edit failed", description: res.error, variant: "destructive" })
    }
    setProcessingCardId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Challenge Card Admin</h1>
          <p className="text-lg text-gray-600">Generate, review, and manage challenge cards.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Database Maintenance</h2>
          <BackfillModes />
        </div>

        {suggestions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((card) => (
                <SuggestionCard
                  key={card.id}
                  card={card}
                  onPass={() => handlePassCard(card.id)}
                  onKeep={() => handleSaveCard(card)}
                  onEdit={(instructions) => handleEditCard(card, instructions)}
                  isProcessing={processingCardId === card.id}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate New Cards</h2>
          <CardDeck suggestions={suggestions} setSuggestions={setSuggestions} />
        </div>
      </div>
    </div>
  )
}
