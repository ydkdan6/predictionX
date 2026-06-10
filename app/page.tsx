'use client'

import Link from 'next/link'
import { Trophy, ArrowRight, Zap, Target, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-black text-xl tracking-tight">PREDICT<span className="text-primary">X</span></span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col px-6">
        {/* Hero Section */}
        <div className="mt-8 mb-12 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute top-20 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border mb-6">
            <span className="flex w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">World Cup 2026</span>
          </div>
          
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-4">
            PREDICT.<br />
            COMPETE.<br />
            <span className="text-primary">WIN.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-sm">
            Join thousands of football fans. Make your predictions for the 2026 World Cup and climb the global leaderboard.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link 
              href="/join" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-2xl flex items-center justify-between transition-transform active:scale-95 shadow-[0_4px_20px_0_rgba(0,213,99,0.3)] w-full text-lg"
            >
              Play for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/register" 
              className="bg-card hover:bg-muted border-2 border-secondary text-foreground font-bold py-4 px-8 rounded-2xl flex items-center justify-between transition-transform active:scale-95 shadow-[0_4px_20px_0_rgba(255,215,0,0.1)] w-full text-lg group"
            >
              <div className="flex items-center gap-2">
                <span className="text-secondary">👑</span>
                Go Premium
              </div>
              <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">Win Cash Prizes</span>
            </Link>
          </div>
        </div>

        {/* Live Match Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight">Match of the Day</h2>
            <div className="flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              64' Live
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden border-2 border-border">
                  <span className="text-xl font-black">MX</span>
                </div>
                <span className="text-sm font-bold text-center leading-tight">Mexico</span>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="text-3xl font-black tabular-nums bg-muted/50 px-5 py-2 rounded-xl text-foreground border border-border/50">
                  1 - 0
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden border-2 border-border">
                  <span className="text-xl font-black">PL</span>
                </div>
                <span className="text-sm font-bold text-center leading-tight">Poland</span>
              </div>
            </div>

            {/* Live Stats */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">Match Stats</h3>
              
              {/* Possession */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>45%</span>
                  <span className="text-muted-foreground uppercase tracking-wider">Possession</span>
                  <span>55%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full flex overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                  <div className="h-full bg-secondary" style={{ width: '55%' }}></div>
                </div>
              </div>

              {/* Shots */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>8</span>
                  <span className="text-muted-foreground uppercase tracking-wider">Shots</span>
                  <span>12</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full flex overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                  <div className="h-full bg-secondary" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* On Target */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>3</span>
                  <span className="text-muted-foreground uppercase tracking-wider">On Target</span>
                  <span>4</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full flex overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '43%' }}></div>
                  <div className="h-full bg-secondary" style={{ width: '57%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-sm">Live Updates</span>
            <span className="text-xs text-muted-foreground mt-1">Real-time scores</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-bold text-sm">Accuracy</span>
            <span className="text-xs text-muted-foreground mt-1">Points for exact scores</span>
          </div>
        </div>
        
        {/* Social Proof */}
        <div className="bg-muted/30 border border-border p-5 rounded-2xl mb-8 flex items-center justify-between">
          <div>
            <div className="flex -space-x-2 mb-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground">U{i}</span>
                </div>
              ))}
            </div>
            <span className="text-sm font-bold block">10,000+ Players</span>
          </div>
          <Users className="w-8 h-8 text-muted-foreground/30" />
        </div>
      </main>
    </div>
  )
}
