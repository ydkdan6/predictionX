# ⚡ Quick Start Guide

Get the World Cup Predictor running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm i -g pnpm`)
- A Neon PostgreSQL database (free)
- Vercel account (optional, for deployment)

## Step 1: Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd world-cup-predictor

# Install dependencies
pnpm install
```

## Step 2: Environment Variables

Create `.env.local` in the project root:

```bash
# Generate auth secret
openssl rand -base64 32
# Copy output to BETTER_AUTH_SECRET below

cat > .env.local << 'EOF'
# Database (from Neon dashboard)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_generated_secret_here

# Admin operations (any secure random string)
ADMIN_BEARER_TOKEN=your_admin_token_here

# Paystack (from paystack.com dashboard)
PAYSTACK_PUBLIC_KEY=pk_live_697d9fbc1dbd43ec726108ba21f217be4a9869cc
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx

# WhatsApp Bot
WHATSAPP_BOT_PHONE_NUMBER=07043710895
EOF
```

## Step 3: Database Setup

The database tables are already created in Neon. Verify your connection:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

If successful, you'll see the PostgreSQL version.

## Step 4: Run Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:3000 in browser
```

You should see:
- ✅ "2026 World Cup Predictor" heading
- ✅ "Leaderboard" tab (selected)
- ✅ "Sprint Winners" tab
- ✅ Purple jackpot counter showing "₦0"
- ✅ "Weekly Leaderboard" button
- ✅ Search player input
- ✅ Empty leaderboard table

## Step 5: Test the System

### Add Test Data

```bash
# Create a test user
psql $DATABASE_URL << 'EOF'
INSERT INTO whatsapp_users (wa_id, unique_username, is_premium, total_points, weekly_points)
VALUES ('+234123456789', 'test_player', false, 0, 0);
EOF

# Add test matches
psql $DATABASE_URL << 'EOF'
INSERT INTO fixtures (api_fixture_id, home_team, away_team, kickoff_time, match_number, is_finished)
VALUES
  (1001, 'Nigeria', 'Egypt', NOW() + INTERVAL '1 day', 1, false),
  (1002, 'France', 'Spain', NOW() + INTERVAL '2 days', 2, false),
  (1003, 'Brazil', 'Argentina', NOW() + INTERVAL '3 days', 3, false),
  (1004, 'Germany', 'Portugal', NOW() + INTERVAL '4 days', 4, false),
  (1005, 'England', 'Italy', NOW() + INTERVAL '5 days', 5, false);
EOF

# Add predictions
psql $DATABASE_URL << 'EOF'
INSERT INTO predictions (wa_id, api_fixture_id, predicted_home_score, predicted_away_score)
VALUES
  ('+234123456789', 1001, 2, 1),
  ('+234123456789', 1002, 1, 1),
  ('+234123456789', 1003, 3, 0),
  ('+234123456789', 1004, 2, 2),
  ('+234123456789', 1005, 1, 2);
EOF
```

### Settle Matches

```bash
# Settle match 1 (exact score match: +3 points)
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_fixture_id": 1001,
    "home_score": 2,
    "away_score": 1
  }'

# Settle match 2 (correct outcome only: +1 point)
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_fixture_id": 1002,
    "home_score": 2,
    "away_score": 1
  }'

# Continue for matches 3-5...
curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_fixture_id": 1003, "home_score": 3, "away_score": 0}'

curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_fixture_id": 1004, "home_score": 2, "away_score": 2}'

curl -X POST http://localhost:3000/api/admin/settle-match \
  -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_fixture_id": 1005, "home_score": 1, "away_score": 2}'
```

### Check Leaderboard

```bash
# View in browser
open http://localhost:3000

# Or via API
curl "http://localhost:3000/api/leaderboard?type=weekly" | jq .
```

You should see:
- Test player at rank 1 with 10 points (3+1+3+2+1)
- Sprint winner registered (5th match completion)

## Available Commands

### Frontend
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Run production server
pnpm lint       # Check for lint errors
```

### WhatsApp Bot
```bash
pnpm bot:start  # Start WhatsApp bot (requires QR code scan)
```

