import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcodeTerminal from 'qrcode-terminal'
import { db } from '@/lib/db'
import { whatsappUsers, predictions, fixtures } from '@/lib/db/schema'
import { eq, gte } from 'drizzle-orm'
import axios from 'axios'
import pino from 'pino'
import {
  canUserPredict,
  isPredictionLocked,
  getBroadcastMessage,
  getLockMessage,
  getAllUsersForBroadcast,
  getMatchesDueForBroadcast,
} from './scheduler'

const logger = pino()

interface UserState {
  [key: string]: {
    step: 'awaiting_username' | 'awaiting_prediction' | 'idle'
    fixture?: any
    prediction?: {
      homeScore?: number
      awayScore?: number
    }
  }
}

const userState: UserState = {}

export async function initializeWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      qrcodeTerminal.generate(qr, { small: true })
      console.log('[v0] QR Code generated. Scan with WhatsApp.')
    }
    if (connection === 'close') {
      // reconnect if not logged out
      if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
        setTimeout(() => initializeWhatsAppBot(), 3000)
      } else {
        console.log('[v0] WhatsApp disconnected.')
      }
    } else if (connection === 'open') {
      console.log('[v0] WhatsApp bot connected and ready.')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message || isJidBroadcast(msg.key.remoteJid)) return

    const from = msg.key.remoteJid!
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const timestamp = msg.messageTimestamp

    console.log(`[v0] Message from ${from}: ${text}`)

    // Initialize user state if not exists
    if (!userState[from]) {
      userState[from] = { step: 'idle' }
    }

    try {
      await handleMessage(from, text, timestamp || 0, sock)
    } catch (error) {
      console.error('[v0] Error processing message:', error)
      // await sock.sendMessage(from, { text: 'An error occurred. Please try again.' })
    }
  })

  return sock
}

async function handleMessage(from: string, text: string, timestamp: number, sock: any) {
  const trimmedText = text.trim().toLowerCase()

  // Check if user exists
  const existingUser = await db
    .select()
    .from(whatsappUsers)
    .where(eq(whatsappUsers.waId, from))
    .limit(1)

  // Registration flow
  if (existingUser.length === 0 && trimmedText !== 'register') {
    await sock.sendMessage(from, {
      text: 'Welcome to 2026 World Cup Predictor! Type "register" to get started.',
    })
    return
  }

  if (trimmedText === 'register') {
    userState[from].step = 'awaiting_username'
    await sock.sendMessage(from, {
      text: 'Great! What username would you like? (No spaces allowed)',
    })
    return
  }

  // Username registration
  if (userState[from].step === 'awaiting_username') {
    const username = trimmedText.replace(/\s+/g, '_')
    const exists = await db
      .select()
      .from(whatsappUsers)
      .where(eq(whatsappUsers.uniqueUsername, username))
      .limit(1)

    if (exists.length > 0) {
      await sock.sendMessage(from, { text: 'Username already taken. Try another one.' })
      return
    }

    await db.insert(whatsappUsers).values({
      waId: from,
      uniqueUsername: username,
      isPremium: false,
      totalPoints: 0,
      weeklyPoints: 0,
    })

    userState[from].step = 'idle'
    await sock.sendMessage(from, {
      text: `Welcome ${username}! You're registered. Type "help" for available commands.`,
    })
    return
  }

  // Commands
  if (trimmedText === 'help') {
    await sock.sendMessage(from, {
      text: `Commands:
1. *predict* - Make a prediction for upcoming matches
2. *leaderboard* - View current leaderboard
3. *my points* - Check your points
4. *premium* - Upgrade to premium
5. *next matches* - See upcoming fixtures
6. *schedule* - View upcoming broadcast schedule`,
    })
    return
  }

  if (trimmedText === 'predict') {
    await handlePredictFlow(from, sock)
    return
  }

  if (trimmedText === 'next matches') {
    const upcomingFixtures = await db
      .select()
      .from(fixtures)
      .where(eq(fixtures.isFinished, false))
      .limit(5)

    if (upcomingFixtures.length === 0) {
      await sock.sendMessage(from, { text: 'No upcoming matches at the moment.' })
      return
    }

    let matchesText = '⚽ Upcoming Matches:\n\n'
    upcomingFixtures.forEach((fix, idx) => {
      matchesText += `${idx + 1}. ${fix.homeTeam} vs ${fix.awayTeam}\n`
      matchesText += `Time: ${new Date(fix.kickoffTime).toLocaleString()}\n\n`
    })

    await sock.sendMessage(from, { text: matchesText })
    return
  }

  if (trimmedText === 'my points') {
    const user = existingUser[0]
    const message = `📊 Your Stats:\nTotal Points: ${user.totalPoints}\nWeekly Points: ${user.weeklyPoints}\nStatus: ${user.isPremium ? '💎 Premium' : '🆓 Free'}`
    await sock.sendMessage(from, { text: message })
    return
  }

  if (trimmedText === 'leaderboard') {
    const topUsers = await db
      .select()
      .from(whatsappUsers)
      .orderBy((u) => u.totalPoints)
      .limit(10)

    let leaderboardText = '🏆 Top 10 Players:\n\n'
    topUsers.forEach((u, idx) => {
      leaderboardText += `${idx + 1}. ${u.uniqueUsername}: ${u.totalPoints} pts ${u.isPremium ? '💎' : ''}\n`
    })
    await sock.sendMessage(from, { text: leaderboardText })
    return
  }

  if (trimmedText === 'premium') {
    const user = existingUser[0]
    if (user.isPremium) {
      await sock.sendMessage(from, { text: '💎 You are already a premium member!' })
      return
    }

    const paystackPublic = process.env.PAYSTACK_PUBLIC_KEY
    await sock.sendMessage(from, {
      text: `Upgrade to Premium for ₦500!\n\nBenefits:\n✅ Access premium leaderboard\n✅ Compete for jackpots\n✅ Priority support\n\nPublic Key: ${paystackPublic}`,
    })
    return
  }

  if (trimmedText === 'schedule') {
    await handleScheduleCommand(from, sock)
    return
  }

  // Handle score predictions (e.g., "2-1")
  if (trimmedText.match(/^\d+-\d+$/)) {
    await handleScorePrediction(from, trimmedText, existingUser[0], sock)
    return
  }

  await sock.sendMessage(from, {
    text: 'I didn\'t understand that. Type "help" for available commands.',
  })
}

