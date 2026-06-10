import { Crown } from "lucide-react"

export interface LeaderboardUser {
  id: string
  rank: number
  name: string
  points: number
  isPremium: boolean
  trend: "up" | "down" | "same"
}

export function LeaderboardRow({ user, isCurrentUser = false }: { user: LeaderboardUser, isCurrentUser?: boolean }) {
  const isTop3 = user.rank <= 3
  
  return (
    <div className={`flex items-center p-4 rounded-xl mb-3 transition-colors ${
      isCurrentUser 
        ? "bg-primary/10 border-primary border shadow-[0_0_15px_rgba(0,213,99,0.1)]" 
        : "bg-card border border-border hover:border-primary/30"
    }`}>
      {/* Rank */}
      <div className="w-8 flex justify-center items-center font-bold mr-3">
        {user.rank === 1 ? (
          <span className="text-secondary text-xl font-black">1</span>
        ) : user.rank === 2 ? (
          <span className="text-slate-300 text-lg font-black">2</span>
        ) : user.rank === 3 ? (
          <span className="text-amber-600 text-lg font-black">3</span>
        ) : (
          <span className="text-muted-foreground">{user.rank}</span>
        )}
      </div>

      {/* Avatar/Initial */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 relative ${
        isTop3 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {user.name.substring(0, 2).toUpperCase()}
        {user.isPremium && (
          <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
            <Crown className="w-3.5 h-3.5 text-secondary fill-secondary" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 flex flex-col">
        <span className={`font-bold ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
          {user.name} {isCurrentUser && "(You)"}
        </span>
        {user.isPremium && <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Premium</span>}
      </div>

      {/* Points */}
      <div className="flex flex-col items-end">
        <span className="font-black text-lg tabular-nums">{user.points}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">pts</span>
      </div>
    </div>
  )
}
