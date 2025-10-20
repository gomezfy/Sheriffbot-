// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Animate on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card, .command-category, .stat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toString().includes('+') ? target : Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const num = parseInt(text.replace(/\D/g, ''));
                const hasPlus = text.includes('+');
                
                if (!isNaN(num)) {
                    stat.textContent = '0';
                    setTimeout(() => {
                        animateCounter(stat, num);
                        if (hasPlus) {
                            setTimeout(() => {
                                stat.textContent = stat.textContent + '+';
                            }, 2000);
                        }
                    }, 300);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Add hover effect to command items
document.querySelectorAll('.command-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(8px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

    if (konamiCode.join('').includes(konamiSequence.join(''))) {
        document.body.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            document.body.style.transform = 'rotate(0deg)';
        }, 1000);
        
        // Show easter egg message
        const message = document.createElement('div');
        message.textContent = '🤠 Howdy, partner! You found the secret!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #8B4513;
            color: white;
            padding: 2rem 3rem;
            border-radius: 12px;
            font-size: 1.5rem;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
        
        konamiCode = [];
    }
});

// Log welcome message
console.log(`
    🤠 SHERIFF BOT - Western Discord Bot
    ====================================
    
    Features:
    ✓ 33 Commands (10 Economy, 5 Gambling, 3 Bounty, 3 Profile, 8 Admin, 3 Utility, 1 Mining)
    ✓ 47 Custom Emojis
    ✓ 3 Languages (PT-BR, EN-US, ES-ES)
    ✓ Dual Economy System (Tokens + Silver)
    ✓ Work System (5 Western Jobs)
    ✓ Leaderboard Rankings (Top 10)
    ✓ PvP Duels System
    ✓ Mining System (Solo + Co-op)
    ✓ Gambling Games
    ✓ Bounty System + Wanted Posters
    ✓ Visual Profile Cards
    ✓ Web Dashboard with OAuth
    ✓ E-commerce Integration
    
    Add to Discord: https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands
`);
