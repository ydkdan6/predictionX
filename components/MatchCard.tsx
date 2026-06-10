import { Clock, Trophy } from "lucide-react"

export interface MatchProps {
  id: string
  homeTeam: string
  awayTeam: string
  time: string
  status: "upcoming" | "live" | "finished"
  homeScore?: number
  awayScore?: number
  homeFlag?: string
  awayFlag?: string
}

export function MatchCard({ match }: { match: MatchProps }) {
  const isLive = match.status === "live"

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border relative overflow-hidden transition-all hover:border-primary/50">
      {isLive && (
        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest animate-pulse">
          Live
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-muted-foreground flex items-center font-medium">
          <Clock className="w-3 h-3 mr-1" />
          {match.time}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden border-2 border-border">
            {match.homeFlag ? (
              <img src={match.homeFlag} alt={match.homeTeam} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold">{match.homeTeam.substring(0, 2)}</span>
            )}
          </div>
          <span className="text-sm font-bold text-center leading-tight">{match.homeTeam}</span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center justify-center px-4">
          <div className="text-2xl font-black tabular-nums bg-muted/50 px-4 py-2 rounded-xl">
            {match.status === "upcoming" ? (
              <span className="text-muted-foreground text-sm uppercase tracking-widest">vs</span>
            ) : (
              <span className="text-foreground">{match.homeScore} - {match.awayScore}</span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden border-2 border-border">
            {match.awayFlag ? (
              <img src={match.awayFlag} alt={match.awayTeam} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold">{match.awayTeam.substring(0, 2)}</span>
            )}
          </div>
          <span className="text-sm font-bold text-center leading-tight">{match.awayTeam}</span>
        </div>
      </div>

      {match.status === "upcoming" && (
        <div className="mt-5 pt-4 border-t border-border flex justify-center">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-full text-sm transition-transform active:scale-95 shadow-[0_4px_14px_0_rgba(0,213,99,0.39)] w-full flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-2" />
            Predict Now
          </button>
        </div>
      )}
    </div>
  )
}
