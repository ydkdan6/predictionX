# World Cup 2026 Predictor System - Implementation Overview

## Architecture Summary

This is a full-stack Next.js application built with:
- **Frontend**: Next.js 16 with React, TailwindCSS, shadcn/ui components
- **Backend**: Next.js API routes with Express-like routing
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Better Auth (email + password)
- **Real-time Updates**: ISR (Incremental Static Regeneration) for caching

---

## Database Schema

### Core Tables

**whatsapp_users**
- `wa_id` (text, PK) - WhatsApp user ID
- `username` (text, UNIQUE) - Player username
- `is_premium` (boolean) - Premium subscription status
- `total_points` (integer) - Cumulative points across all sprints
- `weekly_points` (integer) - Points in current 5-match sprint (resets after sprint completion)
- `created_at` (timestamp)

**fixtures**
- `api_fixture_id` (integer, PK) - RapidAPI fixture ID
- `home_team` / `away_team` (text) - Team names
- `kickoff_time` (timestamp) - Match start time
- `home_score` / `away_score` (integer, nullable) - Match results
- `is_finished` (boolean) - Settlement flag
- `match_number` (integer) - Sequential match counter (1, 2, 3, 4, 5, etc.)
- `created_at` (timestamp)

**predictions**
- `id` (serial, PK)
- `wa_id` (text, FK) - User making prediction
- `api_fixture_id` (integer, FK) - Target fixture
- `predicted_home_score` / `predicted_away_score` (integer)
- `created_at` (timestamp)
- UNIQUE(wa_id, api_fixture_id) - One prediction per user per fixture

**sprint_winners**
- `id` (serial, PK)
- `sprint_number` (integer) - Which 5-match cycle
- `winner_wa_id` / `winner_username` (text) - Top scorer of sprint
- `is_premium` (boolean) - Premium status at win time
- `points_earned` (integer) - Weekly points accumulated
- `jackpot_amount` (decimal) - Calculated as: (premium_user_count × 500 × 0.70)
- `created_at` (timestamp)

**leaderboard_snapshots** (For historical tracking)
- Stores weekly and final leaderboard states
- `snapshot_type` ('weekly' | 'final')
- Rank, username, points at snapshot time

---

## API Routes

### Public Endpoints

**GET /api/leaderboard**
- Query params: `type=weekly|final`, `isPremium=true|false`
- Returns: Sorted leaderboard, jackpot amount
- Caching: ISR 300s (5 minutes)

**GET /api/sprint-winners**
- Returns: Last 10 sprint winners with jackpot amounts
- Caching: ISR 300s (5 minutes)

### Protected Endpoints

**POST /api/admin/settle-match** (Bearer token required)
- Body: `{ api_fixture_id, home_score, away_score }`
- Logic:
  - Updates fixture with final scores
  - Calculates points for all predictions:
    - +1 for correct outcome (W/D/L)
    - +3 for exact scoreline match
  - Updates user `total_points` and `weekly_points`
  - After every 5 matches:
    - Identifies top user by `weekly_points`
    - Calculates jackpot: (premium_user_count × 500 × 0.70)
    - Registers sprint winner in DB
    - Resets all users' `weekly_points` to 0
    - Creates final leaderboard snapshots (premium users only)

**POST /api/webhooks/paystack** (Webhook signature validated)
- Event: `charge.success`
- Updates user: `is_premium = true`
- Metadata expected: `{ wa_id, ... }`

---

## Frontend Components

### Pages

**app/page.tsx**
- Main dashboard with Tabs (Leaderboard | Sprint Winners)
- Default view shows leaderboard

### Components

**Leaderboard (components/leaderboard.tsx)**
- Features:
  - Real-time jackpot counter (₦ = premium_count × 500 × 0.70)
  - Toggle: Weekly (all users) vs Final (premium only with overlay lock)
  - Client-side username search
  - Responsive table with rank, username, status badge, points
  - Upgrade modal for free users trying to access Final Leaderboard
- Props: `isPremium` boolean
- Data: Fetches from `/api/leaderboard`

**Sprint Winners (components/sprint-winners.tsx)**
- Displays last 10 sprint winners
- Shows: Sprint number, winner name, points earned, jackpot amount
- Medal badges (🥇🥈🥉) for top 3
- Data: Fetches from `/api/sprint-winners`

