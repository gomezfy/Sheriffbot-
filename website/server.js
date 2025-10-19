// Optional dotenv for local development
try {
    require('dotenv').config({ path: '../.env' });
} catch (e) {
    // dotenv not required in production (Discloud uses env vars)
}
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || (process.env.REPL_SLUG ? 5000 : 8080);

// Stripe Configuration
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? 
    new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' }) : 
    null;

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sheriff-bot-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Product Configuration
const PRODUCTS = {
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
    backpack: {
        name: 'Backpack Upgrade',
        description: 'Increase your inventory capacity from 100kg to 500kg',
        price: 9.99,
        tokens: 0,
        coins: 0,
        backpack: true,
        image: 'backpack.png'
    }
};

// Paths for bot data integration
const redemptionCodesPath = path.join(__dirname, '..', 'data', 'redemption-codes.json');

// Ensure data directory exists
function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(redemptionCodesPath)) {
        fs.writeFileSync(redemptionCodesPath, '{}');
    }
}

// Load redemption codes
function loadRedemptionCodes() {
    ensureDataDirectory();
    return JSON.parse(fs.readFileSync(redemptionCodesPath, 'utf-8'));
}

// Save redemption codes
function saveRedemptionCodes(data) {
    ensureDataDirectory();
    fs.writeFileSync(redemptionCodesPath, JSON.stringify(data, null, 2));
}

// Generate unique redemption code
function generateRedemptionCode(productId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SHERIFF-${productId.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

// Save redemption code to database
function saveRedemptionCode(code, productData) {
    try {
        const redemptionCodes = loadRedemptionCodes();
        
        redemptionCodes[code] = {
            productId: productData.productId,
            productName: productData.name,
            tokens: productData.tokens,
            coins: productData.coins,
            vip: productData.vip || false,
            background: productData.background || false,
            backpack: productData.backpack || false,
            createdAt: Date.now(),
            createdBy: 'stripe_checkout',
            redeemed: false
        };
        
        saveRedemptionCodes(redemptionCodes);
        console.log(`💾 Redemption code saved: ${code} for ${productData.name}`);
        return true;
    } catch (error) {
        console.error('Error saving redemption code:', error);
        return false;
    }
}

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Shop route
app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

// Success route
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Cancel route
app.get('/cancel', (req, res) => {
    res.sendFile(path.join(__dirname, 'cancel.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Dashboard API routes
const dashboardRoutes = require('./routes/dashboard');
app.use('/api', dashboardRoutes);

// API: Get Stripe Publishable Key
app.get('/api/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        configured: !!stripe
    });
});

// API: Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ 
                error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
            });
        }

        const { productId, email } = req.body;
        const product = PRODUCTS[productId];

        if (!product) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        // Generate redemption code
        const redemptionCode = generateRedemptionCode(productId);
        
        // Save redemption code to bot database
        saveRedemptionCode(redemptionCode, {
            productId: productId,
            name: product.name,
            tokens: product.tokens,
            coins: product.coins,
            vip: product.vip,
            background: product.background,
            backpack: product.backpack
        });

        // Get base URL
        const baseUrl = process.env.REPL_SLUG ? 
            `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
            process.env.DISCLOUD_URL || 
            `http://localhost:${PORT}`;

        // Product image URL
        const imageUrl = product.image ? `${baseUrl}/assets/${product.image}` : null;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: imageUrl ? [imageUrl] : [],
                        statement_descriptor_suffix: 'SHERIFF BOT'
                    },
                    unit_amount: Math.round(product.price * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            customer_email: email || undefined,
            payment_intent_data: {
                statement_descriptor: 'SHERIFF BOT SHOP', // Main descriptor (max 22 chars)
                statement_descriptor_suffix: product.name.substring(0, 10).toUpperCase() // Product identifier
            },
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&code=${redemptionCode}`,
            cancel_url: `${baseUrl}/cancel.html`,
            metadata: {
                productId: productId,
                redemptionCode: redemptionCode,
                tokens: product.tokens.toString(),
                coins: product.coins.toString(),
                vip: product.vip ? 'true' : 'false',
                background: product.background ? 'true' : 'false',
                backpack: product.backpack ? 'true' : 'false'
            }
        });

        res.json({ 
            id: session.id,
            url: session.url,
            redemptionCode: redemptionCode
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            error: error.message || 'An error occurred during checkout' 
        });
    }
});

// API: Verify Session
app.get('/api/verify-session/:sessionId', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        
        res.json({
            status: session.payment_status,
            customerEmail: session.customer_details?.email || 'N/A',
            metadata: session.metadata
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint (for production use)
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
        return res.status(400).send('Webhook not configured');
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Payment successful:', session.metadata);
            // Here you could:
            // - Save to database
            // - Send email with redemption code
            // - Notify Discord bot
            break;
        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found 🤠');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Website is running on port ${PORT}`);
    console.log(`🤠 Sheriff Bot Website - Ready!`);
    if (stripe) {
        console.log('💳 Stripe integration - Active');
    } else {
        console.log('⚠️  Stripe not configured (set STRIPE_SECRET_KEY)');
    }
});

module.exports = app;
