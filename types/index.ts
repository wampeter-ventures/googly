export type Category =
  | "Face Off"
  | "Think Fast"
  | "Teamwork"
  | "Finders Sharers"
  | "Just Do It"
  | "Move It"
  | "Say/Sing"
  | "Act It Out"
  | "Funny Face"

export interface ChallengeCard {
  id: number
  category: string
  challenge: string
  color: string
  icon: string
  hint: string | null
  timer: number | null
  created_at: string
  modes: string[]
}

export interface CardSuggestion {
  id: string // Client-side unique ID
  category: Category
  challenge: string
  color: string
  icon: string
  hint: string | null
  timer: number | null
  modes: string[]
}
