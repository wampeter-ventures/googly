"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabase } from "@/lib/supabase"
import type { ChallengeCard, CardSuggestion } from "@/types"

// Helper function to extract JSON from AI response
function extractJson(text: string): any {
  // Remove any markdown code blocks
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "")

  // Find the first { or [ and last } or ]
  let start = -1
  let end = -1
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === "\\") {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === "{") {
      if (start === -1) start = i
      braceCount++
    } else if (char === "}") {
      braceCount--
      if (braceCount === 0 && bracketCount === 0 && start !== -1) {
        end = i
        break
      }
    } else if (char === "[") {
      if (start === -1) start = i
      bracketCount++
    } else if (char === "]") {
      bracketCount--
      if (braceCount === 0 && bracketCount === 0 && start !== -1) {
        end = i
        break
      }
    }
  }

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON found in response")
  }

  const jsonStr = text.slice(start, end + 1)
  return JSON.parse(jsonStr)
}

export async function generateCardsAction(theme?: string) {
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

    const themePrompt = theme
      ? `The user has provided a specific theme for this batch: "${theme}". All challenges should strongly reflect this theme.`
      : "The user has not provided a specific theme, so create a variety of general, all-purpose family challenges."

    const summaryText = `\n\nFINAL REMINDER: Your main goal is to generate 5 new, unique, and delightful challenges. Use the list of existing challenges for inspiration and to avoid duplicates. ${themePrompt} Remember to use the specific categories I provided and only add hints or timers when they genuinely improve the challenge.`

    const existingChallengesText =
      existingChallenges.length > 0
        ? `\n\nEXISTING CHALLENGES TO AVOID DUPLICATING:\n${existingChallenges.map((c) => `- "${c}"`).join("\n")}`
        : ""

    const prompt = `Generate 5 **inventive, delightful, and playfully challenging** cards for a family party game.

Return a single JSON array of 5 card objects. Each challenge should feel fresh, funny, and memorable—like a moment you'd want to tell someone about later.

Each card should aim for one or more of these qualities:
- 💡 **Clever**: includes a surprising twist, constraint, or wordplay
- 😂 **Silly**: makes people laugh or feel delightfully weird
- 🤝 **Social**: involves interaction with others or copying/mirroring
- 🎭 **Active**: involves faces, hands, bodies, or voices (but not complex setup)
- 🧠 **Doable**: works within 1 minute, with no special tools

Avoid generic list-style prompts (e.g., "Name 5 things"). Think improv, Taskmaster, and recess energy.

Each card object should have:
{
  "challenge": "string (the main challenge text)",
  "hint": "string | null (Optional: A helpful tip if the challenge is tricky. Many cards won't need one, but add one if it helps!)",
  "category": "string (Choose ONE from this specific list: 'Face Off', 'Teamwork', 'Think Fast', 'Finders Sharers', 'Just Do It', 'Move It', 'Say/Sing', 'Act It Out', 'Funny Face')",
  "timer": "number | null (Optional: Add a timer in seconds ONLY for challenges that are explicitly time-based, like a race or a 'how many can you do in X seconds' task. For example, a challenge like 'Stare at your partner for 5 seconds without laughing' MUST have a timer of 5.)",
  "color": "string (red, blue, green, yellow, purple, or orange - this is a fallback, the category will determine the main color)",
  "icon": "string (emoji that represents the challenge)",
  "modes": ["surprise_us", "eating_together", "at_home", "outside"] (array of applicable modes)
}

Return ONLY the JSON array, no other text.${existingChallengesText}${summaryText}`

    const result = await generateText({
      model: groq("moonshotai/kimi-k2-instruct"),
      prompt,
      temperature: 0.3,
    })

    console.log("AI Response:", result.text)

    const cards = extractJson(result.text)

    if (!Array.isArray(cards) || cards.length === 0) {
      return { success: false, error: "AI did not return a valid array of cards" }
    }

    // Validate each card has required fields
    for (const card of cards) {
      if (!card.challenge || !card.category || !card.color || !card.icon) {
        return { success: false, error: "Generated cards are missing required fields" }
      }
      // Ensure modes is an array
      if (!Array.isArray(card.modes)) {
        card.modes = ["surprise_us", "eating_together", "at_home", "outside"]
      }
    }

    return { success: true, cards }
  } catch (error) {
    console.error("Error in generateCardsAction:", error)
    return { success: false, error: "Failed to generate cards" }
  }
}

export async function approveCardAction(card: any) {
  try {
    const { error } = await supabase.from("challenge_cards").insert([
      {
        challenge: card.challenge,
        hint: card.hint,
        category: card.category,
        timer: card.timer,
        color: card.color,
        icon: card.icon,
        modes: card.modes || ["surprise_us", "eating_together", "at_home", "outside"],
      },
    ])

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: "Failed to save card to database" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in approveCardAction:", error)
    return { success: false, error: "Failed to save card" }
  }
}

