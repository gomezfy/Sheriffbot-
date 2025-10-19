// Shop functionality
let stripe = null;
let stripeConfigured = false;

// Initialize Stripe
async function initializeStripe() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (config.publishableKey && config.configured) {
            stripe = Stripe(config.publishableKey);
            stripeConfigured = true;
            console.log('✅ Stripe initialized');
        } else {
            console.warn('⚠️ Stripe not configured');
            showStripeWarning();
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        showStripeWarning();
    }
}

// Show warning if Stripe is not configured
function showStripeWarning() {
    const buttons = document.querySelectorAll('.buy-button');
    buttons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '⚠️ Payment Unavailable';
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    });

    // Show banner
    const shopSection = document.querySelector('.shop-section');
    const warning = document.createElement('div');
    warning.className = 'stripe-warning';
    warning.innerHTML = `
        <div class="container">
            <h3>⚠️ Store Configuration Required</h3>
            <p>The payment system is not configured yet. The store owner needs to set up Stripe API keys.</p>
            <p><strong>For developers:</strong> Set <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PUBLISHABLE_KEY</code> environment variables.</p>
        </div>
    `;
    shopSection.insertBefore(warning, shopSection.firstChild);
}

// Handle purchase
async function handlePurchase(productId) {
    if (!stripeConfigured) {
        alert('Payment system is not configured yet. Please try again later.');
        return;
    }

    // Get user email (optional)
    const email = prompt('Enter your email to receive confirmation (optional):');

    // Show loading
    const button = document.querySelector(`[data-product="${productId}"]`);
    const originalText = button.innerHTML;
    button.innerHTML = '<span>⏳</span> Processing...';
    button.disabled = true;

    try {
        // Create checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                email: email || undefined
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const session = await response.json();

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Purchase error:', error);
        alert('An error occurred during checkout. Please try again.');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Add event listeners to all buy buttons
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe
    initializeStripe();

    // Add click handlers to buy buttons
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product');
            handlePurchase(productId);
        });
    });

    // Add hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Console easter egg
console.log(`
    🤠 SHERIFF BOT SHOP
    ===================
    
    Products:
    - Starter Pack: $1.99
    - Popular Pack: $4.99
    - Gold Pack: $9.99
    - Ultimate Pack: $19.99
    - Backpack Upgrade: $9.99
    
    Powered by Stripe 💳
`);
