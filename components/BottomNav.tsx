"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, MessageSquare, LayoutDashboard } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/predict", label: "Predict", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Ranking", icon: Trophy },
    { href: "/feed", label: "Feed", icon: MessageSquare },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      {/* Mobile background spans full width, but nav content is constrained on desktop */}
      <div className="w-full bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">
                  {link.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
