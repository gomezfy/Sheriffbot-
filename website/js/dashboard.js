// Dashboard functionality
let currentUser = null;
let currentGuild = null;
let guildChannels = [];

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            showDashboard();
            loadUserServers();
        } else {
            showLoginPrompt();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLoginPrompt();
    }
}

// Show login prompt
function showLoginPrompt() {
    document.getElementById('loginPrompt').style.display = 'block';
    document.getElementById('userDashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginPrompt').style.display = 'none';
    document.getElementById('userDashboard').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userTag').textContent = `${currentUser.username}#${currentUser.discriminator}`;
    
    const avatarUrl = currentUser.avatar
        ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    document.getElementById('userAvatar').src = avatarUrl;
}

// Load user's servers
async function loadUserServers() {
    try {
        const response = await fetch('/api/guilds');
        const guilds = await response.json();
        
        const serverGrid = document.getElementById('serverGrid');
        serverGrid.innerHTML = '';
        
        if (guilds.length === 0) {
            serverGrid.innerHTML = '<p style="color: #ccc; grid-column: 1/-1; text-align: center;">No servers found with manage permissions.</p>';
            return;
        }
        
        guilds.forEach(guild => {
            const serverCard = document.createElement('div');
            serverCard.className = `server-card ${guild.botPresent ? 'has-bot' : ''}`;
            serverCard.onclick = () => loadGuildConfig(guild);
            
            const iconUrl = guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            serverCard.innerHTML = `
                <img src="${iconUrl}" alt="${guild.name}" class="server-icon">
                <div class="server-name">${escapeHtml(guild.name)}</div>
                <span class="server-status ${guild.botPresent ? 'active' : 'inactive'}">
                    ${guild.botPresent ? '✓ Bot Active' : '✗ Bot Not Added'}
                </span>
            `;
            
            serverGrid.appendChild(serverCard);
        });
    } catch (error) {
        console.error('Error loading servers:', error);
        alert('Failed to load servers. Please try again.');
    }
}

// Load guild configuration
async function loadGuildConfig(guild) {
    if (!guild.botPresent) {
        alert('Please add the bot to this server first!');
        window.open('https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands&guild_id=' + guild.id, '_blank');
        return;
    }
    
    currentGuild = guild;
    
    try {
        // Load guild channels
        const channelsResponse = await fetch(`/api/guilds/${guild.id}/channels`);
        guildChannels = await channelsResponse.json();
        
        // Populate channel selects
        populateChannelSelect('logsChannel', guildChannels);
        populateChannelSelect('welcomeChannel', guildChannels);
        populateChannelSelect('wantedChannel', guildChannels);
        
        // Load current configuration
        const configResponse = await fetch(`/api/guilds/${guild.id}/config`);
        const config = await configResponse.json();
        
        // Populate form
        document.getElementById('logsEnabled').checked = config.logsEnabled || false;
        document.getElementById('logsChannel').value = config.logsChannel || '';
        document.getElementById('welcomeEnabled').checked = config.welcomeEnabled || false;
        document.getElementById('welcomeChannel').value = config.welcomeChannel || '';
        document.getElementById('welcomeMessage').value = config.welcomeMessage || 'Welcome {user} to {server}! 🤠';
        document.getElementById('wantedEnabled').checked = config.wantedEnabled || false;
        document.getElementById('wantedChannel').value = config.wantedChannel || '';
        document.getElementById('language').value = config.language || 'en-US';
        
        // Show config panel
        document.getElementById('configPanel').classList.add('active');
        document.getElementById('configPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error loading guild config:', error);
        alert('Failed to load server configuration. Please try again.');
    }
}

// Populate channel select
function populateChannelSelect(selectId, channels) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select a channel...</option>';
    
    channels.forEach(channel => {
        if (channel.type === 0) { // Text channel
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = `# ${channel.name}`;
            select.appendChild(option);
        }
    });
}

// Save configuration
async function saveConfig() {
    if (!currentGuild) {
        alert('Please select a server first!');
        return;
    }
    
    const config = {
        logsEnabled: document.getElementById('logsEnabled').checked,
        logsChannel: document.getElementById('logsChannel').value,
        welcomeEnabled: document.getElementById('welcomeEnabled').checked,
        welcomeChannel: document.getElementById('welcomeChannel').value,
        welcomeMessage: document.getElementById('welcomeMessage').value,
        wantedEnabled: document.getElementById('wantedEnabled').checked,
        wantedChannel: document.getElementById('wantedChannel').value,
        language: document.getElementById('language').value
    };
    
    try {
        const response = await fetch(`/api/guilds/${currentGuild.id}/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        if (response.ok) {
            alert('✅ Configuration saved successfully!');
        } else {
            throw new Error('Failed to save configuration');
        }
    } catch (error) {
        console.error('Error saving config:', error);
        alert('❌ Failed to save configuration. Please try again.');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Console easter egg
console.log(`
    🎛️ SHERIFF BOT DASHBOARD
    =========================
    
    Configure your servers with ease!
    
    Features:
    - Logging System
    - Welcome Messages
    - Language Settings
    - And more coming soon!
`);
