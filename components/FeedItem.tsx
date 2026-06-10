import { MessageCircle } from "lucide-react"

export interface FeedItemData {
  id: string
  user: string
  message: string
  timeAgo: string
  type: "prediction" | "comment" | "win"
}

export function FeedItem({ item }: { item: FeedItemData }) {
  return (
    <div className="flex items-start space-x-3 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        item.type === "prediction" ? "bg-primary/20 text-primary" :
        item.type === "win" ? "bg-secondary/20 text-secondary" :
        "bg-accent/20 text-accent"
      }`}>
        <MessageCircle className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-bold text-foreground mr-2">{item.user}</span>
          <span className="text-muted-foreground">{item.message}</span>
        </p>
        <span className="text-xs text-muted-foreground/70 font-medium mt-1 inline-block">
          {item.timeAgo}
        </span>
      </div>
    </div>
  )
}
