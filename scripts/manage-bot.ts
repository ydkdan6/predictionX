#!/usr/bin/env node
/**
 * WhatsApp Bot Management Script
 * Usage:
 *   pnpm tsx scripts/manage-bot.ts start          - Start the bot
 *   pnpm tsx scripts/manage-bot.ts sync-fixtures  - Sync fixtures from TheSportsDB
 *   pnpm tsx scripts/manage-bot.ts settle <id>    - Settle a match
 */

import dotenv from 'dotenv'
import { initializeWhatsAppBot } from '../lib/whatsapp/bot'
import { fetchWorldCupFixtures } from '../lib/services/fixtures'
import { db } from '../lib/db'
import { fixtures } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

dotenv.config()

const command = process.argv[2]

async function main() {
  try {
    switch (command) {
      case 'start':
        console.log('🚀 Starting WhatsApp bot...')
        const bot = await initializeWhatsAppBot()
        console.log('✅ Bot is running. Scan the QR code with WhatsApp.')
        break

      case 'sync-fixtures':
        console.log('🔄 Syncing World Cup fixtures...')
        await fetchWorldCupFixtures()
        console.log('✅ Fixtures synced')
        break

      case 'settle':
        const fixtureId = parseInt(process.argv[3])
        const homeScore = parseInt(process.argv[4])
        const awayScore = parseInt(process.argv[5])

        if (!fixtureId || homeScore === undefined || awayScore === undefined) {
          console.error(
            'Usage: pnpm tsx scripts/manage-bot.ts settle <fixtureId> <homeScore> <awayScore>'
          )
          process.exit(1)
        }

        console.log(
          `⚽ Settling match ${fixtureId}: ${homeScore}-${awayScore}...`
        )

        const response = await fetch('http://localhost:3000/api/admin/settle-match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ADMIN_BEARER_TOKEN}`,
          },
          body: JSON.stringify({
            api_fixture_id: fixtureId,
            home_score: homeScore,
            away_score: awayScore,
          }),
        })

        if (!response.ok) {
          throw new Error(`Settlement failed: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Match settled')
        console.log(JSON.stringify(result, null, 2))
        break

      case 'list-fixtures':
        console.log('📋 Upcoming fixtures:')
        const upcomingFixtures = await db
          .select()
          .from(fixtures)
          .where(eq(fixtures.isFinished, false))

        upcomingFixtures.forEach((f) => {
          console.log(
            `ID: ${f.apiFixtureId} | ${f.homeTeam} vs ${f.awayTeam} | ${f.kickoffTime}`
          )
        })
        break

      default:
        console.log(`
World Cup Predictor Management CLI

Usage:
  pnpm tsx scripts/manage-bot.ts start          - Start WhatsApp bot
  pnpm tsx scripts/manage-bot.ts sync-fixtures  - Sync fixtures from TheSportsDB
  pnpm tsx scripts/manage-bot.ts settle <id> <home> <away> - Settle a match
  pnpm tsx scripts/manage-bot.ts list-fixtures  - List upcoming fixtures

Environment variables required:
  - DATABASE_URL
  - ADMIN_BEARER_TOKEN
  - PAYSTACK_SECRET_KEY
  - PAYSTACK_PUBLIC_KEY
        `)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
