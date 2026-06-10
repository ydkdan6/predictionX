import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  fixtures,
  predictions,
  whatsappUsers,
  sprintWinners,
  leaderboardSnapshots,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    // Validate Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Bearer token' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    if (token !== process.env.ADMIN_BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { api_fixture_id, home_score, away_score } = body

    if (
      api_fixture_id === undefined ||
      home_score === undefined ||
      away_score === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: api_fixture_id, home_score, away_score' },
        { status: 400 }
      )
    }

    // Get fixture
    const fixtureData = await db
      .select()
      .from(fixtures)
      .where(eq(fixtures.apiFixtureId, api_fixture_id))
      .limit(1)

    if (fixtureData.length === 0) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }

    const currentFixture = fixtureData[0]

    // Update fixture with results
    await db
      .update(fixtures)
      .set({
        homeScore: home_score,
        awayScore: away_score,
        isFinished: true,
      })
      .where(eq(fixtures.apiFixtureId, api_fixture_id))

    // Get all predictions for this fixture
    const allPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.apiFixtureId, api_fixture_id))

    // Calculate points for each prediction
    const pointsMap = new Map<string, number>()

    for (const pred of allPredictions) {
      let pointsEarned = 0

      // Check if exact scoreline match
      if (
        pred.predictedHomeScore === home_score &&
        pred.predictedAwayScore === away_score
      ) {
        pointsEarned = 3
      } else {
        // Check if outcome is correct (W/D/L)
        const actualOutcome =
          home_score > away_score ? 'W' : home_score < away_score ? 'L' : 'D'
        const predictedOutcome =
          pred.predictedHomeScore > pred.predictedAwayScore
            ? 'W'
            : pred.predictedHomeScore < pred.predictedAwayScore
              ? 'L'
              : 'D'

        if (actualOutcome === predictedOutcome) {
          pointsEarned = 1
        }
      }

      if (pointsEarned > 0) {
        pointsMap.set(pred.waId, (pointsMap.get(pred.waId) || 0) + pointsEarned)
      }
    }

    // Update user points
    for (const [waId, points] of pointsMap.entries()) {
      const userData = await db
        .select()
        .from(whatsappUsers)
        .where(eq(whatsappUsers.waId, waId))
        .limit(1)

      if (userData.length > 0) {
        await db
          .update(whatsappUsers)
          .set({
            totalPoints: userData[0].totalPoints + points,
            weeklyPoints: userData[0].weeklyPoints + points,
          })
          .where(eq(whatsappUsers.waId, waId))
      }
    }

    // Check if this completes a sprint (5 matches)
    const totalMatches = await db
      .select()
      .from(fixtures)
      .where(eq(fixtures.isFinished, true))

    const completedMatches = totalMatches.length
    const sprintNumber = Math.floor((completedMatches - 1) / 5) + 1
    const matchesInCurrentSprint = ((completedMatches - 1) % 5) + 1

    let sprintWinnerData = null

    if (matchesInCurrentSprint === 5) {
      // Sprint completed! Find top user by weekly_points
      const allUsers = await db.select().from(whatsappUsers)

      if (allUsers.length > 0) {
        const topUser = allUsers.reduce((prev, current) =>
          prev.weeklyPoints > current.weeklyPoints ? prev : current
        )

        // Get premium user count for jackpot calculation
        const premiumUsersCount = allUsers.filter((u) => u.isPremium).length
        const jackpotAmount = premiumUsersCount * 500 * 0.7

        // Register sprint winner
        const sprintWinnerRecord = await db
          .insert(sprintWinners)
          .values({
            sprintNumber,
            winnerWaId: topUser.waId,
            winnerUsername: topUser.uniqueUsername,
            isPremium: topUser.isPremium,
            pointsEarned: topUser.weeklyPoints,
            jackpotAmount: jackpotAmount.toString(),
          })
          .returning()

        sprintWinnerData = sprintWinnerRecord[0]

        // Reset weekly points for all users
        await db
          .update(whatsappUsers)
          .set({ weeklyPoints: 0 })

        // Create leaderboard snapshots for final leaderboard (premium users only)
        const premiumUsers = allUsers.filter((u) => u.isPremium)
        const sortedPremiumUsers = premiumUsers.sort(
          (a, b) => b.totalPoints - a.totalPoints
        )

        for (let i = 0; i < sortedPremiumUsers.length; i++) {
          await db.insert(leaderboardSnapshots).values({
            snapshotType: 'final',
            userWaId: sortedPremiumUsers[i].waId,
            username: sortedPremiumUsers[i].uniqueUsername,
            isPremium: true,
            points: sortedPremiumUsers[i].totalPoints,
            rank: i + 1,
          })
        }
      }
    }

    return NextResponse.json(
      {
        message: 'Match settled successfully',
        fixture: {
          api_fixture_id: api_fixture_id,
          home_team: currentFixture.homeTeam,
          away_team: currentFixture.awayTeam,
          result: `${home_score}-${away_score}`,
        },
        points_distributed: Object.fromEntries(pointsMap),
        sprint_info:
          sprintWinnerData && matchesInCurrentSprint === 5
            ? {
                sprint_number: sprintNumber,
                winner: sprintWinnerData.winnerUsername,
                winner_wa_id: sprintWinnerData.winnerWaId,
                jackpot_amount: sprintWinnerData.jackpotAmount,
              }
            : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Settlement API Error]', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
