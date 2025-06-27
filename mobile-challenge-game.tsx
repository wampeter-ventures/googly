"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, HelpCircle, Loader2 } from "lucide-react"
import GooglyEyesAnimation from "@/components/googly-eyes-animation"
import CountdownTimer from "@/components/countdown-timer"
import { supabase } from "@/lib/supabase"
import type { ChallengeCard } from "@/types"

// Simple video caching for PWA compatibility
const videoCache = new Map<string, string>()

const cacheVideo = async (url: string): Promise<string> => {
  if (videoCache.has(url)) {
    return videoCache.get(url)!
  }

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    videoCache.set(url, objectUrl)
    return objectUrl
  } catch (error) {
    console.warn("Failed to cache video:", error)
    return url
  }
}

type GameState = "menu" | "playing" | "ranking" | "finalRecap" | "stats"

interface TurnResult {
  card: ChallengeCard
  score: number
  emoji: string
}

interface Rating {
  emoji: string
  score: number
}

interface Stats {
  totalScore: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string
  gamesPlayed: number
}

// Fisher-Yates Shuffle Algorithm
function fisherYatesShuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const allRatings: Rating[] = [
  { emoji: "😐", score: 5 },
  { emoji: "🤔", score: 15 },
  { emoji: "🙂", score: 25 },
  { emoji: "😊", score: 35 },
  { emoji: "😄", score: 45 },
  { emoji: "😏", score: 50 },
  { emoji: "😅", score: 58 },
  { emoji: "😆", score: 65 },
  { emoji: "😂", score: 72 },
  { emoji: "🤣", score: 78 },
  { emoji: "😮", score: 82 },
  { emoji: "😲", score: 86 },
  { emoji: "🤯", score: 90 },
  { emoji: "🤩", score: 94 },
  { emoji: "🥳", score: 97 },
  { emoji: "💖", score: 98 },
  { emoji: "✨", score: 99 },
  { emoji: "🌟", score: 99 },
  { emoji: "🎉", score: 99 },
  { emoji: "🦄", score: 100 },
]

const ratingsForDisplay: Rating[] = []
const numColsForRatingGrid = 5
const numRowsForRatingGrid = Math.ceil(allRatings.length / numColsForRatingGrid)

