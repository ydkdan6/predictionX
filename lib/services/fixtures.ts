import axios from 'axios'
import { db } from '@/lib/db'
import { fixtures } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const THESPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3'
const WORLD_CUP_EVENT_ID = '133602' // 2026 World Cup

interface FixtureResponse {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  dateEvent: string
  strTime: string
  intHomeScore?: number
  intAwayScore?: number
  strStatus: string
}

/**
 * Fetch World Cup 2026 fixtures from TheSportsDB
 */
export async function fetchWorldCupFixtures() {
  try {
    console.log('[v0] Fetching World Cup 2026 fixtures from TheSportsDB...')

    const response = await axios.get(`${THESPORTSDB_API}/eventslast.php`, {
      params: {
        id: WORLD_CUP_EVENT_ID,
      },
    })

    const fixturesData = response.data.results || []

    if (fixturesData.length === 0) {
      console.log('[v0] No fixtures found')
      return
    }

    console.log(`[v0] Found ${fixturesData.length} fixtures`)

    let matchNumber = 1

    for (const fixture of fixturesData) {
      const apiFixtureId = parseInt(fixture.idEvent)

      // Check if fixture already exists
      const existing = await db
        .select()
        .from(fixtures)
        .where(eq(fixtures.apiFixtureId, apiFixtureId))
        .limit(1)

      if (existing.length > 0) {
        // Update if needed
        const homeScore = fixture.intHomeScore ? parseInt(fixture.intHomeScore) : null
        const awayScore = fixture.intAwayScore ? parseInt(fixture.intAwayScore) : null
        const isFinished = fixture.strStatus === 'Match Finished'

        if (homeScore !== null || awayScore !== null || isFinished) {
          await db
            .update(fixtures)
            .set({
              homeScore,
              awayScore,
              isFinished,
            })
            .where(eq(fixtures.apiFixtureId, apiFixtureId))

          console.log(`[v0] Updated fixture: ${fixture.strHomeTeam} vs ${fixture.strAwayTeam}`)
        }
      } else {
        // Insert new fixture
        const dateTimeStr = `${fixture.dateEvent} ${fixture.strTime || '00:00'}`
        const kickoffTime = new Date(dateTimeStr)

        await db.insert(fixtures).values({
          apiFixtureId,
          homeTeam: fixture.strHomeTeam,
          awayTeam: fixture.strAwayTeam,
          kickoffTime,
          homeScore: fixture.intHomeScore ? parseInt(fixture.intHomeScore) : null,
          awayScore: fixture.intAwayScore ? parseInt(fixture.intAwayScore) : null,
          isFinished: fixture.strStatus === 'Match Finished',
          matchNumber,
        })

        console.log(`[v0] Inserted fixture ${matchNumber}: ${fixture.strHomeTeam} vs ${fixture.strAwayTeam}`)
        matchNumber++
      }
    }

    console.log('[v0] Fixtures sync completed')
  } catch (error) {
    console.error('[v0] Error fetching fixtures:', error)
  }
}

/**
 * Get upcoming fixtures (not finished)
 */
export async function getUpcomingFixtures(limit: number = 10) {
  const upcomingFixtures = await db
    .select()
    .from(fixtures)
    .where(eq(fixtures.isFinished, false))
    .limit(limit)

  return upcomingFixtures
}

/**
 * Get fixture by ID
 */
export async function getFixtureById(apiFixtureId: number) {
  const fixture = await db
    .select()
    .from(fixtures)
    .where(eq(fixtures.apiFixtureId, apiFixtureId))
    .limit(1)

  return fixture[0] || null
}

/**
 * Validate prediction is within 1 hour before kickoff
 */
export function isPredictionWithinTimeWindow(kickoffTime: Date): boolean {
  const now = new Date()
  const oneHourBefore = new Date(kickoffTime.getTime() - 60 * 60 * 1000)

  return now <= oneHourBefore
}
