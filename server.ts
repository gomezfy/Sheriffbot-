import express, { Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';

const app = express();
const PORT = parseInt(process.env.PORT || (process.env.REPL_SLUG ? '5000' : '8080'));

const stripe = process.env.STRIPE_SECRET_KEY ? 
    new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' }) : 
    null;

app.use(session({
    secret: process.env.SESSION_SECRET || 'sheriff-bot-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

interface Product {
  name: string;
  description: string;
  price: number;
  tokens: number;
  coins: number;
  vip?: boolean;
  background?: boolean;
  backpack?: number | boolean;
  image: string;
}

const PRODUCTS: Record<string, Product> = {
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

const redemptionCodesPath = path.join(__dirname, '..', 'data', 'redemption-codes.json');

function ensureDataDirectory(): void {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(redemptionCodesPath)) {
        fs.writeFileSync(redemptionCodesPath, '{}');
    }
}

function loadRedemptionCodes(): any {
    ensureDataDirectory();
    return JSON.parse(fs.readFileSync(redemptionCodesPath, 'utf-8'));
}

function saveRedemptionCodes(data: any): void {
    ensureDataDirectory();
    fs.writeFileSync(redemptionCodesPath, JSON.stringify(data, null, 2));
}

function generateRedemptionCode(productId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SHERIFF-${productId.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

function saveRedemptionCode(code: string, productData: any): boolean {
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

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/shop', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

app.get('/success', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

app.get('/cancel', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'cancel.html'));
});

app.get('/dashboard', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const dashboardRoutes = require('./routes/dashboard');
app.use('/api', dashboardRoutes);

app.get('/api/config', (req: Request, res: Response) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        configured: !!stripe
    });
});

app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
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

        const redemptionCode = generateRedemptionCode(productId);
        
        saveRedemptionCode(redemptionCode, {
            productId: productId,
            name: product.name,
            tokens: product.tokens,
            coins: product.coins,
            vip: product.vip,
            background: product.background,
            backpack: product.backpack
        });

        const baseUrl = process.env.REPL_SLUG ? 
            `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
            `http://localhost:${PORT}`;

        const imageUrl = product.image ? `${baseUrl}/assets/${product.image}` : null;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: imageUrl ? [imageUrl] : []
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            customer_email: email || undefined,
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

    } catch (error: any) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            error: error.message || 'An error occurred during checkout' 
        });
    }
});

app.get('/api/verify-session/:sessionId', async (req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/webhook', express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret || !sig) {
        return res.status(400).send('Webhook not configured');
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Payment successful:', session.metadata);
            break;
        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

app.use((req: Request, res: Response) => {
    res.status(404).send('404 - Page Not Found 🤠');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Website is running on port ${PORT}`);
    console.log(`🤠 Sheriff Bot Website - Ready!`);
    if (stripe) {
        console.log('💳 Stripe integration - Active');
    } else {
        console.log('⚠️  Stripe not configured (set STRIPE_SECRET_KEY)');
    }
});

export default app;
