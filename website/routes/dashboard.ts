import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1426734768111747284';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN || '';

const getRedirectUri = () => {
    if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`;
    }
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback`;
    }
    return 'http://localhost:5000/api/auth/callback';
};

const REDIRECT_URI = getRedirectUri();

const guildConfigPath = path.join(__dirname, '..', '..', 'data', 'guild-config.json');

interface GuildConfig {
    logsEnabled?: boolean;
    logsChannel?: string;
    welcomeEnabled?: boolean;
    welcomeChannel?: string;
    welcomeMessage?: string;
    wantedEnabled?: boolean;
    wantedChannel?: string;
    language?: string;
    autoRoleEnabled?: boolean;
    autoRoleId?: string;
    updatedAt?: number;
    updatedBy?: string;
}

function ensureGuildConfigFile(): void {
    const dataDir = path.dirname(guildConfigPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(guildConfigPath)) {
        fs.writeFileSync(guildConfigPath, '{}');
    }
}

function loadGuildConfigs(): Record<string, GuildConfig> {
    ensureGuildConfigFile();
    try {
        return JSON.parse(fs.readFileSync(guildConfigPath, 'utf-8'));
    } catch (error) {
        console.error('Error loading guild configs:', error);
        return {};
    }
}

function saveGuildConfigs(data: Record<string, GuildConfig>): void {
    ensureGuildConfigFile();
    try {
        fs.writeFileSync(guildConfigPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving guild configs:', error);
        throw error;
    }
}

function requireAuth(req: Request, res: Response, next: NextFunction): void | Response {
    if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

router.get('/auth/discord', (req: Request, res: Response) => {
    if (!DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured. Please set DISCORD_CLIENT_SECRET environment variable.');
    }
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});

router.get('/auth/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect('/dashboard?error=no_code');
    }
    
    if (!DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured');
    }
    
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: REDIRECT_URI
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        (req.session as any).user = userResponse.data;
        (req.session as any).accessToken = access_token;
        (req.session as any).refreshToken = refresh_token;
        (req.session as any).tokenExpiry = Date.now() + (expires_in * 1000);
        
        res.redirect('/dashboard');
        
    } catch (error: any) {
        console.error('OAuth callback error:', error.response?.data || error.message);
        res.redirect('/dashboard?error=auth_failed');
    }
});

