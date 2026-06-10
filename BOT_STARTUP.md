# WhatsApp Bot Startup Guide

## Prerequisites

Before starting the bot, ensure you have:

1. **WhatsApp Account**
   - Personal WhatsApp account on the registered number: **07043710895**
   - The number should be active and able to receive messages

2. **Environment Variables Set**
   ```
   WHATSAPP_BOT_PHONE_NUMBER=07043710895
   PAYSTACK_PUBLIC_KEY=pk_live_697d9fbc1dbd43ec726108ba21f217be4a9869cc
   PAYSTACK_SECRET_KEY=<your_secret_key>
   DATABASE_URL=postgresql://...
   ADMIN_BEARER_TOKEN=<your_token>
   ```

3. **Database Connection**
   - Neon PostgreSQL must be running
   - All tables created (user, fixtures, predictions, etc.)
   - Connection string in DATABASE_URL

---

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Create Bot Startup Script
```bash
# Create startup file if not exists
touch lib/whatsapp/start.ts
```

### Step 3: Start the Bot
```bash
# Development mode with hot reload
pnpm bot:start

# Or with tsx directly
pnpm tsx lib/whatsapp/bot.ts
```

### Step 4: Link to Your WhatsApp Number
When you run the bot, you'll see:
```
[v0] QR Code generated. Scan with WhatsApp.
█████████████████████████████
█ ▄▄▄▄▄ █  ██ ▀ ▀██ ▄▄▄▄▄ █
█ █   █ █ ▀ ▀▀ ▄  █ █   █ █
█ █▄▄▄█ █▄▄███▀▀  █ █▄▄▄█ █
█▄▄▄▄▄▄▄█▀▄▀ ▀ ▀▀▄█▄▄▄▄▄▄▄█
█▀▀ ▀▀▄▄▀█▄▀▀ ▀▀  ▀▀▀▀ ▀ █
█████████████████████████████
```

**To link the bot to 07043710895:**

1. **On the phone with +234 7043710895:**
   - Open WhatsApp
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Use your computer camera to scan the QR code shown in terminal

2. **Once linked:**
   ```
   [v0] WhatsApp bot connected and ready.
   ```
   The bot is now active on that number!

---

## How the Bot Works After Starting

### Message Flow

```
User sends message to 07043710895
           ↓
Bot receives message
           ↓
Check if user is registered
           ↓
If registered: Process command
If new: Ask for username
           ↓
Execute command (predict, schedule, leaderboard, etc.)
           ↓
Send response to user
```

### Available Commands After Startup

Once the bot is running on the number:

| Command | What it does |
|---------|-------------|
| `register` | Create new account with username |
| `predict` | View available matches for prediction |
| `2-1` | Submit score prediction (format: HOME-AWAY) |
| `schedule` | View broadcast times for next 10 matches |
| `leaderboard` | View current standings |
| `my points` | Check your statistics |
| `premium` | Upgrade to premium (shows payment link) |
| `next matches` | See upcoming fixtures |
| `help` | Show all commands |

---

## Premium Payment Integration

### How Premium Works

When a user types `premium`:

1. **Bot checks if user is premium**
   - If yes: "💎 You are already a premium member!"
   - If no: Shows upgrade prompt with Paystack payment link

2. **Payment Link Format**
   ```
   https://checkout.paystack.com/pay/<PAYSTACK_PUBLIC_KEY>
   
   OR
   
   https://checkout.paystack.com/pay/?key=<PAYSTACK_PUBLIC_KEY>&email=<USER_EMAIL>&amount=50000
   ```

3. **After Payment**
   - Paystack webhook triggers at `/api/webhooks/paystack`
   - User is upgraded to premium
   - Bot notifies user: "✅ Welcome to premium! Enjoy exclusive features!"

### Premium Payment Flow (Updated)

The bot will now:

1. **Send payment initiation to user**
   ```
   💎 Upgrade to Premium for ₦500!
   
   Benefits:
   ✅ Access premium leaderboard
   ✅ Compete for jackpots
   ✅ Priority support
   
   💳 Pay here: [PAYMENT LINK]
   
   After payment, you'll be automatically upgraded!
   ```

2. **User clicks payment link** → Redirected to Paystack
3. **User completes payment** → Webhook confirms
4. **Bot receives confirmation** → User upgraded to premium

---

## Production Deployment

### Option 1: Railway (Recommended for Bot)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and create project
railway login
railway init

# 3. Deploy bot
railway up

