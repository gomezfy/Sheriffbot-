/**
 * Linked Roles Verification Server
 * Enables Discord Linked Roles integration for Sheriff Rex Bot
 * 
 * This server provides OAuth2 endpoints for Discord's Linked Roles feature,
 * allowing servers to use bot data as role requirements.
 */

import express, { Request, Response } from 'express';
import session from 'express-session';
import axios from 'axios';
import crypto from 'crypto';
import { readData } from './utils/database';

const app = express();
const PORT = parseInt(process.env.LINKED_ROLES_PORT || '5000');

// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  redirectUri: process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/discord/callback`,
  apiEndpoint: 'https://discord.com/api/v10',
  scopes: ['identify', 'role_connections.write']
};

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Extend session type
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    accessToken?: string;
    state?: string;
  }
}

/**
 * Get Discord OAuth2 access token
 */
async function getDiscordAccessToken(code: string): Promise<any> {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    client_secret: DISCORD_CONFIG.clientSecret,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: DISCORD_CONFIG.redirectUri
  });

  try {
    const response = await axios.post(
      `${DISCORD_CONFIG.apiEndpoint}/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting Discord access token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Discord user info
 */
async function getDiscordUser(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${DISCORD_CONFIG.apiEndpoint}/users/@me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting Discord user:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update user's role connection metadata
 */
async function updateRoleConnectionMetadata(userId: string, accessToken: string, metadata: any): Promise<void> {
  try {
    await axios.put(
      `${DISCORD_CONFIG.apiEndpoint}/users/@me/applications/${DISCORD_CONFIG.clientId}/role-connection`,
      {
        platform_name: 'Sheriff Rex Bot',
        platform_username: userId,
        metadata: metadata
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Updated role connection for user ${userId}`);
  } catch (error: any) {
    console.error('Error updating role connection:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get user metadata from bot database
 */
function getUserMetadata(userId: string): any {
  const economyData = readData('economy.json');
  const userData = economyData[userId];
  
  if (!userData) {
    return {
      total_coins: 0,
      total_tokens: 0,
      level: 0,
      bounties_captured: 0,
      games_played: 0,
      mining_sessions: 0
    };
  }

  // Calculate total wealth
  const totalCoins = (userData.silverCoins || 0) + (userData.goldBars || 0) * 100;
  const totalTokens = userData.saloonTokens || 0;
  
  // Calculate level based on total wealth
  const level = Math.floor((totalCoins + totalTokens * 10) / 1000);
  
  // Get statistics
  const bountiesCaptured = userData.bountiesCaptured || 0;
  const gamesPlayed = userData.gamesPlayed || 0;
  const miningSessions = userData.miningSessions || 0;

  return {
    total_coins: totalCoins,
    total_tokens: totalTokens,
    level: level,
    bounties_captured: bountiesCaptured,
    games_played: gamesPlayed,
    mining_sessions: miningSessions
  };
}

// Routes

/**
 * Home page - Verification instructions
 */
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sheriff Rex - Linked Roles</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 { 
          font-size: 2.5em; 
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .emoji { font-size: 3em; margin-bottom: 20px; }
        a.button {
          display: inline-block;
          background: #5865F2;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          margin-top: 20px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
        }
        a.button:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(88, 101, 242, 0.6);
        }
        .info {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        .info h3 { margin-top: 0; }
        ul { text-align: left; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🤠</div>
        <h1>Sheriff Rex Bot</h1>
        <h2>Linked Roles Verification</h2>
        <p>Connect your Discord account to verify your Sheriff Rex Bot statistics and unlock special roles!</p>
        
        <a href="/discord/verify" class="button">🔗 Connect with Discord</a>
        
        <div class="info">
          <h3>📊 Available Metadata</h3>
          <ul>
            <li>💰 <strong>Total Coins:</strong> Your total wealth in Silver Coins</li>
            <li>🎫 <strong>Total Tokens:</strong> Your Saloon Tokens balance</li>
            <li>⭐ <strong>Level:</strong> Your calculated level based on wealth</li>
            <li>🎯 <strong>Bounties Captured:</strong> Number of bounties you've captured</li>
            <li>🎰 <strong>Games Played:</strong> Total gambling games played</li>
            <li>⛏️ <strong>Mining Sessions:</strong> Number of mining sessions completed</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>🔒 Privacy</h3>
          <p>We only access your Discord user ID to link your bot data. No personal information is stored.</p>
          <p>See our <a href="https://github.com/gomezfy/Sheriffbot-/blob/main/PRIVACY_POLICY.md" style="color: #fff;">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * Initiate Discord OAuth2 flow
 */
app.get('/discord/verify', (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.state = state;

  const authUrl = new URL(`${DISCORD_CONFIG.apiEndpoint}/oauth2/authorize`);
  authUrl.searchParams.append('client_id', DISCORD_CONFIG.clientId);
  authUrl.searchParams.append('redirect_uri', DISCORD_CONFIG.redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', DISCORD_CONFIG.scopes.join(' '));
  authUrl.searchParams.append('state', state);

  res.redirect(authUrl.toString());
});

/**
 * Discord OAuth2 callback
 */
app.get('/discord/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  // Verify state to prevent CSRF
  if (!state || state !== req.session.state) {
    return res.status(403).send('Invalid state parameter');
  }

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // Exchange code for access token
    const tokenData = await getDiscordAccessToken(code as string);
    const accessToken = tokenData.access_token;

    // Get user info
    const user = await getDiscordUser(accessToken);
    const userId = user.id;

    // Get user metadata from bot database
    const metadata = getUserMetadata(userId);

    // Update role connection
    await updateRoleConnectionMetadata(userId, accessToken, metadata);

    // Store in session
    req.session.userId = userId;
    req.session.accessToken = accessToken;

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Success</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .success { font-size: 5em; margin-bottom: 20px; }
          h1 { font-size: 2.5em; margin-bottom: 20px; }
          .stats {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
            text-align: left;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .stat-item:last-child { border-bottom: none; }
          a {
            color: #fff;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Verification Successful!</h1>
          <p>Your Sheriff Rex Bot data has been linked to your Discord account.</p>
          
          <div class="stats">
            <h3>📊 Your Statistics</h3>
            <div class="stat-item">
              <span>💰 Total Coins:</span>
              <strong>${metadata.total_coins.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>🎫 Total Tokens:</span>
              <strong>${metadata.total_tokens.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>⭐ Level:</span>
              <strong>${metadata.level}</strong>
            </div>
            <div class="stat-item">
              <span>🎯 Bounties Captured:</span>
              <strong>${metadata.bounties_captured}</strong>
            </div>
            <div class="stat-item">
              <span>🎰 Games Played:</span>
              <strong>${metadata.games_played}</strong>
            </div>
            <div class="stat-item">
              <span>⛏️ Mining Sessions:</span>
              <strong>${metadata.mining_sessions}</strong>
            </div>
          </div>
          
          <p>You can now close this window and return to Discord.</p>
          <p>Server administrators can use these stats as role requirements!</p>
          
          <p style="margin-top: 30px; font-size: 0.9em;">
            <a href="/">🔄 Verify Again</a> | 
            <a href="https://github.com/gomezfy/Sheriffbot-">📖 Documentation</a>
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Error</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .error { font-size: 5em; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌</div>
          <h1>Verification Failed</h1>
          <p>There was an error verifying your account. Please try again.</p>
          <p><a href="/" style="color: #fff;">← Back to Home</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Sheriff Rex Linked Roles',
    timestamp: new Date().toISOString()
  });
});

/**
 * API endpoint to manually update metadata
 */
app.post('/api/update-metadata/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token required' });
  }

  try {
    const metadata = getUserMetadata(userId);
    await updateRoleConnectionMetadata(userId, accessToken, metadata);
    
    res.json({
      success: true,
      metadata: metadata
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update metadata',
      message: error.message
    });
  }
});

// ==================== CASINO GAME ROUTES ====================

// Casino game sessions
const casinoSessions = new Map<string, { userId: string; createdAt: number; expiresAt: number }>();
const { getUserGold, addUserGold, removeUserGold } = require('./utils/dataManager');

// Casino statistics storage
const casinoStats = new Map<string, { wins: number; losses: number; biggestWin: number; currentStreak: number; bestStreak: number }>();

// Weighted slot symbols
const slotSymbols = [
  { symbol: '🍒', weight: 30 },
  { symbol: '🍋', weight: 25 },
  { symbol: '🍊', weight: 20 },
  { symbol: '🔔', weight: 15 },
  { symbol: '⭐', weight: 8 },
  { symbol: '💎', weight: 2 }
];

function getWeightedSymbol() {
  const totalWeight = slotSymbols.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of slotSymbols) {
    random -= item.weight;
    if (random <= 0) return item.symbol;
  }
  return slotSymbols[0].symbol;
}

function getCasinoStats(userId: string) {
  if (!casinoStats.has(userId)) {
    casinoStats.set(userId, {
      wins: 0,
      losses: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0
    });
  }
  return casinoStats.get(userId)!;
}

// Create new casino game session
app.post('/api/casino/create-session', (req: Request, res: Response) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  
  casinoSessions.set(sessionId, {
    userId,
    createdAt: now,
    expiresAt: now + (30 * 60 * 1000) // 30 minutes
  });

  // Clean up expired sessions
  for (const [key, value] of casinoSessions.entries()) {
    if (value.expiresAt < now) {
      casinoSessions.delete(key);
    }
  }

  res.json({ success: true, sessionId });
});

// Get casino session data
app.get('/api/casino/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = casinoSessions.get(sessionId);

  if (!session || session.expiresAt < Date.now()) {
    return res.status(404).json({ success: false, error: 'Session not found or expired' });
  }

  const balance = getUserGold(session.userId);
  const stats = getCasinoStats(session.userId);

  res.json({
    success: true,
    balance,
    stats
  });
});

