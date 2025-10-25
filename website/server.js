"use strict";
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
var express_session_1 = __importDefault(require("express-session"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var axios_1 = __importDefault(require("axios"));
var dashboard_1 = __importDefault(require("./routes/dashboard"));
var app = (0, express_1.default)();
var PORT = parseInt(process.env.PORT || (process.env.REPL_SLUG ? '5000' : '8080'));
// Hotmart API configuration
var HOTMART_CONFIG = {
    clientId: process.env.HOTMART_CLIENT_ID || '',
    clientSecret: process.env.HOTMART_CLIENT_SECRET || '',
    hottok: process.env.HOTMART_HOTTOK || '',
    checkoutBaseUrl: 'https://pay.hotmart.com',
    apiBaseUrl: 'https://api-sec-vlc.hotmart.com',
    hotConnectUrl: 'https://api-hot-connect.hotmart.com'
};
// Get Hotmart OAuth token
function getHotmartAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!HOTMART_CONFIG.clientId || !HOTMART_CONFIG.clientSecret) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, axios_1.default.post("".concat(HOTMART_CONFIG.apiBaseUrl, "/security/oauth/token"), {
                            grant_type: 'client_credentials',
                            client_id: HOTMART_CONFIG.clientId,
                            client_secret: HOTMART_CONFIG.clientSecret
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.access_token];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error getting Hotmart access token:', error_1.message);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Verify Hotmart webhook signature
function verifyHotmartWebhook(req) {
    var hottok = req.headers['hottok'] || req.headers['x-hotmart-hottok'];
    if (!hottok) {
        console.error('⚠️ Webhook verification failed: No hottok in headers', {
            headers: req.headers,
            body: req.body
        });
        return false;
    }
    var isValid = hottok === HOTMART_CONFIG.hottok;
    if (!isValid) {
        console.error('⚠️ Webhook verification failed: Invalid hottok', {
            received: hottok,
            expected: HOTMART_CONFIG.hottok ? '***configured***' : '***not configured***'
        });
    }
    return isValid;
}
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'sheriff-bot-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname)));
// Serve bot assets folder for Discord embeds
app.use('/bot-assets', express_1.default.static(path_1.default.join(__dirname, '..', 'assets')));
var PRODUCTS = {
    starter: {
        name: 'Starter Pack',
        description: '100 Saloon Tokens + 5,000 Silver Coins',
        price: 1.99,
        tokens: 100,
        coins: 5000,
        image: 'saloon-token.png'
    },
    popular: {
        name: 'Popular Pack',
        description: '300 Saloon Tokens + 15,000 Silver Coins + 50 Bonus Tokens',
        price: 4.99,
        tokens: 350,
        coins: 15000,
        image: 'saloon-token.png'
    },
    gold: {
        name: 'Gold Pack',
        description: '750 Saloon Tokens + 40,000 Silver Coins + 150 Bonus Tokens + VIP Badge',
        price: 9.99,
        tokens: 900,
        coins: 40000,
        vip: true,
        image: 'gold-bar.png'
    },
    ultimate: {
        name: 'Ultimate Pack',
        description: '2,000 Saloon Tokens + 100,000 Silver Coins + 500 Bonus Tokens + VIP Badge + Exclusive Background',
        price: 19.99,
        tokens: 2500,
        coins: 100000,
        vip: true,
        background: true,
        image: 'gold-bar.png'
    },
    backpack_200: {
        name: 'Small Backpack',
        description: 'Upgrade inventory to 200kg capacity',
        price: 2.99,
        tokens: 0,
        coins: 0,
        backpack: 200,
        image: 'backpack.png'
    },
    backpack_300: {
        name: 'Medium Backpack',
        description: 'Upgrade inventory to 300kg capacity',
        price: 4.99,
        tokens: 0,
        coins: 0,
        backpack: 300,
        image: 'backpack.png'
    },
    backpack_400: {
        name: 'Large Backpack',
        description: 'Upgrade inventory to 400kg capacity',
        price: 6.99,
        tokens: 0,
        coins: 0,
        backpack: 400,
        image: 'backpack.png'
    },
    backpack_500: {
        name: 'Ultimate Backpack',
        description: 'Upgrade inventory to 500kg capacity (MAX)',
        price: 9.99,
        tokens: 0,
        coins: 0,
        backpack: 500,
        image: 'backpack.png'
    }
};
var redemptionCodesPath = path_1.default.join(__dirname, '..', 'data', 'redemption-codes.json');
function ensureDataDirectory() {
    var dataDir = path_1.default.join(__dirname, '..', 'data');
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(redemptionCodesPath)) {
        fs_1.default.writeFileSync(redemptionCodesPath, '{}');
    }
}
function loadRedemptionCodes() {
    ensureDataDirectory();
    return JSON.parse(fs_1.default.readFileSync(redemptionCodesPath, 'utf-8'));
}
function saveRedemptionCodes(data) {
    ensureDataDirectory();
    fs_1.default.writeFileSync(redemptionCodesPath, JSON.stringify(data, null, 2));
}
function generateRedemptionCode(productId) {
    var timestamp = Date.now().toString(36);
    var random = Math.random().toString(36).substring(2, 8);
    return "SHERIFF-".concat(productId.toUpperCase(), "-").concat(timestamp, "-").concat(random).toUpperCase();
}
function saveRedemptionCode(code, productData) {
    try {
        var redemptionCodes = loadRedemptionCodes();
        redemptionCodes[code] = {
            productId: productData.productId,
            productName: productData.name,
            tokens: productData.tokens,
            coins: productData.coins,
            vip: productData.vip || false,
            background: productData.background || false,
            backpack: productData.backpack || false,
            createdAt: Date.now(),
            createdBy: 'hotmart_checkout',
            redeemed: false
        };
        saveRedemptionCodes(redemptionCodes);
        console.log("\uD83D\uDCBE Redemption code saved: ".concat(code, " for ").concat(productData.name));
        return true;
    }
    catch (error) {
        console.error('Error saving redemption code:', error);
        return false;
    }
}
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
app.get('/shop', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'shop.html'));
});
app.get('/success', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'success.html'));
});
app.get('/cancel', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'cancel.html'));
});
app.get('/dashboard', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'dashboard.html'));
});
app.use('/api', dashboard_1.default);
// Get Hotmart configuration for frontend
app.get('/api/config', function (req, res) {
    res.json({
        provider: 'hotmart',
        configured: !!(HOTMART_CONFIG.clientId && HOTMART_CONFIG.clientSecret),
        productBaseUrl: 'https://pay.hotmart.com'
    });
});
// Create Hotmart checkout link
app.post('/api/checkout', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var productId, product, redemptionCode, hotmartProductId, checkoutUrl;
    return __generator(this, function (_a) {
        try {
            if (!HOTMART_CONFIG.clientId || !HOTMART_CONFIG.clientSecret) {
                return [2 /*return*/, res.status(500).json({
                        error: 'Hotmart is not configured. Please set HOTMART_CLIENT_ID and HOTMART_CLIENT_SECRET.'
                    })];
            }
            productId = req.body.productId;
            product = PRODUCTS[productId];
            if (!product) {
                return [2 /*return*/, res.status(400).json({ error: 'Invalid product ID' })];
            }
            redemptionCode = generateRedemptionCode(productId);
            saveRedemptionCode(redemptionCode, {
                productId: productId,
                name: product.name,
                tokens: product.tokens,
                coins: product.coins,
                vip: product.vip,
                background: product.background,
                backpack: product.backpack
            });
            hotmartProductId = process.env["HOTMART_PRODUCT_".concat(productId.toUpperCase())] || '';
            if (!hotmartProductId) {
                return [2 /*return*/, res.status(400).json({
                        error: "Hotmart product ID not configured for ".concat(productId)
                    })];
            }
            checkoutUrl = "".concat(HOTMART_CONFIG.checkoutBaseUrl, "/").concat(hotmartProductId, "?sck=").concat(redemptionCode, "&redirect=true");
            res.json({
                checkoutUrl: checkoutUrl,
                redemptionCode: redemptionCode
            });
        }
        catch (error) {
            console.error('Hotmart checkout creation error:', error);
            res.status(500).json({
                error: error.message || 'An error occurred during checkout'
            });
        }
        return [2 /*return*/];
    });
}); });
// Hotmart Webhook endpoint
app.post('/api/webhook/hotmart', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, event_1, data, customId, redemptionCodes, refundCustomId, redemptionCodes;
    var _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        try {
            if (!verifyHotmartWebhook(req)) {
                console.error('⚠️ Invalid Hotmart webhook signature');
                return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
            }
            _a = req.body, event_1 = _a.event, data = _a.data;
            console.log('📨 Hotmart webhook received:', { event: event_1, data: data });
            switch (event_1) {
                case 'PURCHASE_COMPLETE':
                case 'PURCHASE_APPROVED':
                    customId = ((_b = data.purchase) === null || _b === void 0 ? void 0 : _b.offer_code) || ((_c = data.purchase) === null || _c === void 0 ? void 0 : _c.sck) || '';
                    if (customId) {
                        redemptionCodes = loadRedemptionCodes();
                        if (redemptionCodes[customId]) {
                            redemptionCodes[customId].paid = true;
                            redemptionCodes[customId].paidAt = Date.now();
                            redemptionCodes[customId].buyer = {
                                email: (_d = data.buyer) === null || _d === void 0 ? void 0 : _d.email,
                                name: (_e = data.buyer) === null || _e === void 0 ? void 0 : _e.name
                            };
                            redemptionCodes[customId].transaction = (_f = data.purchase) === null || _f === void 0 ? void 0 : _f.transaction;
                            saveRedemptionCodes(redemptionCodes);
                            console.log('✅ Payment confirmed for redemption code:', customId);
                        }
                    }
                    break;
                case 'PURCHASE_REFUNDED':
                case 'PURCHASE_CANCELED':
                    refundCustomId = ((_g = data.purchase) === null || _g === void 0 ? void 0 : _g.offer_code) || ((_h = data.purchase) === null || _h === void 0 ? void 0 : _h.sck) || '';
                    if (refundCustomId) {
                        redemptionCodes = loadRedemptionCodes();
                        if (redemptionCodes[refundCustomId]) {
                            redemptionCodes[refundCustomId].canceled = true;
                            redemptionCodes[refundCustomId].canceledAt = Date.now();
                            saveRedemptionCodes(redemptionCodes);
                            console.log('⚠️ Payment refunded/canceled for redemption code:', refundCustomId);
                        }
                    }
                    break;
            }
            res.sendStatus(200);
        }
        catch (error) {
            console.error('Webhook processing error:', error);
            res.sendStatus(200);
        }
        return [2 /*return*/];
    });
}); });
app.use(function (req, res) {
    res.status(404).send('404 - Page Not Found 🤠');
});
app.listen(PORT, '0.0.0.0', function () {
    console.log("\uD83C\uDF10 Website is running on port ".concat(PORT));
    console.log("\uD83E\uDD20 Sheriff Bot Website - Ready!");
    if (HOTMART_CONFIG.clientId && HOTMART_CONFIG.clientSecret) {
        console.log("\uD83D\uDCB0 Hotmart integration - Active");
        console.log("\uD83D\uDCE8 Webhook URL: ".concat(PORT === 5000 ? 'http://localhost:5000' : 'https://your-domain.com', "/api/webhook/hotmart"));
    }
    else {
        console.log('⚠️  Hotmart not configured (set HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET, and HOTMART_HOTTOK)');
    }
});
exports.default = app;
