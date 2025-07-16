"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, HelpCircle, Loader2 } from "lucide-react"
import GooglyEyesAnimation from "@/components/googly-eyes-animation"
import CountdownTimer from "@/components/countdown-timer"
import { supabase } from "@/lib/supabase"
import type { ChallengeCard } from "@/types"
import { cn } from "@/lib/utils"

const videoCache = new Map<string, string>()
const cacheVideo = async (url: string): Promise<string> => {
  if (videoCache.has(url)) return videoCache.get(url)!
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    videoCache.set(url, objectUrl)
    return objectUrl
  } catch (error) {
    console.warn(`Failed to cache video: ${url}`, error)
    return url // Return original URL as fallback
  }
}

const categoryStyles: { [key: string]: string } = {
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

const getCardStyle = (category: string, fallbackColor: string) => {
  return categoryStyles[category] || fallbackColorStyles[fallbackColor] || "bg-gray-200 border-gray-400"
}

type GameState = "menu" | "modeSelection" | "playing" | "ranking" | "finalRecap" | "stats"

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
  ratingsForDisplay.push(...allRatings.slice(rowStartIndex, rowEndIndex))
}

const videosToCache = {
  logo: "/googly-logo.mp4",
  shuffle: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_9nKP6APb1SxavvRC9rSJnLBoy4dd/4MNMtyJhrsI1navNf2zR5t/public/shuffle.mp4",
  random: "/random.mp4",
  eating: "/eating.mp4",
  home: "/home.mp4",
  outside: "/outside.mp4",
}

