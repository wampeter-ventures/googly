"use client"

import { useState, useTransition } from "react"
import { generateCardsAction } from "./actions"
import type { CardSuggestion } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import CardDeck from "@/components/admin/card-deck"
import SavedCounter from "@/components/admin/saved-counter"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [cards, setCards] = useState<CardSuggestion[]>([])
  const [customPrompt, setCustomPrompt] = useState("")
  const [savedCount, setSavedCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const runGeneration = () => {
    startTransition(async () => {
      const res = await generateCardsAction(customPrompt)
      if (res.success && res.cards) {
        const cardsWithIds = res.cards.map((card) => ({
          ...card,
          id: crypto.randomUUID(),
        }))
        setCards(cardsWithIds)
        setSavedCount(0) // Reset counter for new batch
        toast({ title: `Generated ${cardsWithIds.length} new card suggestions!` })
      } else {
        toast({ title: res.error, variant: "destructive" })
      }
    })
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Card Generator</h1>
        <p className="text-gray-600">Generate, review, and approve new challenge cards.</p>
      </div>

      {cards.length > 0 ? (
        <CardDeck initialCards={cards} customPrompt={customPrompt} onSave={() => setSavedCount((c) => c + 1)} />
      ) : (
        <div className="w-full max-w-md space-y-2">
          <Input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Optional: add a theme (e.g., 'about animals')"
            disabled={isPending}
          />
          <Button onClick={runGeneration} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate New Cards"
            )}
          </Button>
        </div>
      )}

      {savedCount > 0 && <SavedCounter count={savedCount} />}
    </div>
  )
}
