"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { backfillCardModesAction, getUncategorizedCardCountAction } from "@/app/admin/actions"

export default function BackfillModes() {
  const [uncategorizedCount, setUncategorizedCount] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const isComplete = uncategorizedCount === 0

  const fetchCount = async () => {
    const res = await getUncategorizedCardCountAction()
    if (res.success) {
      setUncategorizedCount(res.count)
    } else {
      toast({ title: "Error fetching count", description: res.error, variant: "destructive" })
      setUncategorizedCount(0) // Prevent running if count fails
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  const handleBackfill = () => {
    startTransition(async () => {
      const res = await backfillCardModesAction()
      if (res.success) {
        if (res.updatedCount > 0) {
          toast({
            title: "Batch Processed!",
            description: `${res.updatedCount} cards were updated.`,
            className: "bg-green-100",
          })
        } else {
          toast({
            title: "No cards were updated.",
            description:
              "This might be because all cards are categorized or the AI couldn't process the current batch.",
          })
        }
        await fetchCount() // Refresh count
      } else {
        toast({ title: "Backfill failed", description: res.error, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800">Categorize Cards into Modes</h3>
        <p className="text-sm text-gray-600">
          Use AI to assign modes ('Eating Together', 'On the Couch', 'Outside') to cards that haven't been categorized
          yet. Processes up to 20 cards per batch.
        </p>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Cards needing categorization:</p>
          {uncategorizedCount === null ? (
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{uncategorizedCount}</p>
          )}
        </div>
        <Button onClick={handleBackfill} disabled={isPending || isComplete}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isComplete ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              All Done!
            </>
          ) : (
            "Run Batch"
          )}
        </Button>
      </div>
    </div>
  )
}