### Management
```bash
pnpm fixtures:sync      # Sync fixtures from TheSportsDB
pnpm fixtures:list      # View upcoming matches
pnpm match:settle       # Settle a match (manual)
pnpm bot:manage         # Show all management commands
```

## Project Structure

```
Root files:
├── README.md              ← Full documentation
├── SYSTEM_OVERVIEW.md     ← Architecture details
├── DEPLOYMENT.md          ← Production setup
├── QUICKSTART.md          ← This file
├── .env.local             ← Your secrets (git ignored)
├── package.json           ← Dependencies & scripts
│
Frontend:
├── app/
│   ├── page.tsx           ← Main dashboard
│   ├── api/
│   │   ├── leaderboard/   ← Public leaderboard
│   │   ├── sprint-winners/← Sprint winners
│   │   ├── admin/settle-match/ ← Match settlement (protected)
│   │   └── webhooks/paystack/  ← Payment webhook
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── layout.tsx
│
├── components/
│   ├── leaderboard.tsx    ← Leaderboard UI
│   ├── sprint-winners.tsx ← Sprint UI
│   └── ui/                ← shadcn components
│
Backend:
├── lib/
│   ├── auth.ts            ← Auth configuration
│   ├── db/                ← Database layer
│   ├── whatsapp/bot.ts    ← WhatsApp bot
│   ├── services/          ← Business logic
│   └── utils/             ← Helpers
│
├── scripts/
│   └── manage-bot.ts      ← CLI tool
```

## Deploying

### Deploy Frontend to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com, import GitHub repo
# 3. Set environment variables in project settings
# 4. Deploy automatically on git push
```

### Deploy WhatsApp Bot

Choose one platform:

**Railway** (recommended):
```bash
# Install Railway CLI
brew install railway

# Login and create project
railway login
railway create

# Deploy
railway up
```

**Heroku** (deprecated but works):
```bash
heroku login
heroku create your-app-name
git push heroku main
```

**AWS EC2** (most control):
```bash
# Launch Ubuntu instance
# SSH in, then:
git clone <repo>
cd world-cup-predictor
pnpm install
pnpm bot:start
```

## Common Issues

### "DATABASE_URL is invalid"
- Check connection string format: `postgresql://user:password@host:5432/dbname`
- Verify credentials in Neon dashboard
- Test: `psql $DATABASE_URL -c "SELECT 1;"`

### "BETTER_AUTH_SECRET not set"
- Generate one: `openssl rand -base64 32`
- Add to `.env.local`
- Restart dev server

### "Cannot connect to bot"
- Clear auth: `rm -rf baileys_auth_info/`
- Restart: `pnpm bot:start`
- Rescan QR code

### "Points not updating"
- Verify `ADMIN_BEARER_TOKEN` matches env var
- Check fixture exists: `psql $DATABASE_URL -c "SELECT * FROM fixtures;"`
- Check bearer token: `curl -H "Authorization: Bearer $ADMIN_BEARER_TOKEN" http://localhost:3000/api/leaderboard`

## What's Next?

1. **Read the docs**: Check README.md for full feature list
2. **Test more flows**: Add users, make predictions, settle matches
3. **Customize**: Modify colors, add your branding
4. **Deploy**: Follow DEPLOYMENT.md for production setup
5. **Launch**: Promote to users!

## Need Help?

- 📖 Full docs: [README.md](./README.md)
- 🏗️ Architecture: [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)
- 🚀 Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: Check existing issues or create new one

## Next Steps

Now that you're up and running:

1. ✅ Verify leaderboard loads (http://localhost:3000)
2. ✅ Test with sample data (see Step 5 above)
3. ✅ Try settling a match
4. ✅ Check points accumulated
5. ✅ Build WhatsApp bot
6. ✅ Deploy frontend to Vercel
7. ✅ Deploy bot to Railway/EC2
8. ✅ Launch to users!

---

Questions? See the [full documentation](./README.md) or check [DEPLOYMENT.md](./DEPLOYMENT.md).

Happy predicting! ⚽🎯
