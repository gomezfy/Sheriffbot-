"use strict";
class CasinoGame {
    constructor() {
        this.symbols = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎'];
        this.weights = [30, 25, 20, 15, 8, 2];
        this.balance = 0;
        this.wins = 0;
        this.losses = 0;
        this.streak = 0;
        this.userId = '';
        this.sessionId = '';
        this.isSpinning = false;
        this.elements = {
            balance: document.getElementById('balance'),
            wins: document.getElementById('wins'),
            losses: document.getElementById('losses'),
            streak: document.getElementById('streak'),
            result: document.getElementById('result'),
            spinBtn: document.getElementById('spinBtn'),
            betAmount: document.getElementById('betAmount'),
            reel1: document.getElementById('reel1'),
            reel2: document.getElementById('reel2'),
            reel3: document.getElementById('reel3'),
            particles: document.getElementById('particles'),
            stars: document.getElementById('stars'),
        };
        this.init();
    }
    async init() {
        this.createStarField();
        await this.loadGameData();
    }
    createStarField() {
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${2 + Math.random() * 2}s`;
            this.elements.stars.appendChild(star);
        }
    }
    setBet(amount) {
        this.elements.betAmount.value = amount.toString();
        this.playButtonFeedback();
    }
    playButtonFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
    createParticles(count = 20) {
        const particleSymbols = ['💰', '⭐', '💎', '🔔', '🎊', '✨'];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];
            const startX = 50;
            const randomX = (Math.random() - 0.5) * 200;
            particle.style.setProperty('--tx', `${randomX}px`);
            particle.style.left = `${startX}%`;
            particle.style.top = '50%';
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            particle.style.animationDuration = `${1.5 + Math.random()}s`;
            this.elements.particles.appendChild(particle);
            setTimeout(() => particle.remove(), 2500);
        }
    }
    async loadGameData() {
        const params = new URLSearchParams(window.location.search);
        this.userId = params.get('userId') || '';
        this.sessionId = params.get('session') || '';
        if (!this.userId || !this.sessionId) {
            this.showError('❌ Sessão inválida');
            this.elements.spinBtn.disabled = true;
            return;
        }
        try {
            const response = await fetch(`/api/casino/session/${this.sessionId}`);
            const data = await response.json();
            if (data.success) {
                this.balance = data.balance;
                this.wins = data.stats.wins || 0;
                this.losses = data.stats.losses || 0;
                this.streak = data.stats.currentStreak || 0;
                this.updateDisplay();
            }
            else {
                this.showError('❌ Sessão expirada');
                this.elements.spinBtn.disabled = true;
            }
        }
        catch (error) {
            console.error('Erro ao carregar:', error);
            this.showError('❌ Erro ao carregar sessão');
        }
    }
    updateDisplay() {
        this.elements.balance.textContent = this.balance.toLocaleString('pt-BR');
        this.elements.wins.textContent = this.wins.toString();
        this.elements.losses.textContent = this.losses.toString();
        this.elements.streak.textContent = this.streak.toString();
    }
    showError(message) {
        this.elements.result.textContent = message;
        this.elements.result.className = 'result-message loss';
    }
    showResult(data) {
        let resultClass = data.won ? 'win' : 'loss';
        if (data.multiplier >= 20) {
            resultClass = 'jackpot';
            this.createParticles(80);
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
        else if (data.won) {
            this.createParticles(40);
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
        }
        this.elements.result.className = 'result-message ' + resultClass;
        this.elements.result.textContent = data.result;
    }
    animateReel(reel, finalSymbol, delay) {
        return new Promise((resolve) => {
            reel.classList.add('spinning');
            const interval = setInterval(() => {
                reel.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            }, 80);
            setTimeout(() => {
                clearInterval(interval);
                reel.textContent = finalSymbol;
                reel.classList.remove('spinning');
                resolve();
            }, delay);
        });
    }
    async spin() {
        if (this.isSpinning)
            return;
        const bet = parseInt(this.elements.betAmount.value);
        if (bet < 10) {
            this.showError('❌ Aposta mínima: 10 fichas');
            return;
        }
        if (bet > this.balance) {
            this.showError('❌ Saldo insuficiente!');
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            return;
        }
        this.isSpinning = true;
        this.elements.spinBtn.disabled = true;
        this.elements.result.textContent = '🎲 GIRANDO...';
        this.elements.result.className = 'result-message';
        this.elements.reel1.classList.remove('win');
        this.elements.reel2.classList.remove('win');
        this.elements.reel3.classList.remove('win');
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        try {
            const response = await fetch('/api/casino/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    bet
                })
            });
            const data = await response.json();
            if (!data.success) {
                this.showError('❌ ' + (data.error || 'Erro desconhecido'));
                this.isSpinning = false;
                this.elements.spinBtn.disabled = false;
                return;
            }
            await this.animateReel(this.elements.reel1, data.symbols[0], 1200);
            await this.animateReel(this.elements.reel2, data.symbols[1], 1800);
            await this.animateReel(this.elements.reel3, data.symbols[2], 2400);
            if (data.won) {
                setTimeout(() => {
                    this.elements.reel1.classList.add('win');
                    this.elements.reel2.classList.add('win');
                    this.elements.reel3.classList.add('win');
                }, 100);
            }
            this.balance = data.newBalance;
            this.wins = data.stats.wins;
            this.losses = data.stats.losses;
            this.streak = data.stats.currentStreak;
            this.updateDisplay();
            this.showResult(data);
            setTimeout(() => {
                this.elements.reel1.classList.remove('win');
                this.elements.reel2.classList.remove('win');
                this.elements.reel3.classList.remove('win');
            }, 2000);
        }
        catch (error) {
            console.error('Erro ao girar:', error);
            this.showError('❌ Erro de conexão');
        }
        finally {
            this.isSpinning = false;
            this.elements.spinBtn.disabled = false;
        }
    }
}
let gameInstance;
window.addEventListener('DOMContentLoaded', () => {
    gameInstance = new CasinoGame();
});
function setBet(amount) {
    if (gameInstance) {
        gameInstance.setBet(amount);
    }
}
function spin() {
    if (gameInstance) {
        gameInstance.spin();
    }
}
