# World Cup 2026 Predictor - Deployment Guide

## Quick Start

### 1. Environment Setup

First, set all required environment variables in your Vercel project or `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
BETTER_AUTH_SECRET=<32+ char random string>  # Generate: openssl rand -base64 32

# Admin Operations
ADMIN_BEARER_TOKEN=<secure random token>

# Paystack (Payment Processing)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# WhatsApp Bot Configuration
WHATSAPP_BOT_PHONE_NUMBER=+234XXXXXXXXXX
```

### 2. Database Setup

The database tables are created via Neon MCP SQL execution (already done in this build). To verify:

```bash
# From Neon dashboard or psql:
psql $DATABASE_URL -c "\dt"
```

You should see these tables:
- `user`, `session`, `account`, `verification` (Better Auth)
- `whatsapp_users`, `fixtures`, `predictions`, `sprint_winners`, `leaderboard_snapshots`

### 3. Local Development

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel

Using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel
```

Or connect GitHub and deploy from git push.

---

## API Endpoints

### Public APIs (No Auth)

**GET /api/leaderboard**
```bash
# Get weekly leaderboard
curl "http://localhost:3000/api/leaderboard?type=weekly"

# Get final leaderboard (premium users)
curl "http://localhost:3000/api/leaderboard?type=final&isPremium=true"
```

Response:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wa_id": "+234XXXXXXXXXX",
      "username": "player_name",
      "is_premium": true,
      "points": 45,
      "total_points": 150
    }
  ],
  "board_type": "weekly",
  "total_users": 10,
  "premium_users": 3,
  "jackpot_amount": 1050
}
```

**GET /api/sprint-winners**
```bash
curl "http://localhost:3000/api/sprint-winners"
```

Response:
```json
{
  "sprint_winners": [
    {
      "sprint_number": 1,
      "winner_wa_id": "+234XXXXXXXXXX",
      "winner_username": "top_player",
      "is_premium": true,
      "points_earned": 25,
      "jackpot_amount": "1050.00",
      "created_at": "2026-06-10T10:00:00Z"
    }
  ],
  "total_sprints": 1
}
```

### Protected APIs (Require Bearer Token)

**POST /api/admin/settle-match**
```bash
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer YOUR_ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_fixture_id": 123456,
    "home_score": 2,
    "away_score": 1
  }'
```

Response:
```json
{
  "message": "Match settled successfully",
  "fixture": {
    "api_fixture_id": 123456,
    "home_team": "Team A",
    "away_team": "Team B",
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
    "jackpot_amount": "1050.00"
  }
}
```

### Webhooks

**POST /api/webhooks/paystack**

Automatic endpoint for Paystack payment verification. Configure in Paystack dashboard:
- Webhook URL: `https://yourdomain.com/api/webhooks/paystack`
- Events: `charge.success`, `charge.failed`

Expected payload includes:
```json
{
  "event": "charge.success",
  "data": {
    "reference": "pref_xxxxxxx",
    "metadata": {
      "wa_id": "+234XXXXXXXXXX"
    }
  }
}
```

---

## WhatsApp Bot Integration

The Next.js app handles the backend APIs and leaderboard. You'll need to build a separate WhatsApp bot using Baileys or a service like Twilio.

### Bot Flow

1. **User Registration**: `/api/` expects POST to create `whatsapp_users` record
   ```json
   {
     "wa_id": "+234XXXXXXXXXX",
     "username": "chosen_username"
   }
   ```

2. **Prediction Input**: Bot validates and POSTs to create `predictions` record
   ```json
   {
     "wa_id": "+234XXXXXXXXXX",
     "api_fixture_id": 123456,
     "predicted_home_score": 2,
     "predicted_away_score": 1
   }
   ```

3. **Match Settlement**: Admin calls `/api/admin/settle-match` with Bearer token

4. **Points Notification**: Bot retrieves updated user points from DB

5. **Premium Upgrade**: Bot includes Paystack payment link with metadata:
   ```
   https://checkout.paystack.com/...?metadata={"wa_id":"+234XXXXXXXXXX"}
   ```

### Recommended Bot Packages

- **Baileys**: Full WhatsApp Web automation (requires always-on server)
- **Twilio**: Managed WhatsApp API (easier hosting)
- **Interakt** / **MessageBird**: WhatsApp Business APIs

