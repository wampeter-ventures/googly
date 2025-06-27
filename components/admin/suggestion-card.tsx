"use client"

import { useState, useTransition } from "react"
import { editCardAction } from "@/app/admin/actions"
import type { CardSuggestion } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SuggestionCardProps {
  card: CardSuggestion
  onKeep: () => void
  onPass: () => void
  replaceCard: (id: string, newCardData: Omit<CardSuggestion, "id" | "color" | "icon">) => void
}

export default function SuggestionCard({ card, onKeep, onPass, replaceCard }: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleEdit = () => {
    if (!feedback.trim()) {
      setIsEditing(false)
      return
    }
    startTransition(async () => {
      const res = await editCardAction(card, feedback)
      if (res.success && res.card) {
        replaceCard(card.id, res.card)
        toast({ title: "Card updated with your feedback!" })
      } else {
        toast({ title: res.error, variant: "destructive" })
      }
      setIsEditing(false)
      setFeedback("")
    })
  }

  return (
    <div className={`relative border-4 ${card.color} bg-white p-6 rounded-2xl shadow-lg flex flex-col h-80`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-gray-700">{card.category}</span>
          <span className="text-3xl">{card.icon}</span>
        </div>
        <p className="text-lg font-semibold text-gray-800">{card.challenge}</p>
        {card.hint && <p className="text-sm text-gray-500 mt-2">Hint: {card.hint}</p>}
      </div>

      {isEditing && (
        <div className="absolute bottom-16 left-6 right-6 flex items-center space-x-2">
          <Input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., 'make it shorter'"
            autoFocus
          />
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="ghost" size="sm" onClick={onPass}>
          Pass
        </Button>

        {isEditing ? (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            ✨ Edit
          </Button>
        )}

        <Button size="sm" onClick={onKeep}>
          Keep
        </Button>
      </div>
    </div>
  )
}