export default function MobileChallengeGame() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [allCards, setAllCards] = useState<ChallengeCard[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [currentTurn, setCurrentTurn] = useState(1)
  const [shuffledCards, setShuffledCards] = useState<ChallengeCard[]>([])
  const [currentCards, setCurrentCards] = useState<ChallengeCard[]>([])
  const [selectedCard, setSelectedCard] = useState<ChallengeCard | null>(null)
  const [turnResults, setTurnResults] = useState<TurnResult[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: "",
    gamesPlayed: 0,
  })
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({})
  const [showHint, setShowHint] = useState(false)
  const [revealedCards, setRevealedCards] = useState<TurnResult[]>([])
  const [cachedVideoUrls, setCachedVideoUrls] = useState<Record<string, string>>({})
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownComplete, setCountdownComplete] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoadingCards(true)
      const { data, error } = await supabase.from("challenge_cards").select("*")
      if (error) console.error("Error fetching cards:", error)
      else setAllCards(data as ChallengeCard[])
      setIsLoadingCards(false)
    }
    fetchCards()

    const savedStats = localStorage.getItem("googly-game-stats")
    if (savedStats) setStats(JSON.parse(savedStats))

    const cacheAllVideos = async () => {
      const videoPaths = Object.values(videosToCache)
      const promises = videoPaths.map((path) => cacheVideo(path))
      const resolvedUrls = await Promise.all(promises)

      const urlMap = videoPaths.reduce(
        (acc, path, index) => {
          acc[path] = resolvedUrls[index]
          return acc
        },
        {} as Record<string, string>,
      )

      setCachedVideoUrls(urlMap)
    }

    cacheAllVideos()
  }, [])

  const handleVideoError = (videoPath: string) => {
    setVideoErrors((prev) => ({ ...prev, [videoPath]: true }))
  }

  const saveStats = (newStats: Stats) => {
    setStats(newStats)
    localStorage.setItem("googly-game-stats", JSON.stringify(newStats))
  }

  const updateStatsAfterGame = (results: TurnResult[]) => {
    const today = new Date().toDateString()
    const totalScore = results.reduce((sum, result) => sum + result.score, 0)
    let newCurrentStreak = stats.currentStreak
    let newMaxStreak = stats.maxStreak
    const lastPlayed = new Date(stats.lastPlayedDate)
    const todayDate = new Date(today)
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)

    if (stats.lastPlayedDate !== today) {
      if (stats.lastPlayedDate === yesterday.toDateString() || stats.lastPlayedDate === "") {
        newCurrentStreak += 1
      } else {
        newCurrentStreak = 1
      }
      newMaxStreak = Math.max(newMaxStreak, newCurrentStreak)
    }
    saveStats({
      totalScore: stats.totalScore + totalScore,
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      lastPlayedDate: today,
      gamesPlayed: stats.gamesPlayed + 1,
    })
  }

  const startGameWithMode = (mode: string | null) => {
    if (isLoadingCards || allCards.length === 0) return

    const filteredCards = mode ? allCards.filter((card) => card.modes?.includes(mode)) : allCards

    if (filteredCards.length < 16) {
      // Need 8 rounds * 2 cards
      alert(`Not enough cards for this mode. Please try another or 'Surprise Us'.`)
      return
    }

    const shuffled = fisherYatesShuffle(filteredCards)
    setShuffledCards(shuffled)
    setCurrentTurn(1)
    setTurnResults([])
    setSelectedCard(null)
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
      setCurrentCards(deck.slice((turn - 1) * 2, turn * 2))
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
    if (selectedCard) setGameState("ranking")
  }

  const handleEmojiSelection = (rating: Rating) => {
    if (selectedCard) {
      const newResult: TurnResult = { card: selectedCard, score: rating.score, emoji: rating.emoji }
      const newResults = [...turnResults, newResult]
      setTurnResults(newResults)

      if (currentTurn >= 8) {
        updateStatsAfterGame(newResults)
        setTurnResults([...newResults].sort((a, b) => a.score - b.score))
        setGameState("finalRecap")
      } else {
        const nextTurnNumber = currentTurn + 1
        setCurrentTurn(nextTurnNumber)
        setSelectedCard(null)
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
      const timer = setTimeout(() => setRevealedCards((prev) => [...prev, turnResults[prev.length]]), 500)
      return () => clearTimeout(timer)
    }
  }, [gameState, revealedCards, turnResults])

  const ShufflingAnimation = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-[80vw] max-w-md h-auto flex items-center justify-center">
        {videoErrors[videosToCache.shuffle] ? (
          <Image src="/shuffle-fallback.png" alt="Shuffling cards" width={400} height={225} />
        ) : (
          <video
            key={cachedVideoUrls[videosToCache.shuffle]}
            src={cachedVideoUrls[videosToCache.shuffle]}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-contain"
            poster="/shuffle-fallback.png"
            onError={() => handleVideoError(videosToCache.shuffle)}
          />
        )}
      </div>
      <div className="text-4xl font-grandstander text-gray-800 animate-bounce">Shuffling cards!</div>
      <div className="text-sm text-gray-600 animate-pulse">Preparing your next challenge...</div>
    </div>
  )

  const ModeSelectionScreen = () => {
    const modes = [
      { name: "Surprise Us", key: null, image: "/random.png", video: videosToCache.random },
      { name: "Eating Together", key: "eating_together", image: "/eating.png", video: videosToCache.eating },
      { name: "At Home", key: "at_home", image: "/home.png", video: videosToCache.home },
      { name: "Outside", key: "outside", image: "/outside.png", video: videosToCache.outside },
    ]

    return (
      <div className="min-h-screen bg-[#F7F2E8] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Choose a Mode</h1>
          <p className="text-gray-600">How are you playing today?</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {modes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => startGameWithMode(mode.key)}
              className="aspect-[4/5] bg-white rounded-2xl shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center p-4 text-center space-y-3 transform transition-transform hover:scale-105 active:scale-100"
            >
              <div className="w-full h-auto flex-grow rounded-lg overflow-hidden">
                {videoErrors[mode.video] ? (
                  <Image
                    src={mode.image || "/placeholder.svg"}
                    alt={mode.name}
                    width={200}
                    height={250}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    key={cachedVideoUrls[mode.video]}
                    poster={mode.image}
                    src={cachedVideoUrls[mode.video]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onError={() => handleVideoError(mode.video)}
                  />
                )}
              </div>
              <span className="font-grandstander text-gray-800 text-2xl h-16 flex items-center justify-center">
                {mode.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

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
                {videoErrors[videosToCache.logo] ? (
                  <Image
                    src="/googly-game-logo.png"
                    alt="The Googly Game"
                    width={240}
                    height={140}
                    className="w-full max-w-[240px] h-auto"
                  />
                ) : (
                  <video
                    key={cachedVideoUrls[videosToCache.logo]}
                    src={cachedVideoUrls[videosToCache.logo]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                    style={{ maxHeight: "140px" }}
                    poster="/googly-game-logo.png"
                    onError={() => handleVideoError(videosToCache.logo)}
                  />
                )}
              </div>
              <p className="text-gray-600 text-xl leading-relaxed">
                Don't overthink it
                <br />
                Just do the thing!
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => setGameState("modeSelection")}
                  disabled={isLoadingCards}
                  className="relative w-full bg-black hover:bg-gray-800 text-white font-medium text-xl py-6 rounded-full disabled:bg-gray-400"
                >
                  {isLoadingCards ? <Loader2 className="w-6 h-6 animate-spin" /> : "Play"}
                </Button>
                <Button
                  onClick={() => setGameState("stats")}
                  className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium text-xl py-6 rounded-full flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-6 h-6" /> Statistics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "modeSelection") {
    return <ModeSelectionScreen />
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
            <h2 className="text-3xl font-grandstander text-black mb-2">Round {currentTurn} of 8</h2>
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
                  className={cn(
                    "border-4 cursor-pointer transform transition-all duration-300 min-h-[200px] flex flex-col justify-center",
                    getCardStyle(card.category, card.color),
                    selectedCard?.id === card.id
                      ? "scale-105 ring-4 ring-black shadow-2xl"
                      : "hover:scale-102 shadow-lg",
                  )}
                  onClick={() => selectCard(card)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 text-4xl">{card.icon}</div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{card.icon}</span>
                        <span className="font-grandstander text-sm bg-white/90 px-3 py-1 rounded-full">
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
                {selectedCard?.timer ? "Start Timer" : "Start!"}
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
              onClick={() => handleEmojiSelection(rating)}
              className="relative aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 transform bg-white/40 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <span className="text-4xl md:text-5xl">{rating.emoji}</span>
            </button>
          ))}
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
              <Card
                className={cn(
                  "border-4 border-white shadow-2xl max-w-xs mx-auto",
                  getCardStyle(result.card.category, result.card.color),
                )}
              >
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
