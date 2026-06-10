# ⚽ World Cup 2026 Predictor

A full-stack WhatsApp prediction game for the 2026 FIFA World Cup. Users predict match outcomes, accumulate points, and compete on leaderboards with the chance to win cash jackpots.

**Live Features:**
- 🏆 Weekly & Final leaderboards
- 💎 Premium subscriptions with exclusive features
- 🎯 Points system: +1 for correct outcome, +3 for exact score
- 🏅 Sprint winners (every 5 matches) with ₦ jackpots
- 📱 WhatsApp bot integration
- 💳 Paystack payment processing
- 📊 Real-time leaderboard with ISR caching

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Neon PostgreSQL database (free tier available)
- Vercel account (for deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# - DATABASE_URL from Neon dashboard
# - BETTER_AUTH_SECRET: openssl rand -base64 32
# - ADMIN_BEARER_TOKEN: any secure random string
# - Paystack keys from paystack.com
# - WhatsApp phone number
```

### Run Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

## Project Structure

```
.
├── app/
│   ├── page.tsx                    # Main leaderboard dashboard
│   ├── sign-in/page.tsx            # Login page
│   ├── sign-up/page.tsx            # Registration page
│   └── api/
│       ├── auth/[...all]/route.ts  # Authentication endpoints
│       ├── leaderboard/route.ts    # Public leaderboard API
│       ├── sprint-winners/route.ts # Sprint winners API
│       ├── admin/settle-match/route.ts  # Match settlement (protected)
│       └── webhooks/paystack/route.ts   # Payment webhook
├── components/
│   ├── leaderboard.tsx             # Leaderboard UI component
│   ├── sprint-winners.tsx          # Sprint winners display
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── auth.ts                     # Better Auth configuration
│   ├── auth-client.ts              # Auth client hooks
│   ├── db/
│   │   ├── index.ts                # Drizzle ORM setup
│   │   └── schema.ts               # Database schema
│   ├── whatsapp/
│   │   └── bot.ts                  # WhatsApp bot (Baileys)
│   ├── services/
│   │   └── fixtures.ts             # World Cup fixtures service
│   └── utils/
│       └── predictor.ts            # Helper utilities
├── scripts/
│   └── manage-bot.ts               # CLI management tool
├── public/                         # Static assets
├── SYSTEM_OVERVIEW.md              # Detailed architecture
├── DEPLOYMENT.md                   # Deployment guide
└── README.md                       # This file
```

## Core Features

### 1. Leaderboard System

**Weekly Leaderboard**
- All users ranked by `weekly_points`
- Resets every 5 matches (sprint completion)
- Visible to free and premium users

**Final Leaderboard**
- Premium users only (locked for free users)
- Ranked by cumulative `total_points`
- Never resets
- Exclusive premium feature

**Live Jackpot Counter**
```
Jackpot Amount = (Premium Users × ₦500) × 0.70
```

### 2. Points System

Points awarded when match is settled:

| Achievement | Points |
|-------------|--------|
| Correct outcome (W/D/L) | +1 |
| Exact scoreline match | +3 |
| Both (exact score includes outcome) | +3 (not +4) |

### 3. Sprint Cycles

Every 5 matches:
1. Top user by `weekly_points` declared as winner
2. Jackpot calculated and recorded
3. All users' `weekly_points` reset to 0
4. New sprint begins

**Jackpot Distribution:**
- 70% → Sprint winner
- 30% → Founders (retained)

### 4. Premium System

**Benefits:**
- Access to Final Leaderboard
- Contribute to jackpot pool (₦500)
- Higher prestige on leaderboards

**Payment:**
- ₦500 via Paystack
- One-time payment
- Webhook auto-processing

### 5. WhatsApp Bot

Commands:
```
register       - Create account with username
help           - Show all commands
predict        - Make predictions for upcoming matches
leaderboard    - View top 10 players
my points      - Check personal score and status
next matches   - See upcoming World Cup fixtures
premium        - Upgrade to premium (₦500)
```

**Features:**
- 1-hour prediction window before kickoff
- Real-time points notifications
- Premium upgrade with payment link
- 3-hour pre-match broadcast

## API Reference

### GET /api/leaderboard

Returns ranked users by points.

**Query Parameters:**
- `type` - `weekly` (default) or `final`
- `isPremium` - `true` to filter premium users only

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wa_id": "+234XXXXXXXXXX",
      "username": "top_player",
      "is_premium": true,
      "points": 45,
      "total_points": 150
    }
  ],
  "board_type": "weekly",
  "total_users": 250,
  "premium_users": 15,
  "jackpot_amount": 5250
}
```

**Caching:** 5-minute ISR (Incremental Static Regeneration)

### GET /api/sprint-winners

Returns the last 10 sprint winners.

**Response:**
```json
{
  "sprint_winners": [
    {
      "sprint_number": 1,
      "winner_wa_id": "+234XXXXXXXXXX",
      "winner_username": "champion",
      "is_premium": true,
      "points_earned": 25,
      "jackpot_amount": "5250.00",
      "created_at": "2026-06-10T10:00:00Z"
    }
  ],
  "total_sprints": 1
}
```

### POST /api/admin/settle-match

Settles a completed match and awards points.

**Authentication:** Bearer token required

**Request:**
```json
{
  "api_fixture_id": 123456,
  "home_score": 2,
  "away_score": 1
}
```

**Response:**
```json
{
  "message": "Match settled successfully",
  "fixture": {
    "api_fixture_id": 123456,
    "home_team": "Nigeria",
    "away_team": "Egypt",
    "result": "2-1"
  },
  "points_distributed": {
    "+234XXXXXXXXXX": 3,
    "+234YYYYYYYYYY": 1
  },
  "sprint_info": {
    "sprint_number": 1,
    "winner": "top_player",
    "winner_wa_id": "+234XXXXXXXXXX",
    "jackpot_amount": "5250.00"
  }
}
```

### POST /api/webhooks/paystack

Webhook endpoint for Paystack payment verification.

**Webhook Event:** `charge.success`

**Configure in Paystack Dashboard:**
1. Go to Settings → API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Select events: `charge.success`, `charge.failed`

## Database Schema

See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md#database-schema-details) for complete schema documentation.

**Key Tables:**
- `whatsapp_users` - Player profiles with points
- `fixtures` - World Cup matches from TheSportsDB
- `predictions` - User predictions
- `sprint_winners` - Sprint completion records
- `leaderboard_snapshots` - Historical snapshots

## Deployment

### To Vercel

```bash
# Using Vercel CLI
vercel deploy --prod

# Or push to GitHub for auto-deployment
git push origin main
```

### WhatsApp Bot

The bot requires an always-on server. Options:

- **Railway.app** (recommended for beginners)
- **AWS EC2** (more control, slight cost)
- **Heroku** (deprecated but works)
- **DigitalOcean** (affordable)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Fixture Sync

Schedule fixture synchronization from TheSportsDB:

**Via GitHub Actions** (free):
```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

**Via Vercel Cron** (built-in):
```typescript
export const config = { runtime: 'nodejs' }
export default async function handler(req: Request) {
  await fetchWorldCupFixtures()
  return new Response('Synced')
}
```

## Management Commands

Use the CLI tool for admin operations:

```bash
# Start WhatsApp bot
pnpm tsx scripts/manage-bot.ts start

# Sync fixtures from TheSportsDB
pnpm tsx scripts/manage-bot.ts sync-fixtures

# Settle a match
pnpm tsx scripts/manage-bot.ts settle 123456 2 1

# List upcoming matches
pnpm tsx scripts/manage-bot.ts list-fixtures
```

## Environment Variables

Required for development and production:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
BETTER_AUTH_SECRET=<32+ char random string>

# Admin Operations
ADMIN_BEARER_TOKEN=<secure token for settlement API>

# Paystack (Payments)
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_... (keep secret!)

# WhatsApp Bot
WHATSAPP_BOT_PHONE_NUMBER=07043710895

# TheSportsDB (World Cup Data)
THESPORTSDB_API=https://www.thesportsdb.com/api/v1/json/3
```

Generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Testing

### Test Workflow

1. **Create test user:**
   ```bash
   # Via WhatsApp: register and set username
   # Or manually in database:
   psql $DATABASE_URL -c "INSERT INTO whatsapp_users (wa_id, unique_username) VALUES ('+234123456789', 'test_player');"
   ```

2. **Add test fixtures:**
   ```bash
   pnpm tsx scripts/manage-bot.ts sync-fixtures
   ```

3. **Make predictions:**
   ```bash
   psql $DATABASE_URL -c "
   INSERT INTO predictions (wa_id, api_fixture_id, predicted_home_score, predicted_away_score) VALUES
   ('+234123456789', 1001, 2, 1);
   "
   ```

4. **Settle match:**
   ```bash
   pnpm tsx scripts/manage-bot.ts settle 1001 2 1
   ```

5. **Verify points:**
   ```bash
   curl "http://localhost:3000/api/leaderboard?type=weekly"
   ```

### Test Paystack Payment

Use Paystack test card:
- Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

## Performance

- **Frontend:** ISR caching with 5-minute revalidation
- **Database:** Connection pooling via Neon
- **API:** Lightweight endpoints with minimal queries
- **Leaderboard:** Pre-sorted with pagination support

**Recommended Indexes:**
```sql
CREATE INDEX idx_predictions_fixture ON predictions(api_fixture_id);
CREATE INDEX idx_whatsapp_premium ON whatsapp_users(is_premium);
CREATE INDEX idx_fixtures_finished ON fixtures(is_finished);
```

## Architecture

```
WhatsApp Users
    ↓
[WhatsApp Bot] ← → [Next.js Frontend] ← → [Next.js API]
                                          ↓
                                    [Neon PostgreSQL]
                                    [TheSportsDB API]
```

For detailed architecture, see [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md).

## Troubleshooting

### Bot won't connect to WhatsApp
```bash
rm -rf baileys_auth_info/
pnpm tsx scripts/manage-bot.ts start
# Rescan QR code
```

### Database connection error
Check `DATABASE_URL` format:
```
postgresql://user:password@host:5432/dbname
```

### Points not updating
1. Verify `ADMIN_BEARER_TOKEN` in settlement request
2. Confirm fixture exists: `pnpm tsx scripts/manage-bot.ts list-fixtures`
3. Check database: `psql $DATABASE_URL -c "SELECT * FROM fixtures;"`

### Leaderboard shows no users
Ensure `whatsapp_users` table is populated:
```sql
SELECT COUNT(*) FROM whatsapp_users;
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more solutions.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

- 📖 [System Overview](./SYSTEM_OVERVIEW.md) - Architecture deep-dive
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Production setup
- 💬 WhatsApp issues? Check bot logs with `pm2 logs whatsapp-bot`
- 🐛 Found a bug? Open an issue on GitHub

## Next Steps

1. Deploy frontend to Vercel
2. Set up WhatsApp bot on Railway/EC2
3. Configure Paystack webhook
4. Test with first 5 matches
5. Launch to users!

---

Built with ❤️ for the 2026 World Cup
