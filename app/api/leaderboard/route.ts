import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { whatsappUsers } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'

export const revalidate = 300 // ISR: 5 minutes

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const boardType = searchParams.get('type') || 'weekly' // 'weekly' or 'final'
    const isPremium = searchParams.get('isPremium') === 'true'

    // Get all users
    let users = await db.select().from(whatsappUsers)

    // Filter by premium status if needed
    if (isPremium && boardType === 'final') {
      users = users.filter((u) => u.isPremium)
    }

    // Sort by appropriate points field
    if (boardType === 'weekly') {
      users.sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    } else {
      users.sort((a, b) => b.totalPoints - a.totalPoints)
    }

    // Add rank
    const leaderboardData = users.map((user, index) => ({
      rank: index + 1,
      wa_id: user.waId,
      username: user.uniqueUsername,
      is_premium: user.isPremium,
      points:
        boardType === 'weekly' ? user.weeklyPoints : user.totalPoints,
      total_points: user.totalPoints,
    }))

    // Calculate jackpot
    const premiumUserCount = users.filter((u) => u.isPremium).length
    const jackpotAmount = premiumUserCount * 500 * 0.7

    return NextResponse.json(
      {
        leaderboard: leaderboardData,
        board_type: boardType,
        total_users: users.length,
        premium_users: premiumUserCount,
        jackpot_amount: jackpotAmount,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[Leaderboard API Error]', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