// Handle spin request
app.post('/api/casino/spin', async (req: Request, res: Response) => {
  const { userId, sessionId, bet } = req.body;

  const session = casinoSessions.get(sessionId);
  if (!session || session.userId !== userId || session.expiresAt < Date.now()) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session' });
  }

  if (!bet || bet < 10) {
    return res.status(400).json({ success: false, error: 'Invalid bet amount' });
  }

  const currentGold = getUserGold(userId);
  if (currentGold < bet) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' });
  }

  // Generate symbols
  const symbols = [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()];
  const [slot1, slot2, slot3] = symbols;

  // Calculate multiplier
  let multiplier = 0;
  let result = '';

  if (slot1 === slot2 && slot2 === slot3) {
    // All three match
    if (slot1 === '💎') {
      multiplier = 50;
      result = '💰 MEGA JACKPOT! 💰 Triple Diamonds!';
    } else if (slot1 === '⭐') {
      multiplier = 20;
      result = '⭐ SUPER WIN! ⭐ Triple Stars!';
    } else if (slot1 === '🔔') {
      multiplier = 10;
      result = '🔔 BIG WIN! 🔔 Triple Bells!';
    } else if (slot1 === '🍊') {
      multiplier = 5;
      result = '🍊 GREAT WIN! 🍊 Triple Oranges!';
    } else if (slot1 === '🍋') {
      multiplier = 3;
      result = '🍋 NICE WIN! 🍋 Triple Lemons!';
    } else {
      multiplier = 2.5;
      result = '🍒 WIN! 🍒 Triple Cherries!';
    }
  } else if ((slot1 === '💎' && slot2 === '💎') || (slot2 === '💎' && slot3 === '💎') || (slot1 === '💎' && slot3 === '💎')) {
    multiplier = 5;
    result = '💎 DIAMOND BONUS! 💎 Two Diamonds!';
  } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
    const matchSymbol = slot1 === slot2 ? slot1 : (slot2 === slot3 ? slot2 : slot1);
    if (matchSymbol === '⭐') {
      multiplier = 2;
      result = '⭐ Small win! Two Stars!';
    } else if (matchSymbol === '🔔') {
      multiplier = 1.5;
      result = '🔔 Small win! Two Bells!';
    } else {
      multiplier = 1.2;
      result = '😊 Small win!';
    }
  } else {
    multiplier = 0;
    result = '😔 No match... Better luck next time!';
  }

  const won = multiplier > 0;
  const winAmount = won ? Math.floor(bet * multiplier) : 0;
  const stats = getCasinoStats(userId);

  if (won) {
    const netWinnings = winAmount - bet;
    addUserGold(userId, netWinnings);
    stats.wins++;
    stats.currentStreak++;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    stats.biggestWin = Math.max(stats.biggestWin, winAmount);
  } else {
    removeUserGold(userId, bet);
    stats.losses++;
    stats.currentStreak = 0;
  }

  const newBalance = getUserGold(userId);

  res.json({
    success: true,
    symbols,
    multiplier,
    won,
    winAmount,
    result,
    newBalance,
    stats
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔗 Linked Roles server running on port ${PORT}`);
    console.log(`📍 Verification URL: http://localhost:${PORT}`);
    console.log(`🔧 Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
    console.log('');
    console.log('⚙️  Configuration:');
    console.log(`   Client ID: ${DISCORD_CONFIG.clientId ? '✅ Set' : '❌ Not set'}`);
    console.log(`   Client Secret: ${DISCORD_CONFIG.clientSecret ? '✅ Set' : '❌ Not set'}`);
    console.log(`   Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
  });
}

export default app;
