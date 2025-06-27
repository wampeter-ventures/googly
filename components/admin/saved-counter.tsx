"use client"

import { motion } from "framer-motion"

export default function SavedCounter({ count }: { count: number }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-full shadow-lg flex items-center space-x-2">
      <span className="text-lg">✅</span>
      <motion.div key={count} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <span className="font-bold text-lg">{count}</span>
      </motion.div>
      <span className="text-sm text-gray-600">saved</span>
    </div>
  )
}
