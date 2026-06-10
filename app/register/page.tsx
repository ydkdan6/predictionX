'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trophy } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <header className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-black text-xl tracking-tight">PREDICT<span className="text-primary">X</span></span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-block bg-secondary/10 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            👑 Premium Access
          </div>
          <h1 className="text-3xl font-black mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join the premium tier to compete for sponsor-funded prizes like iPhones, TVs, and jerseys.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="john@example.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-4 rounded-xl mt-6 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(255,215,0,0.2)] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? "Joining..." : "Join Premium Community (₦2,000)"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </main>
    </div>
  )
}