### Authentication (via Better Auth)
- Email + password sign-up / sign-in
- Session management with 7-day expiration
- Protected API routes can call `auth.api.getSession()`

---

## Key Business Logic

### Points Calculation
1. Admin settles a match via `/api/admin/settle-match`
2. For each user prediction:
   - If predicted_home == actual_home AND predicted_away == actual_away → +3 points
   - Else if predicted outcome (W/D/L) == actual outcome → +1 point
3. Points added to both `total_points` (cumulative) and `weekly_points` (sprint-specific)

### Sprint Cycle (Every 5 Matches)
- `match_number` field tracks sequential matches
- When `is_finished` count % 5 == 0:
  - Find top user by `weekly_points`
  - Calculate jackpot: (count of `is_premium=true` × 500 ₦ × 0.70)
  - 30% retained by founders, 70% distributed to winner
  - Register in `sprint_winners` table
  - Create final leaderboard snapshots
  - Reset all users' `weekly_points` to 0

### Leaderboard Visibility
- **Free Users**: See weekly leaderboard only (ranked by `weekly_points`)
- **Premium Users**: See both weekly AND final leaderboard (final ranked by `total_points`)
- Free users attempting final leaderboard see upgrade modal

### Premium Upgrade Flow
1. User initiates payment via Paystack
2. Payment success webhook → `/api/webhooks/paystack`
3. User marked `is_premium = true`
4. Jackpot immediately increases by 350₦ (500 × 0.70)
5. User gains access to Final Leaderboard

---

## Environment Variables Required

```
DATABASE_URL=postgresql://...   # Neon PostgreSQL
BETTER_AUTH_SECRET=...          # Min 32 chars, generated with: openssl rand -base64 32
ADMIN_BEARER_TOKEN=...          # For settlement endpoint auth
PAYSTACK_SECRET_KEY=...         # For webhook signature validation
PAYSTACK_PUBLIC_KEY=...         # For frontend payment UI
WHATSAPP_BOT_PHONE_NUMBER=...   # Bot's WhatsApp number
```

---

## Next Steps for WhatsApp Bot

The WhatsApp bot needs to be implemented separately (not included in this Next.js app) and should handle:

1. **Onboarding**: Register wa_id, create username, insert into `whatsapp_users`
2. **Prediction Input**: Validate kickoff time (must be within 1 hour before match), save to `predictions` table
3. **Match Broadcasts**: 3 hours before kickoff, notify users of upcoming matches
4. **Premium Upgrade Links**: Send Paystack payment links with metadata `{ wa_id }`
5. **Result Notifications**: After admin settles match, notify users of points earned

Recommended hosting: AWS EC2, Railway, or similar for persistent connection (Baileys requires always-on process).

---

## Testing Checklist

- [ ] Create test user via `/api/auth/sign-up`
- [ ] Insert test fixtures with `match_number` 1-5
- [ ] Add predictions for test user
- [ ] Call `/api/admin/settle-match` for each fixture (with valid Bearer token)
- [ ] Verify points accumulate in `weekly_points`
- [ ] Verify 5th match settlement resets weekly_points and creates sprint_winner record
- [ ] Test `/api/leaderboard` returns correct sorted data
- [ ] Test premium user toggle in UI (Final Leaderboard access)
- [ ] Test Paystack webhook updates `is_premium` status

---

## Key Files

```
lib/
  ├── auth.ts                    # Better Auth config
  ├── auth-client.ts             # Client auth hooks
  └── db/
      ├── index.ts               # Drizzle setup
      └── schema.ts              # All table definitions

app/
  ├── page.tsx                   # Main dashboard
  ├── api/
  │   ├── auth/[...all]/route.ts # Auth handler
  │   ├── leaderboard/route.ts   # Public leaderboard API
  │   ├── sprint-winners/route.ts # Sprint winners API
  │   ├── admin/
  │   │   └── settle-match/route.ts # Match settlement
  │   └── webhooks/
  │       └── paystack/route.ts  # Paystack webhook

components/
  ├── leaderboard.tsx            # Leaderboard UI
  └── sprint-winners.tsx         # Sprint winners UI
```

---

## Notes

- All timestamps stored in UTC
- WhatsApp user IDs stored as plain text (international format: +234XXXXXXXXXX)
- Premium users always have access to both leaderboards
- Jackpot calculation is real-time based on current premium user count
- Founder 30% cut automatically withheld; only 70% jackpot displayed to users