---

## Testing Workflow

### 1. Create a Test User

Go to http://localhost:3000/sign-up and create an account, or use API:
```bash
# Create user manually in DB:
psql $DATABASE_URL -c "INSERT INTO whatsapp_users (wa_id, unique_username, is_premium) VALUES ('+234123456789', 'test_player', false);"
```

### 2. Add Test Fixtures

```bash
psql $DATABASE_URL -c "
INSERT INTO fixtures (api_fixture_id, home_team, away_team, kickoff_time, match_number) VALUES
  (1001, 'Nigeria', 'Egypt', NOW() + INTERVAL '1 day', 1),
  (1002, 'France', 'Spain', NOW() + INTERVAL '2 days', 2),
  (1003, 'Brazil', 'Argentina', NOW() + INTERVAL '3 days', 3),
  (1004, 'Germany', 'Portugal', NOW() + INTERVAL '4 days', 4),
  (1005, 'England', 'Italy', NOW() + INTERVAL '5 days', 5);
"
```

### 3. Add Predictions

```bash
psql $DATABASE_URL -c "
INSERT INTO predictions (wa_id, api_fixture_id, predicted_home_score, predicted_away_score) VALUES
  ('+234123456789', 1001, 2, 1),
  ('+234123456789', 1002, 1, 1),
  ('+234123456789', 1003, 3, 0),
  ('+234123456789', 1004, 2, 2),
  ('+234123456789', 1005, 1, 2);
"
```

### 4. Settle Matches

```bash
# Settle match 1 (exact score)
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_fixture_id": 1001, "home_score": 2, "away_score": 1}'

# Settle match 2 (correct outcome only)
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_fixture_id": 1002, "home_score": 2, "away_score": 1}'

# ... continue for matches 3-5
```

### 5. Check Leaderboard

```bash
curl "http://localhost:3000/api/leaderboard?type=weekly"
```

Expected: Test user should appear with accumulated points.

### 6. Upgrade to Premium & Check Jackpot

```bash
# Update user to premium
psql $DATABASE_URL -c "UPDATE whatsapp_users SET is_premium = true WHERE wa_id = '+234123456789';"

# Check leaderboard jackpot (should be 350 for 1 premium user)
curl "http://localhost:3000/api/leaderboard?type=final&isPremium=true"
```

---

## Monitoring & Maintenance

### Key Database Queries

```sql
-- Check all users
SELECT wa_id, unique_username, is_premium, total_points, weekly_points FROM whatsapp_users;

-- Check pending matches (not settled)
SELECT api_fixture_id, home_team, away_team, is_finished FROM fixtures WHERE is_finished = false;

-- Check user predictions for a fixture
SELECT p.wa_id, u.unique_username, p.predicted_home_score, p.predicted_away_score 
FROM predictions p
JOIN whatsapp_users u ON p.wa_id = u.wa_id
WHERE p.api_fixture_id = 1001;

-- View sprint winners history
SELECT sprint_number, winner_username, is_premium, jackpot_amount, created_at FROM sprint_winners ORDER BY sprint_number DESC;

-- Count premium users (for jackpot calculations)
SELECT COUNT(*) as premium_count FROM whatsapp_users WHERE is_premium = true;
```

### Performance Optimization

- **Leaderboard caching**: 5-minute ISR revalidation
- **Database indexes**: Consider adding on `wa_id`, `api_fixture_id`, `is_premium`
- **Connection pooling**: Neon supports up to 100 concurrent connections (v0 auto-configured)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `BETTER_AUTH_SECRET not set` | Add to env vars - generate with `openssl rand -base64 32` |
| `DATABASE_URL invalid` | Check Neon connection string in integrations panel |
| `Admin settle-match returns 401` | Verify `ADMIN_BEARER_TOKEN` header and env var match |
| `Paystack webhook not triggering` | Configure webhook URL in Paystack dashboard settings |
| `Leaderboard shows 0 users` | Check `whatsapp_users` table is populated in DB |
| `Points not updating` | Verify `api_fixture_id` matches fixture table IDs exactly |

---

## Support

For help:
1. Check `SYSTEM_OVERVIEW.md` for architecture details
2. Review API response error messages (include in logs)
3. Use Neon dashboard to inspect database state
4. Check Vercel logs: `vercel logs <project>`

