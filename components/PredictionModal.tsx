'use client'

import { useState } from 'react'
import { X, Trophy } from 'lucide-react'
import { MatchProps } from './MatchCard'

interface PredictionModalProps {
  isOpen: boolean
  onClose: () => void
  match: MatchProps
}

export function PredictionModal({ isOpen, onClose, match }: PredictionModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="mb-6 pr-8">
          <h2 className="text-2xl font-black mb-1">Make Prediction</h2>
          <p className="text-sm text-muted-foreground">Smart Scoring active. Accuracy earns more points.</p>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Prediction Locked!</h3>
            <p className="text-muted-foreground mt-2">Good luck in the leaderboards.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Scoreline */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">1. Final Score (5 pts)</label>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-sm font-bold mb-2">{match.homeTeam}</span>
                  <input type="number" min="0" max="20" required className="w-16 h-16 text-center text-2xl font-black bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <span className="text-muted-foreground font-black text-xl">-</span>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-sm font-bold mb-2">{match.awayTeam}</span>
                  <input type="number" min="0" max="20" required className="w-16 h-16 text-center text-2xl font-black bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* First Goal Scorer */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. First Goal Scorer (2 pts)</label>
              <input 
                type="text" 
                placeholder="e.g. Lionel Messi or None" 
                className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Total Goals (Over/Under) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Total Goals (2 pts)</label>
              <select className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary appearance-none text-foreground">
                <option value="">Select option...</option>
                <option value="under_1.5">Under 1.5 Goals</option>
                <option value="over_1.5">Over 1.5 Goals</option>
                <option value="under_2.5">Under 2.5 Goals</option>
                <option value="over_2.5">Over 2.5 Goals</option>
                <option value="over_3.5">Over 3.5 Goals</option>
              </select>
            </div>

            {/* Possession */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4. Possession Range (1 pt)</label>
              <select className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary appearance-none text-foreground">
                <option value="">Select possession winner...</option>
                <option value="home_dominant">{match.homeTeam} Dominant (&gt;60%)</option>
                <option value="away_dominant">{match.awayTeam} Dominant (&gt;60%)</option>
                <option value="even_home">Even - {match.homeTeam} Edge (51-59%)</option>
                <option value="even_away">Even - {match.awayTeam} Edge (51-59%)</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,213,99,0.39)] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Submitting..." : "Lock Prediction"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
