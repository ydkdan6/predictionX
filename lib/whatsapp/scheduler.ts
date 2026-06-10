import { db } from '@/lib/db'
import { fixtures, whatsappUsers } from '@/lib/db/schema'
import { eq, gte, lt } from 'drizzle-orm'

interface ScheduledMatch {
  fixture: any
  broadcastTime: Date
  lockTime: Date
  minutesUntilBroadcast: number
  minutesUntilLock: number
}

/**
 * Get all matches that need broadcast (3 hours before kickoff)
 * These are matches where the broadcast window has arrived (within 3 hours, not broadcast yet)
 */
export async function getMatchesDueForBroadcast(): Promise<ScheduledMatch[]> {
  const now = new Date()
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

  // Get all fixtures that kickoff between now and 3 hours from now
  const upcomingFixtures = await db
    .select()
    .from(fixtures)
    .where(
      gte(fixtures.kickoffTime, now) // After now
    )

  const matchesDueForBroadcast = upcomingFixtures
    .filter((fixture) => {
      const broadcastTime = new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000)
      return broadcastTime <= now && fixture.kickoffTime > now // Broadcast time has passed, match not yet played
    })
    .map((fixture) => ({
      fixture,
      broadcastTime: new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000),
      lockTime: new Date(fixture.kickoffTime.getTime() - 60 * 60 * 1000),
      minutesUntilBroadcast: 0,
      minutesUntilLock: (fixture.kickoffTime.getTime() - 60 * 60 * 1000 - now.getTime()) / (60 * 1000),
    }))

  return matchesDueForBroadcast
}

/**
 * Check if a user can make a prediction for a specific match
 * Returns true if we're within the 1-hour prediction window (between 3 hours and 1 hour before kickoff)
 */
export async function canUserPredict(fixtureKickoffTime: Date): Promise<boolean> {
  const now = new Date()
  const timeUntilKickoff = fixtureKickoffTime.getTime() - now.getTime()
  const minutesUntilKickoff = timeUntilKickoff / (60 * 1000)

  // User can predict if we're between 180 minutes (3 hours) and 60 minutes (1 hour) before kickoff
  return minutesUntilKickoff >= 60 && minutesUntilKickoff <= 180
}

/**
 * Lock all predictions for a match (1 hour before kickoff)
 * After this time, no new predictions can be made
 */
export async function isPredictionLocked(fixtureKickoffTime: Date): Promise<boolean> {
  const now = new Date()
  const timeUntilKickoff = fixtureKickoffTime.getTime() - now.getTime()
  const minutesUntilKickoff = timeUntilKickoff / (60 * 1000)

  // Prediction is locked if less than 60 minutes (1 hour) until kickoff
  return minutesUntilKickoff < 60 && minutesUntilKickoff > -240 // Still locked for 4 hours after (match duration + buffer)
}

/**
 * Get broadcast message for a match (prediction window open)
 */
export function getBroadcastMessage(fixture: any): string {
  const kickoffTime = new Date(fixture.kickoffTime)
  const kickoffTimeStr = kickoffTime.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  })

  return `⚽ *PREDICTION WINDOW OPEN* ⚽

🏟️ *${fixture.homeTeam} vs ${fixture.awayTeam}*
⏰ Kickoff: ${kickoffTimeStr} (Lagos Time)
Match #${fixture.matchNumber}

📝 *You have 1 HOUR to make your prediction!*

Predict the final score:
- Reply with: *predict*
- Example: *2-1* (Home Score - Away Score)

Locked at: ${new Date(kickoffTime.getTime() - 60 * 60 * 1000).toLocaleString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  })} (1 hour before kickoff)

⚡ *Points:*
✅ Correct outcome: +1 point
✅ Exact score: +3 points
`
}

/**
 * Get prediction lock message
 */
export function getLockMessage(fixture: any): string {
  return `🔒 *PREDICTIONS LOCKED* 🔒

The prediction window for ${fixture.homeTeam} vs ${fixture.awayTeam} has closed.
Kickoff is in less than 1 hour. No more predictions can be made.

Check the leaderboard with: *leaderboard*
`
}

/**
 * Get all users who should receive a broadcast
 */
export async function getAllUsersForBroadcast() {
  return await db.select().from(whatsappUsers)
}

/**
 * Calculate next scheduled broadcast time
 */
export function getNextBroadcastTime(fixture: any): Date {
  return new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000)
}

/**
 * Format time until event
 */
export function formatTimeUntilEvent(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Get schedule for upcoming matches
 */
export async function getUpcomingMatchSchedule(limitMatches: number = 10): Promise<ScheduledMatch[]> {
  const now = new Date()
  const allFixtures = await db.select().from(fixtures).where(gte(fixtures.kickoffTime, now))

  return allFixtures
    .slice(0, limitMatches)
    .map((fixture) => ({
      fixture,
      broadcastTime: new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000),
      lockTime: new Date(fixture.kickoffTime.getTime() - 60 * 60 * 1000),
      minutesUntilBroadcast:
        (new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000).getTime() - now.getTime()) / (60 * 1000),
      minutesUntilLock: (fixture.kickoffTime.getTime() - 60 * 60 * 1000 - now.getTime()) / (60 * 1000),
    }))
}
