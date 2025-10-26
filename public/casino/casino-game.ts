interface GameStats {
  wins: number;
  losses: number;
  currentStreak: number;
}

interface SpinResponse {
  success: boolean;
  won: boolean;
  symbols: string[];
  newBalance: number;
  multiplier: number;
  result: string;
  stats: GameStats;
  error?: string;
}

interface SessionResponse {
  success: boolean;
  balance: number;
  stats: GameStats;
  error?: string;
}

class CasinoGame {
  private readonly symbols: string[] = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎'];
  private readonly weights: number[] = [30, 25, 20, 15, 8, 2];

  private balance: number = 0;
  private wins: number = 0;
  private losses: number = 0;
  private streak: number = 0;
  private userId: string = '';
  private sessionId: string = '';
  private isSpinning: boolean = false;

  private elements = {
    balance: document.getElementById('balance') as HTMLElement,
    wins: document.getElementById('wins') as HTMLElement,
    losses: document.getElementById('losses') as HTMLElement,
    streak: document.getElementById('streak') as HTMLElement,
    result: document.getElementById('result') as HTMLElement,
    spinBtn: document.getElementById('spinBtn') as HTMLButtonElement,
    betAmount: document.getElementById('betAmount') as HTMLInputElement,
    reel1: document.getElementById('reel1') as HTMLElement,
    reel2: document.getElementById('reel2') as HTMLElement,
    reel3: document.getElementById('reel3') as HTMLElement,
    particles: document.getElementById('particles') as HTMLElement,
    stars: document.getElementById('stars') as HTMLElement,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.createStarField();
    await this.loadGameData();
  }

  private createStarField(): void {
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

  public setBet(amount: number): void {
    this.elements.betAmount.value = amount.toString();
    this.playButtonFeedback();
  }

  private playButtonFeedback(): void {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  private createParticles(count: number = 20): void {
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

  private async loadGameData(): Promise<void> {
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
      const data: SessionResponse = await response.json();

      if (data.success) {
        this.balance = data.balance;
        this.wins = data.stats.wins || 0;
        this.losses = data.stats.losses || 0;
        this.streak = data.stats.currentStreak || 0;
        this.updateDisplay();
      } else {
        this.showError('❌ Sessão expirada');
        this.elements.spinBtn.disabled = true;
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
      this.showError('❌ Erro ao carregar sessão');
    }
  }

  private updateDisplay(): void {
    this.elements.balance.textContent = this.balance.toLocaleString('pt-BR');
    this.elements.wins.textContent = this.wins.toString();
    this.elements.losses.textContent = this.losses.toString();
    this.elements.streak.textContent = this.streak.toString();
  }

  private showError(message: string): void {
    this.elements.result.textContent = message;
    this.elements.result.className = 'result-message loss';
  }

  private showResult(data: SpinResponse): void {
    let resultClass = data.won ? 'win' : 'loss';

    if (data.multiplier >= 20) {
      resultClass = 'jackpot';
      this.createParticles(80);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } else if (data.won) {
      this.createParticles(40);
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    }

    this.elements.result.className = 'result-message ' + resultClass;
    this.elements.result.textContent = data.result;
  }

  private animateReel(
    reel: HTMLElement,
    finalSymbol: string,
    delay: number
  ): Promise<void> {
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

  public async spin(): Promise<void> {
    if (this.isSpinning) return;

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

      const data: SpinResponse = await response.json();

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

    } catch (error) {
      console.error('Erro ao girar:', error);
      this.showError('❌ Erro de conexão');
    } finally {
      this.isSpinning = false;
      this.elements.spinBtn.disabled = false;
    }
  }
}

let gameInstance: CasinoGame;

window.addEventListener('DOMContentLoaded', () => {
  gameInstance = new CasinoGame();
});

function setBet(amount: number): void {
  if (gameInstance) {
    gameInstance.setBet(amount);
  }
}

function spin(): void {
  if (gameInstance) {
    gameInstance.spin();
  }
}
