"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CardSuggestion, Category } from "@/types"

/* ------------------------------------------------------------------ */
/*  1. Helpers & Schemas                                              */
/* ------------------------------------------------------------------ */
const cardSchema = z.object({
  category: z.enum([
    "Face Off",
    "Think Fast",
    "Teamwork",
    "Finders Sharers",
    "Just Do It",
    "Move It",
    "Say/Sing",
    "Act It Out",
    "Funny Face",
  ]),
  challenge: z.string().min(8).max(220),
  hint: z.string().nullable().optional(),
  timer: z.number().int().min(5).max(180).nullable().optional(),
})

const cleanJson = (txt: string) =>
  txt
    .replace(/[“”]/g, '"')
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/(\r\n|\n|\r)/g, " ")
    .trim()

function coerceTimer(val: unknown) {
  if (typeof val === "number") return val
  if (typeof val === "string") {
    const n = Number.parseInt(val, 10)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function normalise(obj: any) {
  const challenge = obj.challenge ?? obj.text ?? obj.description ?? obj.title ?? obj.prompt ?? ""

  return {
    category: obj.category,
    challenge: typeof challenge === "string" ? challenge.trim() : "",
    hint: obj.hint ?? null,
    timer: coerceTimer(obj.timer),
  }
}

/* ------------------------------------------------------------------ */
/*  2. Category → UI mapping                                          */
/* ------------------------------------------------------------------ */
export const categoryMap: Record<Category, { color: string; icon: string }> = {
  "Face Off": { color: "border-orange-400", icon: "⚔️" },
  "Think Fast": { color: "border-amber-400", icon: "⚡" },
  Teamwork: { color: "border-blue-400", icon: "🤝" },
  "Finders Sharers": { color: "border-emerald-400", icon: "🔍" },
  "Just Do It": { color: "border-indigo-400", icon: "✨" },
  "Move It": { color: "border-green-400", icon: "🏃" },
  "Say/Sing": { color: "border-purple-400", icon: "🎤" },
  "Act It Out": { color: "border-red-400", icon: "🎭" },
  "Funny Face": { color: "border-yellow-400", icon: "😜" },
}

/* ------------------------------------------------------------------ */
/*  3. Prompts                                                        */
/* ------------------------------------------------------------------ */
const CORE_RULES = `
• Family-friendly • 10-60 s turns (solo / pair / group)
• No long planning, simple props or none
• Fun, specific wording
• Category must be one of: ${Object.keys(categoryMap).join(", ")}
• IMPORTANT: Only add a 'hint' for challenges that are creative or might be difficult to start, like those in 'Say/Sing' or 'Act It Out'. Most cards should NOT have a hint.
`

const BULK_SYS = `You are a party-game designer. Return ONLY valid JSON.\n${CORE_RULES}`
const SINGLE_SYS = `Revise ONE card. Return ONLY valid JSON.\n${CORE_RULES}`

/* ------------------------------------------------------------------ */
/*  4. Bulk generator (≈40 cards)                                     */
/* ------------------------------------------------------------------ */
export async function generateCardsAction(extraPrompt = "") {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { text } = await generateText({
        model: groq("llama3-70b-8192"),
        system: BULK_SYS + (extraPrompt ? `\n• Extra user note: ${extraPrompt}` : ""),
        prompt: 'Return JSON like {"cards":[{category,challenge,hint?,timer?},...]} with ~40 unique cards.',
        temperature: 0.85,
      })

      const json = JSON.parse(cleanJson(text.slice(text.indexOf("{"))))
      const raw: any[] = json.cards ?? json.Cards ?? []
      const valid: z.infer<typeof cardSchema>[] = []

      for (const r of raw) {
        const parsed = cardSchema.safeParse(normalise(r))
        if (parsed.success) valid.push(parsed.data)
      }
      if (valid.length === 0) throw new Error("no valid cards")

      const cards = valid.map((c) => ({
        ...c,
        hint: c.hint ?? null,
        timer: c.timer ?? null,
        ...categoryMap[c.category as Category],
      }))

      return { success: true, cards }
    } catch {
      /* retry */
    }
  }
  return { success: false, error: "AI returned unusable data – try again." }
}

/* ------------------------------------------------------------------ */
/*  5. Single-card edit                                               */
/* ------------------------------------------------------------------ */
export async function editCardAction(card: Omit<CardSuggestion, "id">, feedback: string) {
  try {
    const { text } = await generateText({
      model: groq("llama3-8b-8192"),
      system: SINGLE_SYS,
      prompt: `Original:\n${JSON.stringify({
        category: card.category,
        challenge: card.challenge,
        hint: card.hint,
        timer: card.timer,
      })}\nFeedback: "${feedback}"`,
      temperature: 0.7,
    })

    const revised = cardSchema.parse(normalise(JSON.parse(cleanJson(text.slice(text.indexOf("{"))))))
    const newCard = { ...revised, ...categoryMap[revised.category as Category] }
    return { success: true, card: newCard }
  } catch (e) {
    console.error("editCardAction error", e)
    return { success: false, error: "AI edit failed." }
  }
}

/* ------------------------------------------------------------------ */
/*  6. Insert to DB                                                   */
/* ------------------------------------------------------------------ */
export async function approveCardAction(card: Omit<CardSuggestion, "id">) {
  const { error } = await supabaseAdmin.from("challenge_cards").insert([
    {
      category: card.category,
      challenge: card.challenge,
      color: card.color,
      icon: card.icon,
      hint: card.hint,
      timer: card.timer,
    },
  ])
  return error ? { success: false, error: error.message } : { success: true }
}
