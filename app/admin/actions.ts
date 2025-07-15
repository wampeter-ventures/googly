"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabaseAdmin, supabase } from "@/lib/supabase-admin"
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

const MODES = {
  eating_together: "Can be done while sitting at a dinner table. Minimal physical movement.",
  at_home: "Suitable for a living room or general indoor space. Some movement is okay.",
  outside: "Best done outdoors. Might require space, make a mess, or be loud.",
}

/**
 * Extracts a JSON object from a string, handling various edge cases and malformed responses.
 */
function extractJson(text: string): any {
  // Remove any markdown code block markers
  const cleanText = text.replace(/```json\s*|\s*```/g, "").trim()

  // Find the first opening brace or bracket
  const openBrace = cleanText.indexOf("{")
  const openBracket = cleanText.indexOf("[")

  let start = -1
  let isArray = false

  if (openBrace === -1 && openBracket === -1) {
    throw new Error("No JSON found in response")
  }

  if (openBrace === -1) {
    start = openBracket
    isArray = true
  } else if (openBracket === -1) {
    start = openBrace
    isArray = false
  } else {
    start = Math.min(openBrace, openBracket)
    isArray = start === openBracket
  }

  // Find the matching closing brace/bracket
  let depth = 0
  let inString = false
  let escaped = false
  let end = -1

  const targetOpen = isArray ? "[" : "{"
  const targetClose = isArray ? "]" : "}"

  for (let i = start; i < cleanText.length; i++) {
    const char = cleanText[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === "\\" && inString) {
      escaped = true
      continue
    }

    if (char === '"' && !escaped) {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === targetOpen) {
        depth++
      } else if (char === targetClose) {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
  }

  if (end === -1) {
    throw new Error("No matching closing bracket/brace found")
  }

  const jsonStr = cleanText.substring(start, end + 1)
  return JSON.parse(jsonStr)
}

export async function generateCardsAction() {
  try {
    // Fetch existing cards to avoid duplicates and understand the vibe
    const { data: existingCards, error: fetchError } = await supabase
      .from("challenge_cards")
      .select("challenge")
      .order("created_at", { ascending: false })
      .limit(200)

    if (fetchError) {
      console.error("Error fetching existing cards:", fetchError)
      return { success: false, error: "Failed to fetch existing cards" }
    }

    const existingChallenges = existingCards?.map((card) => card.challenge) || []
    const existingChallengesText =
      existingChallenges.length > 0
        ? `\n\nEXISTING CHALLENGES TO AVOID DUPLICATING:\n${existingChallenges.map((c) => `- "${c}"`).join("\n")}`
        : ""

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      temperature: 0.7,
      prompt: `Generate 5 **inventive, delightful, and playfully challenging** cards for a family party game.

Return a single JSON array of 5 card objects. Each challenge should feel fresh, funny, and memorable—like a moment you'd want to tell someone about later.

Each card should aim for one or more of these qualities:
- 💡 **Clever**: includes a surprising twist, constraint, or wordplay
- 😂 **Silly**: makes people laugh or feel delightfully weird
- 🤝 **Social**: involves interaction with others or copying/mirroring
- 🎭 **Active**: involves faces, hands, bodies, or voices (but not complex setup)
- 🧠 **Doable**: works within 1 minute, with no special tools

Avoid generic list-style prompts (e.g., "Name 5 things"). Think improv, Taskmaster, and recess energy.

Examples of Great Challenges:
"Pretend you're a piece of toast popping out of a toaster." (silly, body-based)
"Try to clap in sync 10 times with a partner." (social, rhythmic)
"Give a high-five to everyone at the table without using your hands." (surprising constraint)
"Sing 'Happy Birthday' to the tune of Twinkle Twinkle." (cognitive twist)
"Point to things in the room that start with the same letter until someone guesses it." (mystery + environment use)

Each card object should have:
{
  "challenge": "The challenge text",
  "category": "One of: Creative, Physical, Social, Teamwork, Face Off, Mental, Silly",
  "icon": "Single emoji that represents the challenge",
  "color": "One of: bg-red-100, bg-blue-100, bg-green-100, bg-yellow-100, bg-purple-100, bg-pink-100, bg-indigo-100, bg-orange-100",
  "hint": "Optional helpful hint (can be null)",
  "timer": "Optional timer in seconds for time-based challenges (can be null)",
  "modes": ["eating_together", "at_home", "outside"]
}

For modes, START with all three modes and only EXCLUDE a mode if there's a specific reason:
- EXCLUDE "eating_together" only if: requires big body movements, loud noises, or messy actions inappropriate for a restaurant
- EXCLUDE "at_home" only if: requires outdoor space, weather, or natural elements
- EXCLUDE "outside" only if: requires indoor furniture, kitchen items, or privacy

Most challenges should include ALL THREE modes unless there's a clear incompatibility.

Return ONLY the JSON array, no other text.${existingChallengesText}`,
    })

    console.log("AI Response:", text)

    const cards = extractJson(text)

    if (!Array.isArray(cards) || cards.length === 0) {
      return { success: false, error: "AI did not return a valid array of cards" }
    }

    // Insert cards into database
    const { data, error } = await supabase.from("challenge_cards").insert(cards).select()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Failed to save cards to database" }
    }

    return { success: true, cards: data }
  } catch (error) {
    console.error("Error in generateCardsAction:", error)
    return { success: false, error: "Failed to generate cards" }
  }
}