async function handlePredictFlow(from: string, sock: any) {
  const now = new Date()
  const upcomingFixtures = await db
    .select()
    .from(fixtures)
    .where(gte(fixtures.kickoffTime, now))
    .limit(5)

  if (upcomingFixtures.length === 0) {
    await sock.sendMessage(from, { text: 'No upcoming matches to predict on.' })
    return
  }

  let predictionText = '⚽ *UPCOMING MATCHES FOR PREDICTION*\n\n'

  for (const fixture of upcomingFixtures) {
    const canPredict = await canUserPredict(fixture.kickoffTime)
    const isLocked = await isPredictionLocked(fixture.kickoffTime)
    const timeUntilKickoff = (fixture.kickoffTime.getTime() - now.getTime()) / (60 * 1000)

    const status = isLocked
      ? '🔒 LOCKED'
      : canPredict
        ? '✅ OPEN'
        : `⏰ Opens in ${Math.ceil(timeUntilKickoff / 60)} hours`

    predictionText += `${upcomingFixtures.indexOf(fixture) + 1}. ${fixture.homeTeam} vs ${fixture.awayTeam}\n`
    predictionText += `   ${status} (${Math.round(timeUntilKickoff)} min to kickoff)\n\n`
  }

  predictionText += '\n📝 To predict, respond with the score:\nExample: *2-1*\n(Home Score - Away Score)'

  await sock.sendMessage(from, { text: predictionText })
}

