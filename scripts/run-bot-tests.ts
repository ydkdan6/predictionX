#!/usr/bin/env tsx

import { runAllTests } from '../tests/bot.test'

/**
 * Run Bot Test Suite
 * 
 * This script tests:
 * 1. Fixture fetching from TheSportsDB API
 * 2. Prediction scheduling (3 hours before kickoff)
 * 3. Prediction locking (1 hour before kickoff)
 * 4. Lock enforcement
 * 5. Broadcast scheduling
 * 
 * Usage:
 *   pnpm ts-node scripts/run-bot-tests.ts
 *   OR
 *   npx tsx scripts/run-bot-tests.ts
 */

async function main() {
  try {
    console.log('\n' + '='.repeat(80))
    console.log('   🤖 WHATSAPP BOT TEST SUITE')
    console.log('='.repeat(80))
    console.log('\nTesting fixture fetching, prediction scheduling, and lock mechanism...')

    const success = await runAllTests()

    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('Test runner failed:', error)
    process.exit(1)
  }
}

main()
