const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Discord OAuth Configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1426734768111747284';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN || '';
const REDIRECT_URI = process.env.REPL_SLUG ? 
    `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback` :
    process.env.DISCLOUD_URL ? 
    `${process.env.DISCLOUD_URL}/api/auth/callback` :
    'http://localhost:5000/api/auth/callback';

// Path for guild configurations
const guildConfigPath = path.join(__dirname, '..', '..', 'data', 'guild-config.json');

// Ensure guild config file exists
function ensureGuildConfigFile() {
    const dataDir = path.dirname(guildConfigPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(guildConfigPath)) {
        fs.writeFileSync(guildConfigPath, '{}');
    }
}

// Load guild configurations
function loadGuildConfigs() {
    ensureGuildConfigFile();
    return JSON.parse(fs.readFileSync(guildConfigPath, 'utf-8'));
}

// Save guild configurations
function saveGuildConfigs(data) {
    ensureGuildConfigFile();
    fs.writeFileSync(guildConfigPath, JSON.stringify(data, null, 2));
}

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Route: Discord OAuth Login
router.get('/auth/discord', (req, res) => {
    if (!DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured. Please set DISCORD_CLIENT_SECRET environment variable.');
    }
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});

// Route: Discord OAuth Callback
router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect('/dashboard?error=no_code');
    }
    
    if (!DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        // Save to session
        req.session.user = userResponse.data;
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.tokenExpiry = Date.now() + (expires_in * 1000);
        
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('OAuth callback error:', error.response?.data || error.message);
        res.redirect('/dashboard?error=auth_failed');
    }
});

// Route: Check Authentication
router.get('/auth/check', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Route: Logout
router.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/dashboard');
});

// Route: Get User's Guilds
router.get('/guilds', requireAuth, async (req, res) => {
    try {
        // Get guilds from Discord API
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`
            }
        });
        
        // Filter guilds where user has MANAGE_GUILD permission
        const managedGuilds = guildsResponse.data.filter(guild => {
            return (guild.permissions & 0x20) === 0x20; // MANAGE_GUILD permission
        });
        
        // Check if bot is in each guild
        let botGuilds = [];
        if (DISCORD_BOT_TOKEN) {
            try {
                const botGuildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
                    }
                });
                botGuilds = botGuildsResponse.data.map(g => g.id);
            } catch (error) {
                console.error('Error fetching bot guilds:', error.message);
            }
        }
        
        // Add botPresent flag
        const guildsWithBotStatus = managedGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            botPresent: botGuilds.includes(guild.id)
        }));
        
        res.json(guildsWithBotStatus);
        
    } catch (error) {
        console.error('Error fetching guilds:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

// Route: Get Guild Channels
router.get('/guilds/:guildId/channels', requireAuth, async (req, res) => {
    const { guildId } = req.params;
    
    if (!DISCORD_BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token not configured' });
    }
    
    try {
        const channelsResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        res.json(channelsResponse.data);
        
    } catch (error) {
        console.error('Error fetching channels:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
});

// Route: Get Guild Configuration
router.get('/guilds/:guildId/config', requireAuth, async (req, res) => {
    const { guildId } = req.params;
    
    try {
        const configs = loadGuildConfigs();
        const config = configs[guildId] || {
            logsEnabled: false,
            logsChannel: '',
            welcomeEnabled: false,
            welcomeChannel: '',
            welcomeMessage: 'Welcome {user} to {server}! 🤠',
            wantedEnabled: false,
            wantedChannel: '',
            language: 'en-US'
        };
        
        res.json(config);
        
    } catch (error) {
        console.error('Error loading config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Route: Save Guild Configuration
router.post('/guilds/:guildId/config', requireAuth, async (req, res) => {
    const { guildId } = req.params;
    const config = req.body;
    
    try {
        const configs = loadGuildConfigs();
        configs[guildId] = {
            ...config,
            updatedAt: Date.now(),
            updatedBy: req.session.user.id
        };
        
        saveGuildConfigs(configs);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
});

module.exports = router;