async function handleScheduleCommand(from: string, sock: any) {
  const now = new Date()
  const allFixtures = await db
    .select()
    .from(fixtures)
    .where(gte(fixtures.kickoffTime, now))
    .limit(10)

  if (allFixtures.length === 0) {
    await sock.sendMessage(from, { text: 'No upcoming matches scheduled.' })
    return
  }

  let scheduleText = '📅 *BROADCAST SCHEDULE* (Next 10 Matches)\n\n'

  for (const fixture of allFixtures) {
    const broadcastTime = new Date(fixture.kickoffTime.getTime() - 3 * 60 * 60 * 1000)
    const lockTime = new Date(fixture.kickoffTime.getTime() - 60 * 60 * 1000)
    const kickoffTime = fixture.kickoffTime

    const broadcastStr = broadcastTime.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    })
    const lockStr = lockTime.toLocaleString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    })

    scheduleText += `${allFixtures.indexOf(fixture) + 1}. ${fixture.homeTeam} vs ${fixture.awayTeam}\n`
    scheduleText += `   📤 Broadcast: ${broadcastStr}\n`
    scheduleText += `   🔒 Lock: ${lockStr}\n\n`
  }

  await sock.sendMessage(from, { text: scheduleText })
}

async function handleScorePrediction(from: string, scoreString: string, user: any, sock: any) {
  const now = new Date()
  const [homeScore, awayScore] = scoreString.split('-').map(Number)

  if (isNaN(homeScore) || isNaN(awayScore)) {
    await sock.sendMessage(from, { text: '❌ Invalid score format. Use: *2-1*' })
    return
  }

  // Get upcoming fixtures user can predict on
  const upcomingFixtures = await db
    .select()
    .from(fixtures)
    .where(gte(fixtures.kickoffTime, now))
    .limit(5)

  let predictedCount = 0

  for (const fixture of upcomingFixtures) {
    const canPredict = await canUserPredict(fixture.kickoffTime)

    if (canPredict) {
      try {
        // Check if already predicted
        const existing = await db
          .select()
          .from(predictions)
          .where(eq(predictions.apiFixtureId, fixture.apiFixtureId))
          .where(eq(predictions.waId, from))
          .limit(1)

        if (existing.length > 0) {
          await sock.sendMessage(from, {
            text: `⚠️ You already predicted ${homeScore}-${awayScore} for ${fixture.homeTeam} vs ${fixture.awayTeam}. Cannot change!`,
          })
          continue
        }

        await db.insert(predictions).values({
          waId: from,
          apiFixtureId: fixture.apiFixtureId,
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
        })

        predictedCount++
        console.log(
          `[v0] ${user.uniqueUsername} predicted ${homeScore}-${awayScore} for ${fixture.homeTeam} vs ${fixture.awayTeam}`
        )
      } catch (error) {
        console.error('[v0] Prediction error:', error)
      }
    }
  }

  if (predictedCount > 0) {
    await sock.sendMessage(from, {
      text: `✅ Prediction recorded for ${predictedCount} match(es)!\n\nYou predicted: *${homeScore}-${awayScore}*\n\nPoints will be awarded after the match.`,
    })
  } else {
    const isLocked = await isPredictionLocked(upcomingFixtures[0].kickoffTime)
    if (isLocked) {
      await sock.sendMessage(from, {
        text: '🔒 All prediction windows are currently locked (less than 1 hour to kickoff).',
      })
    } else {
      await sock.sendMessage(from, {
        text: '⏰ No matches available for prediction at the moment. Use *next matches* to see upcoming fixtures.',
      })
    }
  }
}

export async function sendBroadcast(message: string) {
  // Implementation for broadcasting to all users
  console.log(`[v0] Broadcasting: ${message}`)
}

export async function startBroadcastScheduler(sock: any) {
  console.log('[v0] Starting broadcast scheduler...')

  // Check for broadcasts every 5 minutes
  setInterval(async () => {
    try {
      const matchesDue = await getMatchesDueForBroadcast()

      for (const match of matchesDue) {
        const users = await getAllUsersForBroadcast()
        const broadcastMsg = getBroadcastMessage(match.fixture)

        console.log(
          `[v0] Broadcasting prediction window for ${match.fixture.homeTeam} vs ${match.fixture.awayTeam}`
        )

        for (const user of users) {
          try {
            const jid = user.waId
            await sock.sendMessage(jid, { text: broadcastMsg })
            console.log(`[v0] Sent broadcast to ${user.uniqueUsername}`)
          } catch (error) {
            console.error(`[v0] Failed to send broadcast to ${user.uniqueUsername}:`, error)
          }
        }
      }
    } catch (error) {
      console.error('[v0] Broadcast scheduler error:', error)
    }
  }, 5 * 60 * 1000) // Check every 5 minutes
}
