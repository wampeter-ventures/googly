"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ChallengeCard } from "@/types"

const CATEGORIES = [
  {
    name: "Face Off",
    color: "bg-gradient-to-br from-orange-100 to-red-200 border-orange-400",
    icon: "⚔️",
    description: "Competitive challenges where players go head-to-head",
  },
  {
    name: "Think Fast",
    color: "bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-400",
    icon: "⚡",
    description: "Quick thinking challenges, often with time pressure",
  },
  {
    name: "Teamwork",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
    description: "Collaborative challenges that require working together",
  },
  {
    name: "Just Do It",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🎯",
    description: "Action-oriented challenges that require doing something",
  },
  {
    name: "Get Creative",
    color: "bg-gradient-to-br from-purple-100 to-pink-200 border-purple-400",
    icon: "🎨",
    description: "Creative and artistic challenges",
  },
  {
    name: "Be Silly",
    color: "bg-gradient-to-br from-pink-100 to-rose-200 border-pink-400",
    icon: "🤪",
    description: "Fun, silly, and lighthearted challenges",
  },
]

function validateAndParseCard(cardData: any): Omit<ChallengeCard, "id" | "created_at"> | null {
  try {
    // Handle both direct object and string responses
    let parsed = cardData
    if (typeof cardData === "string") {
      // Try to extract JSON from string response
      const jsonMatch = cardData.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        console.error("No valid JSON found in string response")
        return null
      }
    }

    // Validate required fields
    if (!parsed || typeof parsed !== "object") {
      console.error("Invalid card data structure:", parsed)
      return null
    }

    const { category, challenge, color, icon, hint, timer } = parsed

    // Check required fields
    if (!category || !challenge || !color || !icon) {
      console.error("Missing required fields:", { category, challenge, color, icon })
      return null
    }

    // Validate category exists
    const validCategory = CATEGORIES.find((cat) => cat.name === category)
    if (!validCategory) {
      console.error("Invalid category:", category)
      return null
    }

    // Validate timer if present
    let validTimer = null
    if (timer !== undefined && timer !== null) {
      const timerNum = Number.parseInt(timer)
      if (!isNaN(timerNum) && timerNum > 0 && timerNum <= 300) {
        validTimer = timerNum
      }
    }

    return {
      category: validCategory.name,
      challenge: String(challenge).trim(),
      color: validCategory.color,
      icon: validCategory.icon,
      hint: hint ? String(hint).trim() : null,
      timer: validTimer,
    }
  } catch (error) {
    console.error("Error parsing card data:", error)
    return null
  }
}

export async function generateCardsAction(theme?: string) {
  try {
    const themePrompt = theme ? `Theme: ${theme}\n\n` : ""

    const prompt = `${themePrompt}Generate 5 unique challenge cards for a family party game. Each card should be a JSON object with these exact fields:

{
  "category": "one of: Face Off, Think Fast, Teamwork, Just Do It, Get Creative, Be Silly",
  "challenge": "the challenge text (be specific and clear)",
  "hint": "optional helpful hint or null",
  "timer": "number of seconds for timed challenges or null"
}

IMPORTANT TIMER GUIDELINES:
- "Think Fast" challenges should usually have a timer (10-60 seconds)
- "Just Do It" challenges with time pressure should have a timer (15-120 seconds)
- "Face Off" challenges typically don't need timers (they end when someone can't continue)
- "Teamwork" challenges may have timers for coordination tasks
- "Get Creative" and "Be Silly" challenges rarely need timers unless specifically time-based

Examples:
{"category": "Think Fast", "challenge": "Name 5 animals that start with the letter B", "hint": "Think of pets, farm animals, and wild animals", "timer": 30}
{"category": "Just Do It", "challenge": "Stare into someone's eyes without blinking or laughing for 30 seconds", "hint": "Pick someone you're comfortable with", "timer": 30}
{"category": "Face Off", "challenge": "Go around naming different pizza toppings until someone can't think of one", "hint": null, "timer": null}

Return exactly 5 JSON objects, one per line, no additional text or formatting.`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.8,
    })

    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    const cards: Omit<ChallengeCard, "id" | "created_at">[] = []

    for (const line of lines) {
      try {
        const cardData = JSON.parse(line.trim())
        const validCard = validateAndParseCard(cardData)
        if (validCard) {
          cards.push(validCard)
        }
      } catch (error) {
        console.error("Error parsing line:", line, error)
        continue
      }
    }

    if (cards.length === 0) {
      throw new Error("No valid cards could be generated")
    }

    return { success: true, cards }
  } catch (error) {
    console.error("Error generating cards:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate cards",
    }
  }
}

export async function saveCardAction(card: Omit<ChallengeCard, "id" | "created_at">) {
  try {
    const validCard = validateAndParseCard(card)
    if (!validCard) {
      throw new Error("Invalid card data")
    }

    const { data, error } = await supabaseAdmin.from("challenge_cards").insert([validCard]).select().single()

    if (error) throw error

    return { success: true, card: data }
  } catch (error) {
    console.error("Error saving card:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save card",
    }
  }
}

// --- NEW: keep for legacy imports ---------------------------------
export async function approveCardAction(card: Omit<ChallengeCard, "id" | "created_at">) {
  // Re-use the validated insert logic from saveCardAction
  return await saveCardAction(card)
}
// -------------------------------------------------------------------

export async function editCardAction(originalCard: ChallengeCard, editInstructions: string) {
  try {
    const prompt = `Edit this challenge card based on the instructions:

Original card:
Category: ${originalCard.category}
Challenge: ${originalCard.challenge}
Hint: ${originalCard.hint || "none"}
Timer: ${originalCard.timer || "none"}

Edit instructions: ${editInstructions}

IMPORTANT TIMER GUIDELINES:
- "Think Fast" challenges should usually have a timer (10-60 seconds)
- "Just Do It" challenges with time pressure should have a timer (15-120 seconds)
- "Face Off" challenges typically don't need timers (they end when someone can't continue)
- "Teamwork" challenges may have timers for coordination tasks
- "Get Creative" and "Be Silly" challenges rarely need timers unless specifically time-based

Return the edited card as a single JSON object with these exact fields:
{
  "category": "one of: Face Off, Think Fast, Teamwork, Just Do It, Get Creative, Be Silly",
  "challenge": "the updated challenge text",
  "hint": "updated hint or null",
  "timer": "number of seconds or null"
}

Return only the JSON object, no additional text.`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    })

    let cardData
    try {
      cardData = JSON.parse(text.trim())
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cardData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse AI response as JSON")
      }
    }

    const validCard = validateAndParseCard(cardData)
    if (!validCard) {
      throw new Error("AI generated invalid card data")
    }

    const { data, error } = await supabaseAdmin
      .from("challenge_cards")
      .update(validCard)
      .eq("id", originalCard.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, card: data }
  } catch (error) {
    console.error("Error editing card:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit card",
    }
  }
}

export async function getCardCountAction() {
  try {
    const { count, error } = await supabaseAdmin.from("challenge_cards").select("*", { count: "exact", head: true })

    if (error) throw error

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Error getting card count:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get card count",
    }
  }
}