export async function saveCardAction(card: Omit<ChallengeCard, "id" | "created_at">) {
  try {
    const { error } = await supabase.from("challenge_cards").insert([card])

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: "Failed to save card to database" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveCardAction:", error)
    return { success: false, error: "Failed to save card" }
  }
}

export async function editCardAction(card: Omit<CardSuggestion, "id">, instructions: string) {
  try {
    const prompt = `Edit this challenge card based on the instructions:

Original Card:
Challenge: "${card.challenge}"
Hint: "${card.hint || "None"}"
Category: ${card.category}
Timer: ${card.timer} seconds
Color: ${card.color}
Icon: ${card.icon}
Modes: ${card.modes?.join(", ") || "None"}

Instructions: ${instructions}

Return the updated card as a JSON object with the same structure. Make sure to keep the same general spirit while applying the requested changes. The category must be one of the allowed values: "Face Off", "Teamwork", "Think Fast", "Finders Sharers", "Move It", "Say/Sing", "Act It Out", "Funny Face", "Just Do It". Do not change the 'modes' array.

Return ONLY the JSON object, no other text.`

    const result = await generateText({
      model: groq("moonshotai/kimi-k2-instruct"),
      prompt,
      temperature: 0.3,
    })

    console.log("AI Edit Response:", result.text)

    const updatedCard = extractJson(result.text)

    if (!updatedCard.challenge || !updatedCard.category) {
      return { success: false, error: "AI did not return a valid updated card" }
    }

    // Ensure modes is an array and is not changed by the AI
    updatedCard.modes = card.modes

    return { success: true, card: updatedCard }
  } catch (error) {
    console.error("Error in editCardAction:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: `Failed to edit card: ${errorMessage}` }
  }
}

// -----------------------------------------------------------------------------
// Return a count of cards that still need modes assigned
// -----------------------------------------------------------------------------
export async function getUncategorizedCardCountAction() {
  try {
    const { count, error } = await supabase
      .from("challenge_cards")
      .select("*", { head: true, count: "exact" })
      .or("modes.is.null,modes.eq.{}")

    if (error) {
      console.error("Supabase count error:", error)
      return { success: false, error: "Failed to count uncategorized cards" }
    }

    return { success: true, count: count ?? 0 }
  } catch (err) {
    console.error("Error in getUncategorizedCardCountAction:", err)
    return { success: false, error: "Failed to count uncategorized cards" }
  }
}

export async function backfillCardModesAction() {
  try {
    // Get cards that don't have modes set
    const { data: cards, error: fetchError } = await supabase
      .from("challenge_cards")
      .select("*")
      .or("modes.is.null,modes.eq.{}")
      .limit(10)

    if (fetchError) {
      console.error("Error fetching cards:", fetchError)
      return { success: false, error: "Failed to fetch cards from database" }
    }

    if (!cards || cards.length === 0) {
      return { success: true, message: "No cards need mode assignment", updatedCount: 0 }
    }

    const prompt = `Analyze these challenge cards and assign appropriate game modes to each.

DEFAULT TO INCLUDING ALL MODES unless there's a specific reason to exclude:

Modes:
- "surprise_us": Include unless the challenge is too location-specific
- "eating_together": Exclude ONLY if it requires big body movements that would disrupt dining
- "at_home": Exclude ONLY if it specifically requires being outdoors  
- "outside": Exclude ONLY if it requires indoor items/furniture or quiet indoor behavior

Cards to analyze:
${cards.map((card, i) => `${i + 1}. "${card.challenge}" (Category: ${card.category})`).join("\n")}

Return a JSON array with the same number of objects, each containing:
{
  "id": ${cards[0].id}, 
  "modes": ["surprise_us", "eating_together", "at_home", "outside"]
}

Most cards should have ALL FOUR modes unless there's a clear physical or logistical incompatibility.

Return ONLY the JSON array, no other text.`

    const result = await generateText({
      model: groq("moonshotai/kimi-k2-instruct"),
      prompt,
      temperature: 0.3,
    })

    console.log("AI Backfill Response:", result.text)

    const modeAssignments = extractJson(result.text)

    if (!Array.isArray(modeAssignments) || modeAssignments.length !== cards.length) {
      return { success: false, error: "AI did not return valid mode assignments" }
    }

    // Update each card with its modes
    let updatedCount = 0
    for (const assignment of modeAssignments) {
      if (assignment.id && Array.isArray(assignment.modes)) {
        const { error: updateError } = await supabase
          .from("challenge_cards")
          .update({ modes: assignment.modes })
          .eq("id", assignment.id)

        if (updateError) {
          console.error("Error updating card:", updateError)
        } else {
          updatedCount++
        }
      }
    }

    return {
      success: true,
      message: `Successfully updated ${updatedCount} cards with mode assignments`,
      updatedCount,
    }
  } catch (error) {
    console.error("Error in backfillCardModesAction:", error)
    return { success: false, error: "AI did not return valid JSON for mode backfill." }
  }
}
