"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var router = express_1.default.Router();
var DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1426734768111747284';
var DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
var DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN || '';
var REDIRECT_URI = process.env.REPL_SLUG ?
    "https://".concat(process.env.REPL_SLUG, ".").concat(process.env.REPL_OWNER, ".repl.co/api/auth/callback") :
    'http://localhost:5000/api/auth/callback';
var guildConfigPath = path_1.default.join(__dirname, '..', '..', 'data', 'guild-config.json');
function ensureGuildConfigFile() {
    var dataDir = path_1.default.dirname(guildConfigPath);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(guildConfigPath)) {
        fs_1.default.writeFileSync(guildConfigPath, '{}');
    }
}
function loadGuildConfigs() {
    ensureGuildConfigFile();
    return JSON.parse(fs_1.default.readFileSync(guildConfigPath, 'utf-8'));
}
function saveGuildConfigs(data) {
    ensureGuildConfigFile();
    fs_1.default.writeFileSync(guildConfigPath, JSON.stringify(data, null, 2));
}
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}
router.get('/auth/discord', function (req, res) {
    if (!DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured. Please set DISCORD_CLIENT_SECRET environment variable.');
    }
    var authUrl = "https://discord.com/api/oauth2/authorize?client_id=".concat(DISCORD_CLIENT_ID, "&redirect_uri=").concat(encodeURIComponent(REDIRECT_URI), "&response_type=code&scope=identify%20guilds");
    res.redirect(authUrl);
});
router.get('/auth/callback', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, tokenResponse, _a, access_token, refresh_token, expires_in, userResponse, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                code = req.query.code;
                if (!code) {
                    return [2 /*return*/, res.redirect('/dashboard?error=no_code')];
                }
                if (!DISCORD_CLIENT_SECRET) {
                    return [2 /*return*/, res.status(500).send('Discord OAuth not configured')];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, axios_1.default.post('https://discord.com/api/oauth2/token', new URLSearchParams({
                        client_id: DISCORD_CLIENT_ID,
                        client_secret: DISCORD_CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: REDIRECT_URI
                    }), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })];
            case 2:
                tokenResponse = _c.sent();
                _a = tokenResponse.data, access_token = _a.access_token, refresh_token = _a.refresh_token, expires_in = _a.expires_in;
                return [4 /*yield*/, axios_1.default.get('https://discord.com/api/users/@me', {
                        headers: {
                            Authorization: "Bearer ".concat(access_token)
                        }
                    })];
            case 3:
                userResponse = _c.sent();
                req.session.user = userResponse.data;
                req.session.accessToken = access_token;
                req.session.refreshToken = refresh_token;
                req.session.tokenExpiry = Date.now() + (expires_in * 1000);
                res.redirect('/dashboard');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                console.error('OAuth callback error:', ((_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) || error_1.message);
                res.redirect('/dashboard?error=auth_failed');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get('/auth/check', function (req, res) {
    if (req.session && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    }
    else {
        res.json({
            authenticated: false
        });
    }
});
router.get('/auth/logout', function (req, res) {
    req.session.destroy(function () { });
    res.redirect('/dashboard');
});
router.get('/guilds', requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var guildsResponse, managedGuilds, botGuilds_1, botGuildsResponse, error_2, guildsWithBotStatus, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                return [4 /*yield*/, axios_1.default.get('https://discord.com/api/users/@me/guilds', {
                        headers: {
                            Authorization: "Bearer ".concat(req.session.accessToken)
                        }
                    })];
            case 1:
                guildsResponse = _b.sent();
                managedGuilds = guildsResponse.data.filter(function (guild) {
                    return (guild.permissions & 0x20) === 0x20;
                });
                botGuilds_1 = [];
                if (!DISCORD_BOT_TOKEN) return [3 /*break*/, 5];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, axios_1.default.get('https://discord.com/api/users/@me/guilds', {
                        headers: {
                            Authorization: "Bot ".concat(DISCORD_BOT_TOKEN)
                        }
                    })];
            case 3:
                botGuildsResponse = _b.sent();
                botGuilds_1 = botGuildsResponse.data.map(function (g) { return g.id; });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error('Error fetching bot guilds:', error_2.message);
                return [3 /*break*/, 5];
            case 5:
                guildsWithBotStatus = managedGuilds.map(function (guild) { return ({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon,
                    botPresent: botGuilds_1.includes(guild.id)
                }); });
                res.json(guildsWithBotStatus);
                return [3 /*break*/, 7];
            case 6:
                error_3 = _b.sent();
                console.error('Error fetching guilds:', ((_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) || error_3.message);
                res.status(500).json({ error: 'Failed to fetch guilds' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.get('/guilds/:guildId/channels', requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var guildId, channelsResponse, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                guildId = req.params.guildId;
                if (!DISCORD_BOT_TOKEN) {
                    return [2 /*return*/, res.status(500).json({ error: 'Bot token not configured' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get("https://discord.com/api/guilds/".concat(guildId, "/channels"), {
                        headers: {
                            Authorization: "Bot ".concat(DISCORD_BOT_TOKEN)
                        }
                    })];
            case 2:
                channelsResponse = _b.sent();
                res.json(channelsResponse.data);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Error fetching channels:', ((_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) || error_4.message);
                res.status(500).json({ error: 'Failed to fetch channels' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get('/guilds/:guildId/config', requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var guildId, configs, config;
    return __generator(this, function (_a) {
        guildId = req.params.guildId;
        try {
            configs = loadGuildConfigs();
            config = configs[guildId] || {
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
        }
        catch (error) {
            console.error('Error loading config:', error);
            res.status(500).json({ error: 'Failed to load configuration' });
        }
        return [2 /*return*/];
    });
}); });
router.post('/guilds/:guildId/config', requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var guildId, config, configs;
    return __generator(this, function (_a) {
        guildId = req.params.guildId;
        config = req.body;
        try {
            configs = loadGuildConfigs();
            configs[guildId] = __assign(__assign({}, config), { updatedAt: Date.now(), updatedBy: req.session.user.id });
            saveGuildConfigs(configs);
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error saving config:', error);
            res.status(500).json({ error: 'Failed to save configuration' });
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
