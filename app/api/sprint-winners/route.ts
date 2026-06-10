import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sprintWinners } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export const revalidate = 300 // ISR: 5 minutes

export async function GET(req: NextRequest) {
  try {
    // Get last 10 sprint winners
    const winners = await db
      .select()
      .from(sprintWinners)
      .orderBy(desc(sprintWinners.sprintNumber))
      .limit(10)

    const formattedWinners = winners.map((winner) => ({
      sprint_number: winner.sprintNumber,
      winner_wa_id: winner.winnerWaId,
      winner_username: winner.winnerUsername,
      is_premium: winner.isPremium,
      points_earned: winner.pointsEarned,
      jackpot_amount: winner.jackpotAmount,
      created_at: winner.createdAt,
    }))

    return NextResponse.json(
      {
        sprint_winners: formattedWinners,
        total_sprints: formattedWinners.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[Sprint Winners API Error]', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
