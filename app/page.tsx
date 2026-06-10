'use client'

import { useState } from 'react'
import { Leaderboard } from '@/components/leaderboard'
import { SprintWinners } from '@/components/sprint-winners'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Page() {
  const [isPremium] = useState(false) // This will be set based on user session/auth

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            2026 World Cup Predictor
          </h1>
          <p className="text-gray-600">
            Make your predictions and compete on the leaderboard
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="winners">Sprint Winners</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Leaderboard isPremium={isPremium} />
          </TabsContent>

          <TabsContent value="winners">
            <SprintWinners />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
