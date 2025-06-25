"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Shuffle } from "lucide-react"

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
  {
    category: "Teamwork",
    challenge: "Create a short skit with two others.",
    color: "bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400",
    icon: "🤝",
  },
  {
    category: "Teamwork",
    challenge: "Try to clap in sync 10 times with a partner.",
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
    challenge: "Do 10 jumping jacks while singing the alphabet.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Balance a spoon on your nose for 10 seconds.",
    color: "bg-gradient-to-br from-green-100 to-emerald-200 border-green-400",
    icon: "🏃",
  },
  {
    category: "Move It",
    challenge: "Stand on one leg and count to 20.",
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
  {
    category: "Say/Sing",
    challenge: "Sing a song using only animal sounds.",
    color: "bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400",
    icon: "🎤",
  },
  {
    category: "Say/Sing",
    challenge: "Sing 'Happy Birthday' like a rock star.",
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
  {
    category: "Think Fast",
    challenge: "List 4 things that are round.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 4 things smaller than your hand.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 3 things that are yellow.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "List 5 animals with fur.",
    color: "bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400",
    icon: "⚡",
  },
  {
    category: "Think Fast",
    challenge: "Name 3 superheroes in 10 seconds.",
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
    challenge: "Act like you're stuck in jelly.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🎭",
  },
  {
    category: "Act It Out",
    challenge: "Pretend to be a robot teaching a dance class.",
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
  {
    category: "Act It Out",
    challenge: "Pretend you're a penguin trying to fly.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🐧",
  },
  {
    category: "Act It Out",
    challenge: "Act like you're a zombie doing yoga.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🧟",
  },
  {
    category: "Act It Out",
    challenge: "Pretend you're a superhero whose power is making sandwiches.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🥪",
  },
  {
    category: "Act It Out",
    challenge: "Act like you're a robot that's running out of battery.",
    color: "bg-gradient-to-br from-red-100 to-pink-200 border-red-400",
    icon: "🤖",
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
    challenge: "Hold your tongue and say 'elephant.'",
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
  {
    category: "Funny Face",
    challenge: "Do your best villain laugh.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Make your best fish face.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
  {
    category: "Funny Face",
    challenge: "Stick your tongue out and try to hum a tune.",
    color: "bg-gradient-to-br from-yellow-100 to-orange-200 border-yellow-400",
    icon: "😜",
  },
]

export default function Component() {
  const [cards, setCards] = useState(challengeCards)

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <div className="print:hidden bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg border-b p-6 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg">🎉 Family Challenge Cards 🎉</h1>
            <p className="text-purple-100 mt-1 font-semibold">
              {cards.length} explosive challenges ready to print and play!
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={shuffleCards} variant="outline" className="bg-white text-gray-700">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Cards
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions - Hidden when printing */}
      <div className="print:hidden max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">How to Use:</h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Print these cards on cardstock for durability</li>
            <li>• Cut along the card borders</li>
            <li>• Mix all cards together or separate by category</li>
            <li>• Take turns drawing cards and completing the challenges</li>
            <li>• Have fun and be creative with your interpretations!</li>
          </ul>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
          {cards.map((card, index) => (
            <Card
              key={index}
              className={`${card.color} border-3 print:break-inside-avoid print:w-full print:h-32 h-36 flex flex-col transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl`}
            >
              <CardContent className="p-3 flex flex-col h-full relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1 right-1 text-4xl">{card.icon}</div>
                  <div className="absolute bottom-1 left-1 text-2xl opacity-50">{card.icon}</div>
                </div>

                <div className="flex-shrink-0 mb-2 relative z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-gray-800 shadow-sm border-2 border-white">
                    <span className="text-sm">{card.icon}</span>
                    {card.category}
                  </span>
                </div>
                <div className="flex-1 flex items-center relative z-10">
                  <p className="text-sm font-bold text-gray-900 leading-tight drop-shadow-sm">{card.challenge}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
