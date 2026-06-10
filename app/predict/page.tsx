'use client'

import { MatchCard, MatchProps } from '@/components/MatchCard'

const mockMatches: MatchProps[] = [
  {
    id: "1",
    homeTeam: "Mexico",
    awayTeam: "Poland",
    time: "Today, 15:00",
    status: "live",
    homeScore: 1,
    awayScore: 0
  },
  {
    id: "2",
    homeTeam: "Canada",
    awayTeam: "Morocco",
    time: "Today, 18:00",
    status: "upcoming"
  },
  {
    id: "3",
    homeTeam: "USA",
    awayTeam: "Wales",
    time: "Tomorrow, 20:00",
    status: "upcoming"
  },
  {
    id: "4",
    homeTeam: "Argentina",
    awayTeam: "S. Arabia",
    time: "Yesterday",
    status: "finished",
    homeScore: 1,
    awayScore: 2
  }
]

export default function PredictPage() {
  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black">Matches</h1>
          <p className="text-muted-foreground text-sm mt-1">Make your predictions</p>
        </div>
        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
          Group Stage
        </div>
      </header>

      <div className="space-y-4 mb-20">
        {mockMatches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}
