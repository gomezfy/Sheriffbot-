# 🔗 Discord Linked Roles Setup Guide

This guide explains how to set up and use Discord's Linked Roles feature with Sheriff Rex Bot.

## 📋 What are Linked Roles?

Linked Roles allow Discord servers to gate roles based on external data from your bot. For example:
- Require users to have 10,000+ coins to get a "Rich" role
- Require 50+ bounties captured for a "Bounty Hunter" role
- Require level 20+ for an "Elite" role

## 🎯 Available Metadata Fields

Sheriff Rex Bot provides these metadata fields for role requirements:

| Field | Description | Example Use |
|-------|-------------|-------------|
| **Total Coins** | User's total wealth in Silver Coins | Require 10,000+ coins for VIP role |
| **Total Tokens** | Saloon Tokens balance | Require 100+ tokens for Premium role |
| **Level** | Calculated level based on wealth | Require level 20+ for Elite role |
| **Bounties Captured** | Number of bounties captured | Require 50+ bounties for Hunter role |
| **Games Played** | Total gambling games played | Require 100+ games for Gambler role |
| **Mining Sessions** | Mining sessions completed | Require 25+ sessions for Miner role |

---

## 🚀 Setup Instructions

### Step 1: Configure Discord Application

1. **Go to Discord Developer Portal:**
   - Visit [https://discord.com/developers/applications](https://discord.com/developers/applications)
   - Select your Sheriff Rex Bot application

2. **Enable OAuth2:**
   - Go to **OAuth2** → **General**
   - Add a redirect URL:
     - Development: `http://localhost:3000/discord/callback`
     - Production: `https://your-domain.com/discord/callback`
   - Click **Save Changes**

3. **Get Client Secret:**
   - In **OAuth2** → **General**
   - Click **Reset Secret** (if needed)
   - Copy the **Client Secret** (you'll need this)

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# Required for Linked Roles
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/discord/callback

# Optional
LINKED_ROLES_PORT=3000
OWNER_ID=your_discord_user_id
```

**For Production:**
```bash
DISCORD_REDIRECT_URI=https://your-domain.com/discord/callback
NODE_ENV=production
```

### Step 3: Register Metadata Schema

This tells Discord what data fields are available:

```bash
# Install dependencies (if not already done)
npm install

# Register metadata with Discord
npm run register-metadata
```

**Expected Output:**
```
🔧 Registering Role Connection Metadata with Discord...

1️⃣ Getting bot access token...
✅ Access token obtained

2️⃣ Registering metadata schema...
✅ Metadata registered successfully!

📊 Registered Metadata Fields:
   1. Total Coins (total_coins)
      Total wealth in Silver Coins
   2. Total Tokens (total_tokens)
      Saloon Tokens balance
   ...

🎉 Setup Complete!
```

**To view current metadata:**
```bash
npm run register-metadata -- --view
```

### Step 4: Start Linked Roles Server

**Development:**
```bash
npm run linked-roles
```

**Production:**
```bash
# Build first
npm run build

# Then start
npm run linked-roles:prod
```

**Expected Output:**
```
🔗 Linked Roles server running on port 3000
📍 Verification URL: http://localhost:3000
🔧 Redirect URI: http://localhost:3000/discord/callback

⚙️  Configuration:
   Client ID: ✅ Set
   Client Secret: ✅ Set
   Redirect URI: http://localhost:3000/discord/callback
```

### Step 5: Configure Verification URL in Discord

1. **Go to Discord Developer Portal**
2. **Select your application**
3. **Go to Linked Roles**
4. **Set Verification URL:**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
5. **Click Save**

---

## 👥 User Verification Process

### For Users:

1. **Visit the verification URL:**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

2. **Click "Connect with Discord"**

3. **Authorize the application:**
   - Discord will ask for permission to access your account
   - Click "Authorize"

4. **View your statistics:**
   - You'll see your Sheriff Rex Bot stats
   - Your data is now linked to Discord

5. **Done!**
   - Server admins can now use your stats for role requirements

### For Server Admins:

1. **Create or edit a role**
2. **Go to "Links" tab**
3. **Click "Add Requirement"**
4. **Select "Sheriff Rex Bot"**
5. **Choose a metadata field** (e.g., "Total Coins")
6. **Set the requirement** (e.g., "Greater than or equal to 10000")
7. **Save the role**

Now users must verify and meet the requirement to get the role!

---

## 🔧 Deployment Options

### Option 1: Separate Server (Recommended)

Run the Linked Roles server separately from the bot:

**Terminal 1 (Bot):**
```bash
npm start
```

**Terminal 2 (Linked Roles):**
```bash
npm run linked-roles
```

### Option 2: Same Process

Modify `src/index.ts` to include the Linked Roles server:

```typescript
// At the end of src/index.ts
if (process.env.ENABLE_LINKED_ROLES === 'true') {
  const linkedRolesApp = require('./linked-roles-server').default;
  // Server will start automatically
}
```

Then set in `.env`:
```bash
ENABLE_LINKED_ROLES=true
```

### Option 3: Cloud Hosting

**Vertra Cloud:**
1. Deploy bot normally
2. Create second app for Linked Roles server
3. Set environment variables in both
4. Use Vertra domain for DISCORD_REDIRECT_URI

**Heroku:**
```bash
# Create two apps
heroku create sheriffbot-main
heroku create sheriffbot-linked-roles

# Deploy bot to first app
git push heroku main

# Deploy Linked Roles to second app
# (configure Procfile to run linked-roles server)
```

---

## 🧪 Testing

### Test Locally:

1. **Start the server:**
   ```bash
   npm run linked-roles
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Click "Connect with Discord"**

4. **Authorize and verify your stats appear**

### Test Metadata Registration:

```bash
# View current metadata
npm run register-metadata -- --view

# Re-register if needed
npm run register-metadata
```

### Test API Endpoint:

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","service":"Sheriff Rex Linked Roles","timestamp":"..."}
```

---

## 🐛 Troubleshooting

### Error: "Invalid redirect_uri"

**Problem:** Discord doesn't recognize your redirect URI

**Solution:**
1. Check `.env` file: `DISCORD_REDIRECT_URI` matches exactly
2. Check Developer Portal: Redirect URI is added in OAuth2 settings
3. No trailing slashes: Use `/discord/callback` not `/discord/callback/`

### Error: "Invalid client_secret"

**Problem:** Client secret is wrong or not set

**Solution:**
1. Check `.env` file: `DISCORD_CLIENT_SECRET` is set
2. Reset secret in Developer Portal if needed
3. Update `.env` with new secret

### Error: "Metadata not found"

**Problem:** Metadata schema not registered

**Solution:**
```bash
npm run register-metadata
```

### Error: "User data not found"

**Problem:** User hasn't used the bot yet

**Solution:**
- User must use bot commands first (e.g., `/daily`, `/profile`)
- Data is created on first command usage

### Server won't start

**Problem:** Port already in use

**Solution:**
```bash
# Change port in .env
LINKED_ROLES_PORT=3001

# Or kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📊 Example Role Requirements

### VIP Role
- **Requirement:** Total Coins ≥ 50,000
- **Description:** "Wealthy members with 50k+ coins"

### Elite Role
- **Requirement:** Level ≥ 25
- **Description:** "High-level players"

### Bounty Hunter Role
- **Requirement:** Bounties Captured ≥ 50
- **Description:** "Captured 50+ bounties"

### Gambler Role
- **Requirement:** Games Played ≥ 100
- **Description:** "Played 100+ gambling games"

### Miner Role
- **Requirement:** Mining Sessions ≥ 25
- **Description:** "Completed 25+ mining sessions"

### Legendary Role (Multiple Requirements)
- **Requirement 1:** Total Coins ≥ 100,000
- **Requirement 2:** Level ≥ 50
- **Requirement 3:** Bounties Captured ≥ 100
- **Description:** "True legends of the Wild West"

---

## 🔒 Security & Privacy

### Data Collected:
- Discord User ID (for linking)
- Bot statistics (coins, tokens, level, etc.)

### Data NOT Collected:
- Real names
- Email addresses
- Private messages
- IP addresses

### Data Storage:
- Stored in bot's database (JSON files)
- Only accessible by bot owner
- Can be deleted on request

### OAuth Scopes:
- `identify` - Get user's Discord ID
- `role_connections.write` - Update role connection data

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for full details.

---

## 📚 Additional Resources

- **Discord Linked Roles Docs:** [https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles](https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles)
- **OAuth2 Guide:** [https://discord.com/developers/docs/topics/oauth2](https://discord.com/developers/docs/topics/oauth2)
- **Sheriff Rex Docs:** [README.md](./README.md)

---

## 🆘 Support

Need help?
- **GitHub Issues:** [https://github.com/gomezfy/Sheriffbot-/issues](https://github.com/gomezfy/Sheriffbot-/issues)
- **Documentation:** [README.md](./README.md)

---

**Happy linking! 🤠**

Last Updated: October 23, 2025
