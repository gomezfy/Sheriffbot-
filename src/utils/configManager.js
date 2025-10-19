const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'data', 'guild-config.json');

// Ensure config file exists
function ensureConfigFile() {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }
}

// Load all guild configurations
function loadConfigs() {
    ensureConfigFile();
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
}

// Load configuration for a specific guild
function loadGuildConfig(guildId) {
    const configs = loadConfigs();
    return configs[guildId] || {
        logsEnabled: false,
        logsChannel: '',
        welcomeEnabled: false,
        welcomeChannel: '',
        welcomeMessage: 'Welcome {user} to {server}! 🤠',
        wantedEnabled: false,
        wantedChannel: '',
        language: 'en-US'
    };
}

// Save configuration for a specific guild
function saveGuildConfig(guildId, config) {
    ensureConfigFile();
    const configs = loadConfigs();
    configs[guildId] = config;
    fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
}

module.exports = {
    loadGuildConfig,
    saveGuildConfig,
    loadConfigs
};
