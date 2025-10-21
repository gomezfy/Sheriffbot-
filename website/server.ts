import express, { Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = parseInt(process.env.PORT || (process.env.REPL_SLUG ? '5000' : '8080'));

// Hotmart API configuration
const HOTMART_CONFIG = {
  clientId: process.env.HOTMART_CLIENT_ID || '',
  clientSecret: process.env.HOTMART_CLIENT_SECRET || '',
  hottok: process.env.HOTMART_HOTTOK || '',
  checkoutBaseUrl: 'https://pay.hotmart.com',
  apiBaseUrl: 'https://api-sec-vlc.hotmart.com',
  hotConnectUrl: 'https://api-hot-connect.hotmart.com'
};

// Get Hotmart OAuth token
async function getHotmartAccessToken(): Promise<string | null> {
  try {
    if (!HOTMART_CONFIG.clientId || !HOTMART_CONFIG.clientSecret) {
      return null;
    }

    const response = await axios.post(
      `${HOTMART_CONFIG.apiBaseUrl}/security/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: HOTMART_CONFIG.clientId,
        client_secret: HOTMART_CONFIG.clientSecret
      }
    );
    
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting Hotmart access token:', error.message);
    return null;
  }
}

// Verify Hotmart webhook signature
function verifyHotmartWebhook(req: Request): boolean {
  const hottok = req.body.hottok || req.query.hottok;
  return hottok === HOTMART_CONFIG.hottok;
}

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
            createdBy: 'paypal_checkout',
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

app.use('/api', dashboardRoutes);

// Get Hotmart configuration for frontend
app.get('/api/config', (req: Request, res: Response) => {
    res.json({
        provider: 'hotmart',
        configured: !!(HOTMART_CONFIG.clientId && HOTMART_CONFIG.clientSecret),
        productBaseUrl: 'https://pay.hotmart.com'
    });
});

// Create Hotmart checkout link
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        if (!HOTMART_CONFIG.clientId || !HOTMART_CONFIG.clientSecret) {
            return res.status(500).json({ 
                error: 'Hotmart is not configured. Please set HOTMART_CLIENT_ID and HOTMART_CLIENT_SECRET.' 
            });
        }

        const { productId } = req.body;
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

        const hotmartProductId = process.env[`HOTMART_PRODUCT_${productId.toUpperCase()}`] || '';
        
        if (!hotmartProductId) {
            return res.status(400).json({ 
                error: `Hotmart product ID not configured for ${productId}` 
            });
        }

        const checkoutUrl = `${HOTMART_CONFIG.checkoutBaseUrl}/${hotmartProductId}?sck=${redemptionCode}&redirect=true`;
        
        res.json({ 
            checkoutUrl,
            redemptionCode
        });

    } catch (error: any) {
        console.error('Hotmart checkout creation error:', error);
        res.status(500).json({ 
            error: error.message || 'An error occurred during checkout' 
        });
    }
});

// Hotmart Webhook endpoint
app.post('/api/webhook/hotmart', async (req: Request, res: Response) => {
    try {
        if (!verifyHotmartWebhook(req)) {
            console.error('⚠️ Invalid Hotmart webhook signature');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { event, data } = req.body;
        
        console.log('📨 Hotmart webhook received:', { event, data });

        switch (event) {
            case 'PURCHASE_COMPLETE':
            case 'PURCHASE_APPROVED':
                const customId = data.purchase?.offer_code || data.purchase?.sck || '';
                
                if (customId) {
                    const redemptionCodes = loadRedemptionCodes();
                    
                    if (redemptionCodes[customId]) {
                        redemptionCodes[customId].paid = true;
                        redemptionCodes[customId].paidAt = Date.now();
                        redemptionCodes[customId].buyer = {
                            email: data.buyer?.email,
                            name: data.buyer?.name
                        };
                        redemptionCodes[customId].transaction = data.purchase?.transaction;
                        
                        saveRedemptionCodes(redemptionCodes);
                        
                        console.log('✅ Payment confirmed for redemption code:', customId);
                    }
                }
                break;
                
            case 'PURCHASE_REFUNDED':
            case 'PURCHASE_CANCELED':
                const refundCustomId = data.purchase?.offer_code || data.purchase?.sck || '';
                
                if (refundCustomId) {
                    const redemptionCodes = loadRedemptionCodes();
                    
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

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        res.sendStatus(200);
    }
});

app.use((req: Request, res: Response) => {
    res.status(404).send('404 - Page Not Found 🤠');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Website is running on port ${PORT}`);
    console.log(`🤠 Sheriff Bot Website - Ready!`);
    if (HOTMART_CONFIG.clientId && HOTMART_CONFIG.clientSecret) {
        console.log(`💰 Hotmart integration - Active`);
        console.log(`📨 Webhook URL: ${PORT === 5000 ? 'http://localhost:5000' : 'https://your-domain.com'}/api/webhook/hotmart`);
    } else {
        console.log('⚠️  Hotmart not configured (set HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET, and HOTMART_HOTTOK)');
    }
});

export default app;