router.get('/auth/check', (req: Request, res: Response) => {
    if (req.session && (req.session as any).user) {
        res.json({
            authenticated: true,
            user: (req.session as any).user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

router.get('/auth/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {});
    res.redirect('/dashboard');
});

router.get('/guilds', requireAuth as any, async (req: Request, res: Response) => {
    try {
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${(req.session as any).accessToken}`
            }
        });
        
        const managedGuilds = guildsResponse.data.filter((guild: any) => {
            return (guild.permissions & 0x20) === 0x20;
        });
        
        let botGuilds: string[] = [];
        if (DISCORD_BOT_TOKEN) {
            try {
                const botGuildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
                    }
                });
                botGuilds = botGuildsResponse.data.map((g: any) => g.id);
            } catch (error: any) {
                console.error('Error fetching bot guilds:', error.message);
            }
        }
        
        const guildsWithBotStatus = managedGuilds.map((guild: any) => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            botPresent: botGuilds.includes(guild.id)
        }));
        
        res.json(guildsWithBotStatus);
        
    } catch (error: any) {
        console.error('Error fetching guilds:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

router.get('/guilds/:guildId', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    
    if (!DISCORD_BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token not configured' });
    }
    
    try {
        const guildResponse = await axios.get(`https://discord.com/api/guilds/${guildId}?with_counts=true`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        res.json(guildResponse.data);
        
    } catch (error: any) {
        console.error('Error fetching guild:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch guild information' });
    }
});

router.get('/guilds/:guildId/channels', requireAuth as any, async (req: Request, res: Response) => {
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
        
        const textChannels = channelsResponse.data.filter((channel: any) => 
            channel.type === 0 || channel.type === 5
        );
        
        res.json(textChannels);
        
    } catch (error: any) {
        console.error('Error fetching channels:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
});

router.get('/guilds/:guildId/roles', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    
    if (!DISCORD_BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token not configured' });
    }
    
    try {
        const rolesResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        const sortedRoles = rolesResponse.data.sort((a: any, b: any) => b.position - a.position);
        
        res.json(sortedRoles);
        
    } catch (error: any) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

router.get('/guilds/:guildId/config', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    
    try {
        const configs = loadGuildConfigs();
        const config: GuildConfig = configs[guildId] || {
            logsEnabled: false,
            logsChannel: '',
            welcomeEnabled: false,
            welcomeChannel: '',
            welcomeMessage: 'Welcome {user} to {server}! 🤠',
            wantedEnabled: false,
            wantedChannel: '',
            language: 'en-US',
            autoRoleEnabled: false,
            autoRoleId: ''
        };
        
        res.json(config);
        
    } catch (error) {
        console.error('Error loading config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

router.post('/guilds/:guildId/config', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    const config: GuildConfig = req.body;
    
    if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'Invalid configuration data' });
    }
    
    try {
        const configs = loadGuildConfigs();
        configs[guildId] = {
            ...config,
            updatedAt: Date.now(),
            updatedBy: (req.session as any).user.id
        };
        
        saveGuildConfigs(configs);
        
        res.json({ success: true, message: 'Configuration saved successfully' });
        
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
});

router.delete('/guilds/:guildId/config', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    
    try {
        const configs = loadGuildConfigs();
        
        if (configs[guildId]) {
            delete configs[guildId];
            saveGuildConfigs(configs);
            res.json({ success: true, message: 'Configuration reset successfully' });
        } else {
            res.json({ success: true, message: 'No configuration to reset' });
        }
        
    } catch (error) {
        console.error('Error resetting config:', error);
        res.status(500).json({ error: 'Failed to reset configuration' });
    }
});

router.get('/guilds/:guildId/stats', requireAuth as any, async (req: Request, res: Response) => {
    const { guildId } = req.params;
    
    try {
        const economyPath = path.join(__dirname, '..', '..', 'src', 'data', 'economy.json');
        const xpPath = path.join(__dirname, '..', '..', 'src', 'data', 'xp.json');
        
        let totalMembers = 0;
        let totalSilver = 0;
        let totalGold = 0;
        let totalLevels = 0;
        
        if (fs.existsSync(economyPath)) {
            const economyData = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));
            const guildEconomy = economyData[guildId] || {};
            
            totalMembers = Object.keys(guildEconomy).length;
            Object.values(guildEconomy).forEach((user: any) => {
                totalSilver += user.silver || 0;
                totalGold += user.gold || 0;
            });
        }
        
        if (fs.existsSync(xpPath)) {
            const xpData = JSON.parse(fs.readFileSync(xpPath, 'utf-8'));
            const guildXp = xpData[guildId] || {};
            
            Object.values(guildXp).forEach((user: any) => {
                totalLevels += user.level || 0;
            });
        }
        
        res.json({
            totalMembers,
            totalSilver,
            totalGold,
            totalLevels,
            averageLevel: totalMembers > 0 ? Math.round(totalLevels / totalMembers) : 0
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.json({
            totalMembers: 0,
            totalSilver: 0,
            totalGold: 0,
            totalLevels: 0,
            averageLevel: 0
        });
    }
});

router.get('/bot/status', requireAuth as any, async (req: Request, res: Response) => {
    if (!DISCORD_BOT_TOKEN) {
        return res.json({ 
            online: false, 
            error: 'Bot token not configured' 
        });
    }
    
    try {
        const botResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        res.json({
            online: true,
            bot: {
                id: botResponse.data.id,
                username: botResponse.data.username,
                discriminator: botResponse.data.discriminator,
                avatar: botResponse.data.avatar
            }
        });
        
    } catch (error: any) {
        console.error('Error checking bot status:', error.message);
        res.json({ 
            online: false, 
            error: 'Failed to connect to bot' 
        });
    }
});

export default router;