export async function saveCardAction(card: Omit<ChallengeCard, "id" | "created_at">) {
  try {
    const { challenge, category, icon, color, hint, timer, modes } = card

    if (!challenge || !category || !icon || !color) throw new Error("Invalid card data provided.")

    const { data, error } = await supabaseAdmin.from("challenge_cards").insert([card]).select().single()
    if (error) throw error

    return { success: true, card: data }
  } catch (error) {
    console.error("Error in saveCardAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save card" }
  }
}

export async function editCardAction(originalCard: ChallengeCard, editInstructions: string) {
  try {
    const prompt = `Edit this challenge card based on the instructions.

Original Card:
${JSON.stringify(originalCard, null, 2)}

Edit Instructions:
${editInstructions}

**Mode Assignment Rules:**
- **DEFAULT**: Include ALL three modes ["eating_together", "at_home", "outside"] unless there's a specific reason to exclude one.
- **eating_together**: EXCLUDE only if the challenge requires big body movements, loud noises, or messy actions inappropriate for a restaurant.
- **at_home**: EXCLUDE only if it requires outdoor space, weather, or natural elements.
- **outside**: EXCLUDE only if it requires indoor furniture, kitchen items, or privacy.

Return the completely updated card as a single JSON object. The schema must include "category", "challenge", "hint", "timer", and "modes".
Use these mode keys: ${Object.keys(MODES).join(", ")}.
Return only the JSON object.`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt,
      temperature: 0.7,
    })

    const validCard = JSON.parse(text)
    if (!validCard || typeof validCard !== "object") throw new Error("AI generated invalid card data.")

    const { data, error } = await supabaseAdmin
      .from("challenge_cards")
      .update(validCard)
      .eq("id", originalCard.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, card: data }
  } catch (error) {
    console.error("Error in editCardAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to edit card" }
  }
}

export async function getUncategorizedCardCountAction() {
  try {
    const { count, error } = await supabaseAdmin
      .from("challenge_cards")
      .select("*", { count: "exact", head: true })
      .or("modes.is.null,modes.eq.{}")

    if (error) throw error
    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Error in getUncategorizedCardCountAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get count" }
  }
}

export async function backfillCardModesAction() {
  try {
    // Get cards without modes
    const { data: cards, error: fetchError } = await supabase
      .from("challenge_cards")
      .select("*")
      .or("modes.is.null,modes.eq.{}")
      .limit(10)

    if (fetchError) {
      console.error("Error fetching cards:", fetchError)
      return { success: false, error: "Failed to fetch cards" }
    }

    if (!cards || cards.length === 0) {
      return { success: true, message: "No cards need mode assignment" }
    }

    const cardsForAI = cards.map((card) => ({
      id: card.id,
      challenge: card.challenge,
      category: card.category,
    }))

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      temperature: 0.3,
      prompt: `You are categorizing challenge cards for a family party game into modes.

For each card, START with all three modes: ["eating_together", "at_home", "outside"]

Only EXCLUDE a mode if there's a specific reason:
- EXCLUDE "eating_together" only if: requires big body movements, loud noises, or messy actions inappropriate for a restaurant
- EXCLUDE "at_home" only if: requires outdoor space, weather, or natural elements  
- EXCLUDE "outside" only if: requires indoor furniture, kitchen items, or privacy

Most challenges should include ALL THREE modes unless there's a clear incompatibility.

Cards to categorize:
${cardsForAI.map((card) => `ID ${card.id}: "${card.challenge}" (${card.category})`).join("\n")}

Return ONLY a JSON array of objects with id and modes:
[
  {"id": 1, "modes": ["eating_together", "at_home", "outside"]},
  {"id": 2, "modes": ["at_home", "outside"]}
]

Examples:
- "Dance like a robot" → ["at_home", "outside"] (exclude eating_together: big movements)
- "Whisper a secret" → ["eating_together", "at_home"] (exclude outside: privacy needed)
- "Make a funny face" → ["eating_together", "at_home", "outside"] (works everywhere)
- "Find something blue" → ["eating_together", "at_home", "outside"] (works everywhere)

Return ONLY the JSON array.`,
    })

    console.log("AI Response for backfill:", text)

    const updates = extractJson(text)

    if (!Array.isArray(updates)) {
      return { success: false, error: "AI did not return valid JSON for mode backfill." }
    }

    // Update each card
    let updatedCount = 0
    for (const update of updates) {
      if (update.id && Array.isArray(update.modes)) {
        const { error } = await supabase.from("challenge_cards").update({ modes: update.modes }).eq("id", update.id)

        if (!error) {
          updatedCount++
        }
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} cards with mode assignments`,
    }
  } catch (error) {
    console.error("Error in backfillCardModesAction:", error)
    return { success: false, error: "AI did not return valid JSON for mode backfill." }
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

export async function deleteCardAction(id: number) {
  try {
    const { error } = await supabase.from("challenge_cards").delete().eq("id", id)

    if (error) {
      return { success: false, error: "Failed to delete card" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting card:", error)
    return { success: false, error: "Failed to delete card" }
  }
}

export async function updateCardAction(id: number, updates: any) {
  try {
    const { error } = await supabase.from("challenge_cards").update(updates).eq("id", id)

    if (error) {
      return { success: false, error: "Failed to update card" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating card:", error)
    return { success: false, error: "Failed to update card" }
  }
}

// Legacy action for compatibility
export async function approveCardAction(card: Omit<ChallengeCard, "id" | "created_at">) {
  return await saveCardAction(card)
}
