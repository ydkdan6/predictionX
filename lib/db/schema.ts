import { pgTable, text, timestamp, boolean, integer, serial, decimal } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// World Cup Predictor app tables

export const whatsappUsers = pgTable('whatsapp_users', {
  waId: text('wa_id').primaryKey(),
  uniqueUsername: text('unique_username').notNull().unique(),
  isPremium: boolean('is_premium').notNull().default(false),
  totalPoints: integer('total_points').notNull().default(0),
  weeklyPoints: integer('weekly_points').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const fixtures = pgTable('fixtures', {
  apiFixtureId: integer('api_fixture_id').primaryKey(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  kickoffTime: timestamp('kickoff_time').notNull(),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  isFinished: boolean('is_finished').notNull().default(false),
  matchNumber: integer('match_number').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const predictions = pgTable('predictions', {
  id: serial('id').primaryKey(),
  waId: text('wa_id').notNull(),
  apiFixtureId: integer('api_fixture_id').notNull(),
  predictedHomeScore: integer('predicted_home_score').notNull(),
  predictedAwayScore: integer('predicted_away_score').notNull(),
  predictedFirstGoalScorer: text('predicted_first_goal_scorer'),
  predictedPossessionRange: text('predicted_possession_range'),
  predictedTotalGoals: text('predicted_total_goals'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const sprintWinners = pgTable('sprint_winners', {
  id: serial('id').primaryKey(),
  sprintNumber: integer('sprint_number').notNull(),
  winnerWaId: text('winner_wa_id').notNull(),
  winnerUsername: text('winner_username').notNull(),
  isPremium: boolean('is_premium').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  jackpotAmount: decimal('jackpot_amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: serial('id').primaryKey(),
  snapshotType: text('snapshot_type').notNull(),
  userWaId: text('user_wa_id').notNull(),
  username: text('username').notNull(),
  isPremium: boolean('is_premium').notNull(),
  points: integer('points').notNull(),
  rank: integer('rank').notNull(),
  snapshotDate: timestamp('snapshot_date').notNull().defaultNow(),
})
