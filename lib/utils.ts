import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categoryStyles: { [key: string]: string } = {
  "Act It Out": "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
  "Face Off": "bg-gradient-to-br from-orange-100 to-red-200 border-orange-400",
  "Finders Sharers": "bg-gradient-to-br from-emerald-100 to-teal-200 border-emerald-400",
  "Funny Face": "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
  "Just Do It": "bg-gradient-to-br from-indigo-100 to-purple-200 border-indigo-400",
  "Move It": "bg-gradient-to-br from-green-100 to-lime-200 border-green-400",
  "Say/Sing": "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
  Teamwork: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
  "Think Fast": "bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-400",
}

const fallbackColorStyles: { [key: string]: string } = {
  red: "bg-red-200 border-red-400",
  blue: "bg-blue-200 border-blue-400",
  green: "bg-green-200 border-green-400",
  yellow: "bg-yellow-200 border-yellow-400",
  purple: "bg-purple-200 border-purple-400",
  orange: "bg-orange-200 border-orange-400",
}

export function getCardStyle(category: string, fallbackColor: string) {
  return categoryStyles[category] || fallbackColorStyles[fallbackColor] || "bg-gray-200 border-gray-400"
}