# 4. Set environment variables in Railway dashboard
# WHATSAPP_BOT_PHONE_NUMBER=07043710895
# DATABASE_URL=...
# PAYSTACK_SECRET_KEY=...
```

### Option 2: AWS EC2

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone <your-repo>
cd /vercel/share/v0-project
pnpm install

# 4. Start bot with PM2 (for persistence)
pnpm install -g pm2
pm2 start --name whatsapp-bot "pnpm bot:start"
pm2 startup
pm2 save
```

### Option 3: Docker

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install
COPY . .
CMD ["pnpm", "bot:start"]
EOF

# Build and run
docker build -t whatsapp-bot .
docker run -e DATABASE_URL=$DATABASE_URL -e PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY whatsapp-bot
```

---

## Troubleshooting

### Issue: QR Code not appearing

**Solution:**
```bash
# Make sure Baileys auth info is clean
rm -rf baileys_auth_info

# Restart bot
pnpm bot:start
```

### Issue: Bot connects but doesn't respond to messages

**Solution 1:** Check database connection
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection
pnpm tsx -e "
import { db } from '@/lib/db'
import { whatsappUsers } from '@/lib/db/schema'
const users = await db.select().from(whatsappUsers)
console.log(users)
"
```

**Solution 2:** Check message handler
```bash
# Enable verbose logging
DEBUG=baileys* pnpm bot:start
```

### Issue: "WhatsApp bot disconnected"

**Solutions:**
1. Linked device was closed on phone - Rescan QR code
2. Multiple instances running - Kill other processes: `pkill -f bot:start`
3. Session expired - Delete `baileys_auth_info` and restart
4. Network issue - Check internet connection on server

### Issue: Premium upgrade not working

**Check webhook:**
```bash
# Verify webhook is configured in Paystack dashboard
# Go to https://dashboard.paystack.co/settings/developer
# Webhooks URL: https://yourdomain.com/api/webhooks/paystack

# Test webhook manually
curl -X POST http://localhost:3000/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test" \
  -d '{
    "event":"charge.success",
    "data":{
      "customer":{"email":"user@example.com"},
      "amount":50000
    }
  }'
```

---

## Monitoring the Bot

### Real-time Logs

```bash
# See all messages
pnpm bot:start 2>&1 | grep "\[v0\]"

# Monitor specific user
pnpm bot:start 2>&1 | grep "07043710895"
```

### Database Monitoring

```bash
# Check users
psql $DATABASE_URL -c "SELECT wa_id, unique_username, is_premium FROM whatsapp_users;"

# Check predictions
psql $DATABASE_URL -c "SELECT * FROM predictions LIMIT 10;"

# Monitor activity
watch -n 5 "psql $DATABASE_URL -c \"SELECT COUNT(*) FROM whatsapp_users; SELECT COUNT(*) FROM predictions;\""
```

---

## Daily Operations

### Sync Fixtures (Before Tournament)
```bash
pnpm fixtures:sync
```

### Settle Match Results
```bash
# After match is complete
pnpm match:settle
```

### Check Leaderboard
```bash
# API endpoint
curl http://localhost:3000/api/leaderboard
```

### View Next Broadcasts
```bash
# See what matches will be broadcast soon
pnpm tsx -e "
import { db } from '@/lib/db'
import { fixtures } from '@/lib/db/schema'
import { gte } from 'drizzle-orm'

const now = new Date()
const upcoming = await db
  .select()
  .from(fixtures)
  .where(gte(fixtures.kickoffTime, now))
  .limit(5)

console.log(upcoming)
"
```

---

## Testing Bot Locally

Before deploying, test everything locally:

```bash
# Terminal 1: Start dev server (for API)
pnpm dev

# Terminal 2: Start bot
pnpm bot:start

# Terminal 3: Create test user and send messages
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Then test bot by:
# 1. Scan QR code with your personal WhatsApp
# 2. Send "register" to start
# 3. Follow prompts
# 4. Test commands: predict, schedule, premium, etc.
```

---

## Performance Tips

1. **Use Process Manager (PM2)**
   ```bash
   pm2 start lib/whatsapp/bot.ts --name whatsapp-bot
   pm2 monit
   ```

2. **Enable Message Caching**
   - Bot automatically caches user state
   - No need for additional Redis

3. **Database Pooling**
   - Already configured in lib/db/index.ts
   - Max 20 connections

4. **Message Queuing**
   - For high volume, consider queue (Bull, RabbitMQ)
   - Current implementation handles ~100 msg/min

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Set environment variables
3. ✅ Start bot with `pnpm bot:start`
4. ✅ Scan QR code with WhatsApp on 07043710895
5. ✅ Test commands (register, predict, premium)
6. ✅ Deploy to Railway/EC2 for production
7. ✅ Configure Paystack webhook
8. ✅ Monitor logs and database

**Your bot is ready to receive World Cup predictions! 🚀**
