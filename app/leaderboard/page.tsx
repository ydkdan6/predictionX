'use client'

import { LeaderboardRow, LeaderboardUser } from '@/components/LeaderboardRow'

const mockUsers: LeaderboardUser[] = [
  { id: "1", rank: 1, name: "David M.", points: 1450, isPremium: true, trend: "same" },
  { id: "2", rank: 2, name: "Sarah K.", points: 1320, isPremium: false, trend: "up" },
  { id: "3", rank: 3, name: "John D.", points: 1290, isPremium: true, trend: "down" },
  { id: "4", rank: 4, name: "Mike R.", points: 1100, isPremium: false, trend: "up" },
  { id: "5", rank: 5, name: "Emma W.", points: 950, isPremium: true, trend: "down" },
  { id: "102", rank: 102, name: "You", points: 450, isPremium: false, trend: "up" }
]

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight">Global Rank</h1>
        <p className="text-muted-foreground text-sm mt-1">Top players win sponsor rewards</p>
      </header>

      <div className="bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm flex justify-around items-center">
        <div className="text-center">
          <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Your Rank</span>
          <span className="text-2xl font-black text-foreground">102</span>
        </div>
        <div className="w-px h-10 bg-border"></div>
        <div className="text-center">
          <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Points</span>
          <span className="text-2xl font-black text-primary">450</span>
        </div>
      </div>

      <div className="space-y-1 pb-20">
        {mockUsers.map(user => (
          <LeaderboardRow 
            key={user.id} 
            user={user} 
            isCurrentUser={user.id === "102"} 
          />
        ))}
      </div>
    </div>
  )
}
