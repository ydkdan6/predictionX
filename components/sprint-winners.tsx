'use client'

import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'

interface SprintWinner {
  sprint_number: number
  winner_wa_id: string
  winner_username: string
  is_premium: boolean
  points_earned: number
  jackpot_amount: string
  created_at: string
}

export function SprintWinners() {
  const [winners, setWinners] = useState<SprintWinner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/sprint-winners')
        const data = await response.json()
        setWinners(data.sprint_winners || [])
      } catch (error) {
        console.error('[Sprint Winners] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWinners()
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">Recent Sprint Winners</h2>
        </div>
        <p className="text-gray-600">
          Top players from each 5-match sprint cycle
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading sprint winners...
        </div>
      ) : winners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No sprint winners yet
        </div>
      ) : (
        <div className="grid gap-4">
          {winners.map((winner, index) => (
            <div
              key={`${winner.sprint_number}-${winner.winner_wa_id}`}
              className={`rounded-lg p-4 border-2 transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {index === 0 && (
                      <span className="text-2xl">🥇</span>
                    )}
                    {index === 1 && (
                      <span className="text-2xl">🥈</span>
                    )}
                    {index === 2 && (
                      <span className="text-2xl">🥉</span>
                    )}
                    {index > 2 && (
                      <span className="font-bold text-gray-400">#{index + 1}</span>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {winner.winner_username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Sprint {winner.sprint_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-3">
                    <div className="bg-blue-50 px-3 py-1 rounded text-sm">
                      <span className="font-semibold text-blue-700">
                        {winner.points_earned} pts
                      </span>
                    </div>
                    <div className="bg-purple-50 px-3 py-1 rounded text-sm">
                      <span className="font-semibold text-purple-700">
                        ₦{parseFloat(winner.jackpot_amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    {winner.is_premium && (
                      <div className="bg-purple-100 px-3 py-1 rounded text-sm">
                        <span className="font-semibold text-purple-700">💎 Premium</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(winner.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
