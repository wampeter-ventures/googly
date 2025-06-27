"use client"

import { useState, useTransition, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { approveCardAction, categoryMap, generateCardsAction } from "@/app/admin/actions"
import type { CardSuggestion } from "@/types"
import SuggestionCard from "./suggestion-card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function CardDeck({
  initialCards,
  customPrompt,
  onSave,
}: {
  initialCards: CardSuggestion[]
  customPrompt: string
  onSave: () => void
}) {
  const [cards, setCards] = useState(initialCards)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isSaving, startSavingTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    const fetchMoreCards = async () => {
      setIsFetchingMore(true)
      const res = await generateCardsAction(customPrompt)
      if (res.success && res.cards) {
        const newCardsWithIds = res.cards.map((card) => ({
          ...card,
          id: crypto.randomUUID(),
        }))
        setCards((prev) => [...prev, ...newCardsWithIds])
      }
      setIsFetchingMore(false)
    }

    if (cards.length < 10 && !isFetchingMore) {
      fetchMoreCards()
    }
  }, [cards.length, isFetchingMore, customPrompt])

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const handlePass = (id: string) => {
    removeCard(id)
  }

  const handleKeep = (cardToKeep: CardSuggestion) => {
    startSavingTransition(async () => {
      const res = await approveCardAction(cardToKeep)
      if (res.success) {
        onSave()
        removeCard(cardToKeep.id)
        toast({ title: "Card saved!", className: "bg-green-100" })
      } else {
        toast({ title: res.error, variant: "destructive" })
      }
    })
  }

  const replaceCard = (id: string, newCardData: Omit<CardSuggestion, "id" | "color" | "icon">) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const { color, icon } = categoryMap[newCardData.category]
          return { ...c, ...newCardData, color, icon }
        }
        return c
      }),
    )
  }

  const visibleCards = cards.slice(0, 2).reverse()

  return (
    <div className="relative w-full max-w-md h-96 flex items-center justify-center">
      <AnimatePresence>
        {visibleCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="absolute w-full"
            initial={{
              scale: 1 - (visibleCards.length - 1 - index) * 0.05,
              y: (visibleCards.length - 1 - index) * -10,
            }}
            animate={{ scale: 1 - index * 0.05, y: index * -10 }}
            exit={{ scale: 0.8, y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SuggestionCard
              card={card}
              onKeep={() => handleKeep(card)}
              onPass={() => handlePass(card.id)}
              replaceCard={replaceCard}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {cards.length === 0 && !isFetchingMore && (
        <div className="text-center text-gray-500">
          <p className="font-bold text-lg">All done!</p>
          <p className="text-sm">Generate a new batch to continue.</p>
        </div>
      )}
      {isFetchingMore && cards.length < 2 && (
        <div className="text-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p>Fetching more cards...</p>
        </div>
      )}
    </div>
  )
}
