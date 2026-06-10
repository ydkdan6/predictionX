'use client'

import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LeaderboardUser {
  rank: number
  wa_id: string
  username: string
  is_premium: boolean
  points: number
  total_points: number
}

interface LeaderboardProps {
  isPremium?: boolean
}

export function Leaderboard({ isPremium = false }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [jackpot, setJackpot] = useState<number>(0)
  const [boardType, setBoardType] = useState<'weekly' | 'final'>('weekly')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const boardTypeParam = boardType === 'final' && isPremium ? 'final' : 'weekly'
        const url = new URL('/api/leaderboard', window.location.origin)
        url.searchParams.append('type', boardTypeParam)
        if (isPremium && boardType === 'final') {
          url.searchParams.append('isPremium', 'true')
        }

        const response = await fetch(url.toString())
        const data = await response.json()

        setLeaderboard(data.leaderboard || [])
        setJackpot(data.jackpot_amount || 0)
      } catch (error) {
        console.error('[Leaderboard] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [boardType, isPremium])

  const filteredLeaderboard = leaderboard.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFinalLeaderboardClick = () => {
    if (!isPremium) {
      return // Show upgrade overlay instead
    }
    setBoardType(boardType === 'final' ? 'weekly' : 'final')
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Jackpot Counter */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <p className="text-sm font-semibold opacity-90">Current Premium Cash Jackpot</p>
        <p className="text-4xl font-bold mt-2">
          ₦{jackpot.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs opacity-75 mt-1">
          70% of premium collections · 30% to founders
        </p>
      </div>

      {/* Board Selection */}
      <div className="flex gap-2">
        <Button
          variant={boardType === 'weekly' ? 'default' : 'outline'}
          onClick={() => setBoardType('weekly')}
          className="flex-1"
        >
          Weekly Leaderboard
        </Button>

        {isPremium && (
          <Button
            variant={boardType === 'final' ? 'default' : 'outline'}
            onClick={() => setBoardType('final')}
            className="flex-1"
          >
            Final Leaderboard
          </Button>
        )}

        {!isPremium && (
          <div className="flex-1 relative">
            <Button
              disabled
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-2" />
              Final Leaderboard
            </Button>
            <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center group hover:bg-black/60 transition-colors">
              <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Premium Only
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search player..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Player
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  Loading leaderboard...
                </td>
              </tr>
            ) : filteredLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No players found
                </td>
              </tr>
            ) : (
              filteredLeaderboard.map((user, index) => (
                <tr
                  key={user.wa_id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {user.rank}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_premium
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.is_premium ? '💎 Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                    {user.points.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upgrade Modal Overlay */}
      {!isPremium && boardType === 'final' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
            <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Unlock Final Leaderboard
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Upgrade to Premium to track your total points on the Final Leaderboard and compete for the jackpot!
            </p>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                // Redirect to premium upgrade page
                window.location.href = '/upgrade'
              }}
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setBoardType('weekly')}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
