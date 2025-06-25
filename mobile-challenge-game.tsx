"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

const challengeCards = [
  // Teamwork Cards
  {
    category: "Teamwork",
    challenge: "Create a secret handshake with the person next to you.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Make up a two-person animal with sounds and movement.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Make up a 10-second dance with a partner.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Build a human pyramid with two other players.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Build a tower using only your bodies (no hands!).",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Make a bridge with your arms and walk under it together.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Invent a handshake that includes a spin and a jump.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },

  // Move It Cards
  {
    category: "Move It",
    challenge: "Hop across the room with a book on your head.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Waddle like a penguin across the room.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Do 5 somersaults in a row (or pretend if space is tight).",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Walk backwards from one end of the room to the other.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Crab walk from one side of the room to the other.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Crawl like a baby and bark like a dog.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Spin around five times and try to walk in a straight line.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Balance a spoon on your nose for 10 seconds.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },

  // Say/Sing Cards
  {
    category: "Say/Sing",
    challenge: "Tell a joke in a pirate voice.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Say a tongue twister three times fast.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Say your name backward three times.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Say a silly sentence with as many 's' words as you can.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Make up a cheer for your family team.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Sing the ABCs like a robot.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },

  // Think Fast Cards
  {
    category: "Think Fast",
    challenge: "Say 3 things you do before going to bed.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 5 foods that are red.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 5 animals that live in the ocean.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Say the alphabet backwards in under 30 seconds.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 4 things you can eat but don't like.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },

  // Act It Out Cards
  {
    category: "Act It Out",
    challenge: "Act like a balloon slowly deflating.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Act like a giant waking up from a nap.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're being chased by bees.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're sneaking through a haunted house.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Act like a monkey until someone guesses it.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're a chef cooking something delicious.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend to be a superhero saving the day.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Act like you're walking on the moon.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're a sloth trying to catch a bus.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🦥",
  },
  {
    category: "Act It Out",
    challenge: "Act like you're a cat stuck in a cardboard box.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "📦",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're a dinosaur trying to use a smartphone.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🦕",
  },
  {
    category: "Act It Out",
    challenge: "Act like you're a ninja trying to be sneaky but keep tripping.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🥷",
  },

  // Funny Face Cards
  {
    category: "Funny Face",
    challenge: "Pretend to sneeze 5 different ways.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Try to cross your eyes and wiggle your ears (or try!).",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Try to make someone laugh with just your eyes.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Pretend you're chewing the world's stickiest gum.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Make the silliest face you can.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Puff up your cheeks and hold it for 10 seconds.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
]

type GameState = "menu" | "playing" | "ranking" | "cardRain" | "awards" | "finalRecap" | "stats"
type RankingCategory = "surprising" | "funny" | "delightful"

interface TurnResult {
  card: (typeof challengeCards)[0]
  rankings: {
    surprising: number
    funny: number
    delightful: number
  }
}

interface FallingCard {
  id: number
  card: (typeof challengeCards)[0]
  x: number
  y: number
  rotation: number
  speed: number
}

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  scale: number
}

interface Firework {
  id: number
  x: number
  y: number
  particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    color: string
    life: number
  }>
}

interface Stats {
  totalSurprising: number
  totalFunny: number
  totalDelightful: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string
  gamesPlayed: number
}

const rankingEmojis = {
  surprising: ["😐", "🤔", "😲", "🤯", "🫨"],
  funny: ["😐", "😏", "😆", "😭", "😂"],
  delightful: ["😶", "🙂", "😊", "😄", "🦄"],
}

const rankingLabels = {
  surprising: ["Unexpected", "Um wow", "OMG", "Mind blown!", "Unbelievable!"],
  funny: ["Heh", "Haha", "LOL", "Crying", "Can't breathe"],
  delightful: ["Aww", "Sweet", "Splendid", "Heart melting", "Pure joy!"],
}

const curators = [
  "Dan from Spain",
  "Sarah from Tokyo",
  "Mike from Brooklyn",
  "Luna from Berlin",
  "Alex from Sydney",
  "Emma from London",
  "Carlos from Mexico City",
  "Zoe from Amsterdam",
]

const awardEmojis = {
  surprising: ["🤯", "😲", "🫨", "😱", "🤪", "🙃", "🤭"],
  funny: ["😂", "🤣", "😆", "😹", "🤪", "🤭", "😜"],
  delightful: ["🥰", "😍", "💖", "🌟", "🦋", "🌈", "✨"],
}

export default function Component() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [currentTurn, setCurrentTurn] = useState(1)
  const [shuffledCards, setShuffledCards] = useState<typeof challengeCards>([])
  const [currentCards, setCurrentCards] = useState<typeof challengeCards>([])
  const [selectedCard, setSelectedCard] = useState<(typeof challengeCards)[0] | null>(null)
  const [turnResults, setTurnResults] = useState<TurnResult[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [currentRankings, setCurrentRankings] = useState({
    surprising: 0,
    funny: 0,
    delightful: 0,
  })
  const [currentAward, setCurrentAward] = useState<RankingCategory | null>(null)
  const [fallingCards, setFallingCards] = useState<FallingCard[]>([])
  const [currentCurator] = useState(curators[Math.floor(Math.random() * curators.length)])
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [awardWinners, setAwardWinners] = useState<{ [key in RankingCategory]: TurnResult } | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalSurprising: 0,
    totalFunny: 0,
    totalDelightful: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: "",
    gamesPlayed: 0,
  })
  const [videoError, setVideoError] = useState(false)

  // Load stats from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem("googly-game-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  // Save stats to localStorage
  const saveStats = (newStats: Stats) => {
    setStats(newStats)
    localStorage.setItem("googly-game-stats", JSON.stringify(newStats))
  }

  // Update stats when game completes
  const updateStats = (results: TurnResult[]) => {
    const today = new Date().toDateString()
    const totalSurprising = results.reduce((sum, result) => sum + result.rankings.surprising, 0)
    const totalFunny = results.reduce((sum, result) => sum + result.rankings.funny, 0)
    const totalDelightful = results.reduce((sum, result) => sum + result.rankings.delightful, 0)

    let newCurrentStreak = stats.currentStreak
    let newMaxStreak = stats.maxStreak

    // Check if played yesterday or today
    const lastPlayed = new Date(stats.lastPlayedDate)
    const todayDate = new Date(today)
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)

    if (stats.lastPlayedDate === today) {
      // Already played today, don't update streak
    } else if (stats.lastPlayedDate === yesterday.toDateString() || stats.lastPlayedDate === "") {
      // Played yesterday or first time, continue/start streak
      newCurrentStreak += 1
      newMaxStreak = Math.max(newMaxStreak, newCurrentStreak)
    } else {
      // Missed a day, reset streak
      newCurrentStreak = 1
    }

    const newStats: Stats = {
      totalSurprising: stats.totalSurprising + totalSurprising,
      totalFunny: stats.totalFunny + totalFunny,
      totalDelightful: stats.totalDelightful + totalDelightful,
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      lastPlayedDate: today,
      gamesPlayed: stats.gamesPlayed + 1,
    }

    saveStats(newStats)
  }

  const startNewGame = () => {
    const shuffled = [...challengeCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentTurn(1)
    setTurnResults([])
    setSelectedCard(null)
    setCurrentRankings({ surprising: 0, funny: 0, delightful: 0 })
    setAwardWinners(null)
    setGameState("playing")
    dealCards(shuffled)
  }

  const dealCards = (deck: typeof challengeCards) => {
    setIsShuffling(true)
    setTimeout(() => {
      const cards = deck.slice((currentTurn - 1) * 2, currentTurn * 2)
      setCurrentCards(cards)
      setIsShuffling(false)
    }, 1500)
  }

  const selectCard = (card: (typeof challengeCards)[0]) => {
    setSelectedCard(card)
  }

  const nextTurn = () => {
    if (selectedCard) {
      setGameState("ranking")
    }
  }

  const submitRankings = () => {
    if (selectedCard) {
      const newResult: TurnResult = {
        card: selectedCard,
        rankings: currentRankings,
      }
      const newResults = [...turnResults, newResult]
      setTurnResults(newResults)

      if (currentTurn >= 8) {
        // Update stats before finishing
        updateStats(newResults)
        // Start card rain animation
        setGameState("cardRain")
        startCardRain(newResults)
      } else {
        setCurrentTurn(currentTurn + 1)
        setSelectedCard(null)
        setCurrentRankings({ surprising: 0, funny: 0, delightful: 0 })
        setGameState("playing")
        dealCards(shuffledCards)
      }
    }
  }

  const startCardRain = (results: TurnResult[]) => {
    const cards: FallingCard[] = results.map((result, index) => ({
      id: index,
      card: result.card,
      x: Math.random() * window.innerWidth,
      y: -100,
      rotation: Math.random() * 360,
      speed: 2 + Math.random() * 3,
    }))
    setFallingCards(cards)

    const animateCards = () => {
      setFallingCards((prev) =>
        prev.map((card) => ({
          ...card,
          y: card.y + card.speed,
          rotation: card.rotation + 2,
        })),
      )
    }

    const interval = setInterval(animateCards, 50)

    setTimeout(() => {
      clearInterval(interval)
      const winners = calculateAwardWinners(results)
      setAwardWinners(winners)
      setGameState("awards")
      setCurrentAward("surprising")
    }, 3000)
  }

  const nextAward = () => {
    if (currentAward === "surprising") {
      setCurrentAward("funny")
    } else if (currentAward === "funny") {
      setCurrentAward("delightful")
    } else {
      setGameState("finalRecap")
    }
  }

  const calculateAwardWinners = (results: TurnResult[]) => {
    const winners: { [key in RankingCategory]: TurnResult } = {
      surprising: results[0],
      funny: results[0],
      delightful: results[0],
    }

    const usedCards = new Set<string>()
    const categories: RankingCategory[] = ["surprising", "funny", "delightful"]

    categories.forEach((category) => {
      const availableResults = results.filter((result) => !usedCards.has(result.card.challenge))

      if (availableResults.length > 0) {
        const maxScore = Math.max(...availableResults.map((result) => result.rankings[category]))
        const tiedResults = availableResults.filter((result) => result.rankings[category] === maxScore)

        let winner: TurnResult

        if (tiedResults.length === 1) {
          winner = tiedResults[0]
        } else {
          const otherCategories = categories.filter((cat) => cat !== category) as RankingCategory[]
          const tieBreakers = tiedResults.map((result) => ({
            result,
            tieBreakScore: otherCategories.reduce((sum, cat) => sum + result.rankings[cat], 0),
          }))

          const maxTieBreakScore = Math.max(...tieBreakers.map((tb) => tb.tieBreakScore))
          const finalTiedResults = tieBreakers.filter((tb) => tb.tieBreakScore === maxTieBreakScore)

          winner = finalTiedResults[0].result
        }

        winners[category] = winner
        usedCards.add(winner.card.challenge)
      }
    })

    return winners
  }

  const getAwardWinner = (category: RankingCategory) => {
    return awardWinners?.[category] || turnResults[0]
  }

  // Animation effects for awards
  useEffect(() => {
    if (gameState === "awards" && currentAward) {
      const createFloatingEmojis = () => {
        const emojis = awardEmojis[currentAward]
        const newEmojis: FloatingEmoji[] = Array.from({ length: 15 }, (_, i) => ({
          id: i,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + Math.random() * 200,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 1,
        }))
        setFloatingEmojis(newEmojis)
      }

      const createFirework = () => {
        const newFirework: Firework = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight * 0.6),
          particles: Array.from({ length: 8 }, () => ({
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][Math.floor(Math.random() * 6)],
            life: 1,
          })),
        }
        setFireworks((prev) => [...prev, newFirework])
      }

      createFloatingEmojis()
      createFirework()

      const emojiInterval = setInterval(() => {
        setFloatingEmojis((prev) =>
          prev
            .map((emoji) => ({
              ...emoji,
              x: emoji.x + emoji.vx,
              y: emoji.y + emoji.vy,
              rotation: emoji.rotation + 2,
            }))
            .filter((emoji) => emoji.y > -100),
        )
      }, 50)

      const fireworkInterval = setInterval(() => {
        setFireworks((prev) =>
          prev
            .map((firework) => ({
              ...firework,
              particles: firework.particles
                .map((particle) => ({
                  ...particle,
                  x: particle.x + particle.vx,
                  y: particle.y + particle.vy,
                  vy: particle.vy + 0.2,
                  life: particle.life - 0.02,
                }))
                .filter((particle) => particle.life > 0),
            }))
            .filter((firework) => firework.particles.length > 0),
        )
      }, 50)

      const fireworkCreator = setInterval(createFirework, 1000)

      return () => {
        clearInterval(emojiInterval)
        clearInterval(fireworkInterval)
        clearInterval(fireworkCreator)
      }
    }
  }, [gameState, currentAward])

  const ShufflingAnimation = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <div className="w-20 h-28 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg animate-spin"></div>
        <div className="absolute top-2 left-2 w-16 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg animate-pulse"></div>
      </div>
      <div className="text-2xl font-bold text-gray-800 animate-bounce">🎴 Shuffling cards!</div>
      <div className="text-sm text-gray-600 animate-pulse">Preparing your next challenge...</div>
    </div>
  )

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-[320px] bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Animated Logo Video with fallback */}
              <div className="w-full max-w-[200px] mx-auto">
                {!videoError ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                    style={{ maxHeight: "120px" }}
                    onError={() => setVideoError(true)}
                  >
                    <source src="/googly-logo.mp4" type="video/mp4" />
                    <source src="/googly-logo.webm" type="video/webm" />
                    <source src="/googly-logo.mov" type="video/quicktime" />
                    {/* Fallback content */}
                    <div className="text-3xl font-bold text-black font-jua whitespace-nowrap">The Googly Game</div>
                  </video>
                ) : (
                  /* Fallback when video fails to load */
                  <div className="w-full flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 mx-auto bg-black rounded-lg flex items-center justify-center mb-4">
                      <div className="grid grid-cols-3 gap-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-sm"></div>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-black font-jua whitespace-nowrap">The Googly Game</h1>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-lg">
                Don't overthink it
                <br />
                Just do the thing!
              </p>

              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-pulse blur-md"></div>
                <Button
                  onClick={startNewGame}
                  className="relative w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-4 rounded-full"
                >
                  Play
                </Button>
              </div>

              <Button
                onClick={() => setGameState("stats")}
                className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium text-lg py-4 rounded-full flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Statistics
              </Button>

              <div className="text-sm text-gray-500 space-y-1">
                <div>June 25, 2025</div>
                <div>No. 1467</div>
                <div>
                  Curated by Dan from{" "}
                  <a
                    href="https://maps.google.com/?q=Begur,Spain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:underline"
                  >
                    Begur
                  </a>
                </div>
                <div>
                  <button
                    onClick={() => alert("Coming soon! Create your own custom deck of challenges.")}
                    className="text-slate-600 hover:underline cursor-pointer"
                  >
                    Create Your Own
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "stats") {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">Statistics</h1>
            <p className="text-gray-600">Your Googly Game journey</p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Games Played */}
            <Card className="bg-white border-2 border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-black">{stats.gamesPlayed}</div>
                <div className="text-sm text-gray-600">Played</div>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-2 border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-black">{stats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-black">{stats.maxStreak}</div>
                  <div className="text-sm text-gray-600">Max Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Point Totals */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black text-center">Total Points</h3>

              <Card className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🤯</div>
                    <div>
                      <div className="font-semibold text-gray-900">Surprise</div>
                      <div className="text-sm text-gray-600">All-time total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalSurprising}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">😂</div>
                    <div>
                      <div className="font-semibold text-gray-900">Fun</div>
                      <div className="text-sm text-gray-600">All-time total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalFunny}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-pink-100 to-pink-200 border-2 border-pink-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🥰</div>
                    <div>
                      <div className="font-semibold text-gray-900">Delight</div>
                      <div className="text-sm text-gray-600">All-time total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalDelightful}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Button
            onClick={() => setGameState("menu")}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-4 rounded-full"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "playing") {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 pt-4">
            <h2 className="text-2xl font-bold text-black mb-2">Round {currentTurn} of 8</h2>
            <p className="text-gray-600">Pick your challenge!</p>
          </div>

          {isShuffling ? (
            <ShufflingAnimation />
          ) : (
            <div className="space-y-4 mb-6">
              {currentCards.map((card, index) => (
                <Card
                  key={index}
                  className={`${card.color} border-2 cursor-pointer transform transition-all duration-300 ${
                    selectedCard === card ? "scale-105 ring-4 ring-black shadow-2xl" : "hover:scale-102 shadow-lg"
                  }`}
                  onClick={() => selectCard(card)}
                >
                  <CardContent className="p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 text-4xl">{card.icon}</div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{card.icon}</span>
                        <span className="font-semibold text-sm bg-white/90 px-2 py-1 rounded-full">
                          {card.category}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 leading-tight">{card.challenge}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedCard && !isShuffling && (
            <div className="text-center space-y-2">
              <Button
                onClick={nextTurn}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-3 rounded-full"
              >
                I did the thing!
              </Button>
              <p className="text-gray-500 text-sm">(pass to the next player)</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === "ranking") {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto">
          {selectedCard && (
            <div className="mb-4 mx-4 mt-8">
              <Card className="bg-white border-2 border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{selectedCard.icon}</div>
                  <div className="font-semibold text-sm text-gray-600 mb-1">{selectedCard.category}</div>
                  <p className="font-medium text-gray-900 text-sm">{selectedCard.challenge}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-3 px-4">
            {(Object.keys(rankingEmojis) as RankingCategory[]).map((category) => (
              <div key={category} className="bg-white rounded-xl p-4 shadow-sm border flex-1">
                <h3 className="text-black font-semibold mb-3 text-center text-sm flex items-center justify-center gap-2">
                  {category === "surprising" && <span>Surprising</span>}
                  {category === "funny" && <span>Funny</span>}
                  {category === "delightful" && <span>Delightful</span>}
                </h3>

                <div className="flex gap-1 h-20">
                  {rankingEmojis[category].map((emoji, index) => {
                    const isSelected = currentRankings[category] === index + 1
                    const colors = ["#ff6b6b", "#ffa726", "#ffca28", "#66bb6a", "#42a5f5"]
                    const borderColors = ["#d32f2f", "#e65100", "#f57f17", "#388e3c", "#1976d2"]

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          setCurrentRankings({
                            ...currentRankings,
                            [category]: index + 1,
                          })
                        }
                        className={`relative bg-white border-2 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-1 overflow-hidden min-w-0 p-1 z-10 ${
                          isSelected
                            ? "flex-[2.5] transform -translate-y-0.5 shadow-lg"
                            : "flex-1 opacity-70 hover:bg-gray-50 hover:-translate-y-0.5"
                        }`}
                        style={{
                          borderColor: isSelected ? colors[index] : "#e9ecef",
                          color: isSelected ? colors[index] : "inherit",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-1 transition-all duration-200"
                          style={{
                            backgroundColor: borderColors[index],
                            height: isSelected ? "100%" : "3px",
                            opacity: isSelected ? 0.1 : 1,
                          }}
                        />

                        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white/95 rounded-full flex items-center justify-center border border-black/10">
                          <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
                        </div>

                        <div className="text-lg">{emoji}</div>

                        <div
                          className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center leading-tight transition-all duration-300 w-full px-1 ${
                            isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                          }`}
                        >
                          {rankingLabels[category][index]}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 px-4">
            <Button
              onClick={submitRankings}
              disabled={!currentRankings.surprising || !currentRankings.funny || !currentRankings.delightful}
              className={`w-full font-medium text-lg py-3 rounded-full transition-all duration-200 ${
                !currentRankings.surprising || !currentRankings.funny || !currentRankings.delightful
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              {currentTurn >= 8 ? "We Did The Things!" : "Next Turn"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "cardRain") {
    return (
      <div className="min-h-screen bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-4">Game complete!</h2>
            <p className="text-gray-600">Calculating the results...</p>
          </div>
        </div>

        {fallingCards.map((fallingCard) => (
          <div
            key={fallingCard.id}
            className="absolute w-16 h-20 pointer-events-none"
            style={{
              left: fallingCard.x,
              top: fallingCard.y,
              transform: `rotate(${fallingCard.rotation}deg)`,
            }}
          >
            <Card className={`${fallingCard.card.color} border-2 w-full h-full`}>
              <CardContent className="p-1 flex items-center justify-center">
                <div className="text-lg">{fallingCard.card.icon}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  if (gameState === "awards" && currentAward && awardWinners) {
    const winner = getAwardWinner(currentAward)

    const awardStyles = {
      surprising: {
        bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
        accent: "border-yellow-300",
        title: "Most Surprising!",
        emoji: "🤯",
      },
      funny: {
        bg: "bg-gradient-to-br from-red-500 to-pink-600",
        accent: "border-red-300",
        title: "Most Funny!",
        emoji: "😂",
      },
      delightful: {
        bg: "bg-gradient-to-br from-pink-400 to-purple-500",
        accent: "border-pink-300",
        title: "Most Delightful!",
        emoji: "🥰",
      },
    }

    const style = awardStyles[currentAward]

    return (
      <div
        className={`min-h-screen ${style.bg} p-4 flex flex-col items-center justify-center relative overflow-hidden`}
      >
        {floatingEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute pointer-events-none text-4xl"
            style={{
              left: emoji.x,
              top: emoji.y,
              transform: `rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
              opacity: 0.8,
            }}
          >
            {emoji.emoji}
          </div>
        ))}

        {fireworks.map((firework) =>
          firework.particles.map((particle, index) => (
            <div
              key={`${firework.id}-${index}`}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{
                left: firework.x + particle.x,
                top: firework.y + particle.y,
                backgroundColor: particle.color,
                opacity: particle.life,
              }}
            />
          )),
        )}

        <div className="text-center space-y-6 max-w-sm relative z-50">
          <div className="text-8xl animate-bounce">{style.emoji}</div>

          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">{style.title}</h2>

          <Card className={`${winner.card.color} border-4 ${style.accent} shadow-2xl transform scale-105`}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{winner.card.icon}</div>
              <div className="font-semibold text-lg mb-2">{winner.card.category}</div>
              <p className="font-medium text-gray-900">{winner.card.challenge}</p>
              <div className="mt-4 text-2xl">{rankingEmojis[currentAward][winner.rankings[currentAward] - 1]}</div>
            </CardContent>
          </Card>

          <Button
            onClick={nextAward}
            className="bg-white text-black font-semibold text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
            {currentAward === "delightful" ? "Final results!" : "Next award!"}
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "finalRecap" && awardWinners) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto text-center space-y-6 pt-8">
          <h1 className="text-3xl font-bold text-black">Hall of Fame</h1>
          <p className="text-gray-600">Your legendary moments</p>

          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-2 border-yellow-400">
              <CardContent className="p-4">
                <div className="text-2xl mb-2 font-semibold">🤯 Most Surprising</div>
                <div className="font-medium text-sm">{awardWinners.surprising.card.challenge}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-200 to-red-300 border-2 border-red-400">
              <CardContent className="p-4">
                <div className="text-2xl mb-2 font-semibold">😂 Most Funny</div>
                <div className="font-medium text-sm">{awardWinners.funny.card.challenge}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-200 to-pink-300 border-2 border-pink-400">
              <CardContent className="p-4">
                <div className="text-2xl mb-2 font-semibold">🥰 Most Delightful</div>
                <div className="font-medium text-sm">{awardWinners.delightful.card.challenge}</div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-6">
            <Button
              onClick={() => setGameState("menu")}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-4 rounded-full"
            >
              Play Again?
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
