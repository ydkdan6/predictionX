'use client'

import { Trophy, ArrowRight, Settings, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, John!</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-[0_4px_20px_0_rgba(0,213,99,0.3)]">
          <span className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-90">Total Points</span>
          <span className="text-3xl font-black">1,450</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl text-center flex flex-col justify-center">
          <span className="block text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">Global Rank</span>
          <span className="text-2xl font-black text-foreground">102</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Predictions</h2>
          <Link href="/predict" className="text-sm text-primary font-bold hover:underline flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="bg-card border border-border p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">Mexico vs Poland</p>
                <p className="text-xs text-muted-foreground">You predicted 1-0</p>
              </div>
            </div>
            <span className="font-black text-primary">+3 pts</span>
          </div>

          <div className="bg-card border border-border p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-bold text-sm">Argentina vs S. Arabia</p>
                <p className="text-xs text-muted-foreground">You predicted 2-0 (Actual: 1-2)</p>
              </div>
            </div>
            <span className="font-black text-muted-foreground">0 pts</span>
          </div>

          <div className="bg-card border border-border p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-bold text-sm">USA vs Wales</p>
                <p className="text-xs text-muted-foreground">You predicted 0-0</p>
              </div>
            </div>
            <span className="font-black text-secondary">Pending</span>
          </div>
        </div>
      </div>

      <div className="bg-secondary/10 border border-secondary/30 p-5 rounded-2xl relative overflow-hidden mt-auto mb-20">
        <div className="relative z-10">
          <h3 className="font-black text-lg text-secondary mb-1">👑 Premium Status</h3>
          <p className="text-sm text-foreground/80 mb-4">You are eligible for all cash prizes and global jackpot.</p>
        </div>
        <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-secondary/10" />
      </div>
    </div>
  )
}