for (let i = numRowsForRatingGrid - 1; i >= 0; i--) {
  const rowStartIndex = i * numColsForRatingGrid
  const rowEndIndex = Math.min(rowStartIndex + numColsForRatingGrid, allRatings.length)
  const rowEmojis = allRatings.slice(rowStartIndex, rowEndIndex)
  ratingsForDisplay.push(...rowEmojis)
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

export default function Component() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [allCards, setAllCards] = useState<ChallengeCard[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [currentTurn, setCurrentTurn] = useState(1)
  const [shuffledCards, setShuffledCards] = useState<ChallengeCard[]>([])
  const [currentCards, setCurrentCards] = useState<ChallengeCard[]>([])
  const [selectedCard, setSelectedCard] = useState<ChallengeCard | null>(null)
  const [turnResults, setTurnResults] = useState<TurnResult[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [currentCurator] = useState(curators[Math.floor(Math.random() * curators.length)])
  const [stats, setStats] = useState<Stats>({
    totalScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: "",
    gamesPlayed: 0,
  })
  const [videoError, setVideoError] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [revealedCards, setRevealedCards] = useState<TurnResult[]>([])
  const [cachedShuffleUrl, setCachedShuffleUrl] = useState<string>("")
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownComplete, setCountdownComplete] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoadingCards(true)
      const { data, error } = await supabase.from("challenge_cards").select("*")
      if (error) {
        console.error("Error fetching cards:", error)
        // Handle error appropriately in a real app
      } else {
        setAllCards(data)
      }
      setIsLoadingCards(false)
    }

    fetchCards()

    const savedStats = localStorage.getItem("googly-game-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }

    const cacheShuffleVideo = async () => {
      try {
        const cachedUrl = await cacheVideo("/shuffle.mp4")
        setCachedShuffleUrl(cachedUrl)
      } catch (error) {
        console.warn("Failed to cache shuffle video:", error)
        setCachedShuffleUrl("/shuffle.mp4")
      }
    }
    cacheShuffleVideo()
  }, [])

  const saveStats = (newStats: Stats) => {
    setStats(newStats)
    localStorage.setItem("googly-game-stats", JSON.stringify(newStats))
  }

  const updateStats = (results: TurnResult[]) => {
    const today = new Date().toDateString()
    const totalScore = results.reduce((sum, result) => sum + result.score, 0)

    let newCurrentStreak = stats.currentStreak
    let newMaxStreak = stats.maxStreak

    const lastPlayed = new Date(stats.lastPlayedDate)
    const todayDate = new Date(today)
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)

    if (stats.lastPlayedDate === today) {
      // No streak update
    } else if (stats.lastPlayedDate === yesterday.toDateString() || stats.lastPlayedDate === "") {
      newCurrentStreak += 1
      newMaxStreak = Math.max(newMaxStreak, newCurrentStreak)
    } else {
      newCurrentStreak = 1
    }

    const newStats: Stats = {
      totalScore: stats.totalScore + totalScore,
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      lastPlayedDate: today,
      gamesPlayed: stats.gamesPlayed + 1,
    }
    saveStats(newStats)
  }

  const startNewGame = () => {
    if (isLoadingCards || allCards.length === 0) return
    const shuffled = fisherYatesShuffle(allCards)
    setShuffledCards(shuffled)
    setCurrentTurn(1)
    setTurnResults([])
    setSelectedCard(null)
    setSelectedRating(null)
    setShowHint(false)
    setRevealedCards([])
    setCountdownComplete(false)
    setIsCountingDown(false)
    setGameState("playing")
    dealCards(shuffled, 1)
  }

  const dealCards = (deck: ChallengeCard[], turn: number) => {
    setIsShuffling(true)
    setTimeout(() => {
      const cards = deck.slice((turn - 1) * 2, turn * 2)
      setCurrentCards(cards)
      setIsShuffling(false)
    }, 5000)
  }

  const selectCard = (card: ChallengeCard) => {
    setSelectedCard(card)
    setShowHint(false)
    setCountdownComplete(false)
    setIsCountingDown(false)
  }

  const nextTurn = () => {
    if (selectedCard) {
      setGameState("ranking")
    }
  }

  const submitRankings = () => {
    if (selectedCard && selectedRating) {
      const newResult: TurnResult = {
        card: selectedCard,
        score: selectedRating.score,
        emoji: selectedRating.emoji,
      }
      const newResults = [...turnResults, newResult]
      setTurnResults(newResults)

      if (currentTurn >= 8) {
        updateStats(newResults)
        const sortedResults = [...newResults].sort((a, b) => a.score - b.score)
        setTurnResults(sortedResults)
        setGameState("finalRecap")
      } else {
        const nextTurnNumber = currentTurn + 1
        setCurrentTurn(nextTurnNumber)
        setSelectedCard(null)
        setSelectedRating(null)
        setShowHint(false)
        setCountdownComplete(false)
        setIsCountingDown(false)
        setGameState("playing")
        dealCards(shuffledCards, nextTurnNumber)
      }
    }
  }

  useEffect(() => {
    if (gameState === "finalRecap" && revealedCards.length < turnResults.length) {
      const timer = setTimeout(() => {
        setRevealedCards((prev) => [...prev, turnResults[prev.length]])
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [gameState, revealedCards, turnResults])

  const ShufflingAnimation = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-[80vw] max-w-md h-auto flex items-center justify-center">
        <video autoPlay loop muted playsInline className="w-full h-auto object-contain" poster="/shuffle-fallback.png">
          <source src={cachedShuffleUrl || "/shuffle.mp4"} type="video/mp4" />
        </video>
      </div>
      <div className="text-2xl font-bold text-gray-800 animate-bounce">🎴 Shuffling cards!</div>
      <div className="text-sm text-gray-600 animate-pulse">Preparing your next challenge...</div>
    </div>
  )

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-[#F7F2E8] flex flex-col items-center justify-center p-4">
        <Card
          className="w-full max-w-none mx-4 bg-white shadow-lg border-0"
          style={{ minHeight: "calc(100vh - 2rem)" }}
        >
          <CardContent
            className="p-8 flex flex-col justify-center items-center h-full"
            style={{ minHeight: "calc(100vh - 4rem)" }}
          >
            <div className="text-center space-y-8 w-full max-w-sm">
              <div className="w-full max-w-[240px] mx-auto">
                {videoError ? (
                  <img src="/googly-game-logo.png" alt="The Googly Game" className="w-full max-w-[240px] h-auto" />
                ) : (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                    style={{ maxHeight: "140px" }}
                    poster="/googly-game-logo.png"
                    onError={() => setVideoError(true)}
                  >
                    <source src="/googly-logo.mp4" type="video/mp4" />
                  </video>
                )}
              </div>
              <p className="text-gray-600 text-xl leading-relaxed">
                Don't overthink it
                <br />
                Just do the thing!
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-pulse blur-md"></div>
                  <Button
                    onClick={startNewGame}
                    disabled={isLoadingCards}
                    className="relative w-full bg-black hover:bg-gray-800 text-white font-medium text-xl py-6 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoadingCards ? <Loader2 className="w-6 h-6 animate-spin" /> : "Play"}
                  </Button>
                </div>
                <Button
                  onClick={() => setGameState("stats")}
                  className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium text-xl py-6 rounded-full flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-6 h-6" /> Statistics
                </Button>
              </div>
              <div className="text-base text-gray-500 space-y-2 pt-4">
                <div>June 26, 2025</div>
                <div>No. 1468</div>
                <div>Curated by {currentCurator}</div>
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
      <div className="min-h-screen bg-[#F7F2E8] p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">Statistics</h1>
            <p className="text-gray-600">Your Googly Game journey</p>
          </div>
          <div className="space-y-4 mb-8">
            <Card className="bg-white border-2 border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-black">{stats.gamesPlayed}</div>
                <div className="text-sm text-gray-600">Played</div>
              </CardContent>
            </Card>
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
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black text-center">Total Points</h3>
              <Card className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-semibold text-gray-900">Total Score</div>
                      <div className="text-sm text-gray-600">All-time total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalScore}</div>
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
    const showStartButton = selectedCard?.timer && !countdownComplete && !isCountingDown
    const showNextTurnButton = selectedCard && (!selectedCard.timer || countdownComplete)

    return (
      <div className="min-h-screen bg-[#F7F2E8] p-4 flex flex-col justify-center">
        {isCountingDown && selectedCard?.timer && (
          <CountdownTimer
            duration={selectedCard.timer}
            onComplete={() => {
              setIsCountingDown(false)
              setCountdownComplete(true)
            }}
          />
        )}
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">Round {currentTurn} of 8</h2>
            <p className="text-gray-600">Pick your challenge!</p>
          </div>
          {isShuffling ? (
            <div className="mt-12">
              <ShufflingAnimation />
            </div>
          ) : (
            <div className="space-y-6 mb-6">
              {currentCards.map((card) => (
                <Card
                  key={card.id}
                  className={`${card.color} border-2 cursor-pointer transform transition-all duration-300 min-h-[200px] flex flex-col justify-center ${
                    selectedCard?.id === card.id
                      ? "scale-105 ring-4 ring-black shadow-2xl"
                      : "hover:scale-102 shadow-lg"
                  }`}
                  onClick={() => selectCard(card)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
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
                      <p className="text-lg font-medium text-gray-900 leading-tight">{card.challenge}</p>
                      {selectedCard?.id === card.id && card.hint && (
                        <>
                          {!showHint && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full text-xs py-1 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowHint(true)
                              }}
                            >
                              <HelpCircle className="w-3 h-3 mr-1" /> Show Hint
                            </Button>
                          )}
                          {showHint && (
                            <div className="mt-3 text-xs text-gray-800 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                              <p className="font-semibold mb-1 text-yellow-700">Hint:</p>
                              <p>{card.hint}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center space-y-2 mt-auto pb-4">
            {showStartButton && (
              <Button
                onClick={() => setIsCountingDown(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-lg py-3 rounded-full"
              >
                Start!
              </Button>
            )}
            {showNextTurnButton && (
              <>
                <Button
                  onClick={nextTurn}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-3 rounded-full"
                >
                  {selectedCard?.category === "Teamwork" || selectedCard?.category === "Face Off"
                    ? "We did the thing!"
                    : "I did the thing!"}
                </Button>
                <p className="text-gray-500 text-sm">(pass to the next player)</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "ranking") {
    return (
      <div className="min-h-screen bg-[#F7F2E8] p-4 flex flex-col">
        <div className="text-center my-4">
          <h2 className="text-2xl font-bold text-black">How was it?</h2>
        </div>
        <div className="flex-grow grid grid-cols-5 gap-2 content-center">
          {ratingsForDisplay.map((rating) => (
            <button
              key={rating.emoji}
              onClick={() => setSelectedRating(rating)}
              className={`relative aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 transform ${
                selectedRating?.emoji === rating.emoji
                  ? "bg-white/80 scale-110 shadow-2xl ring-4 ring-yellow-400"
                  : "bg-white/40 hover:scale-105 hover:shadow-lg"
              }`}
            >
              <span className="text-4xl md:text-5xl">{rating.emoji}</span>
              {selectedRating?.emoji === rating.emoji && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute text-yellow-400 text-2xl animate-ping"
                      style={{
                        top: `${50 + 40 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                        left: `${50 + 40 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      ✨
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto py-4">
          {selectedRating && (
            <Button
              onClick={submitRankings}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium text-lg py-4 rounded-full animate-fade-in"
            >
              {currentTurn >= 8 ? "See Results" : "Next Turn"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState === "finalRecap") {
    return (
      <div className="min-h-screen bg-[#F7F2E8] p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <GooglyEyesAnimation />
        <h1 className="text-4xl font-bold text-black mb-8 z-10 drop-shadow-lg">Your Game!</h1>
        <div className="relative w-full h-[400px]">
          {revealedCards.map((result, index) => (
            <div
              key={result.card.id}
              className="absolute w-full transition-all duration-500 ease-out"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translateX(${index * 8 - (revealedCards.length - 1) * 4}px) translateY(${index * 8 - (revealedCards.length - 1) * 4}px) rotate(${(index - (revealedCards.length - 1) / 2) * 4}deg)`,
                zIndex: index,
              }}
            >
              <Card className={`${result.card.color} border-4 border-white shadow-2xl max-w-xs mx-auto`}>
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-2">{result.emoji}</div>
                  <p className="font-medium text-gray-800 text-sm">{result.card.challenge}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        {revealedCards.length === 8 && (
          <div className="mt-8 z-10">
            <Button
              onClick={() => setGameState("menu")}
              className="bg-black hover:bg-gray-800 text-white font-medium text-xl px-10 py-5 rounded-full animate-fade-in"
            >
              Play Again?
            </Button>
          </div>
        )}
      </div>
    )
  }

  return null
}
