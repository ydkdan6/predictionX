'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trophy } from 'lucide-react'

export default function LoginPage() {
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
      <header className="flex justify-center mb-12">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-black text-xl tracking-tight">PREDICT<span className="text-primary">X</span></span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Log in to view your predictions and rankings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Email or Phone</label>
            <input 
              type="text" 
              required
              placeholder="john@example.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl mt-6 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,213,99,0.39)] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? "Logging in..." : "Log In"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Register</Link>
        </p>
      </main>
    </div>
  )
}
