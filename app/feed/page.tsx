'use client'

import { FeedItem, FeedItemData } from '@/components/FeedItem'

const mockFeed: FeedItemData[] = [
  { id: "1", user: "SoccerFan99", message: "just predicted 2-1 for Mexico vs Poland!", timeAgo: "1m ago", type: "prediction" },
  { id: "2", user: "David M.", message: "won 3 points from the Argentina game! 🎯", timeAgo: "5m ago", type: "win" },
  { id: "3", user: "Sarah K.", message: "Who else thinks Canada will pull an upset?", timeAgo: "12m ago", type: "comment" },
  { id: "4", user: "Mike R.", message: "just joined the leaderboard! Watch out!", timeAgo: "15m ago", type: "comment" },
  { id: "5", user: "Emma W.", message: "predicted 0-0 for USA vs Wales", timeAgo: "22m ago", type: "prediction" },
]

export default function FeedPage() {
  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-black">Live Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">What people are saying</p>
      </header>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-20">
        {mockFeed.map(item => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
