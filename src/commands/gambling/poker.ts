import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { getCowboyEmoji } from '../../utils/customEmojis';
const { getUserGold, addUserGold, removeUserGold } = require('../../utils/dataManager');

const cooldowns = new Map();

const suits = ['♠️', '♥️', '♣️', '♦️'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const valueRanks = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

function createDeck(): Array<{ suit: string; value: string; display: string; rank: number }> {
  const deck: Array<{ suit: string; value: string; display: string; rank: number }> = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value, display: `${value}${suit}`, rank: (valueRanks as any)[value] });
    }
  }
  return deck;
}

function shuffleDeck(deck: Array<{ suit: string; value: string; display: string; rank: number }>) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealHand(deck: Array<{ suit: string; value: string; display: string; rank: number }>) {
  return deck.splice(0, 5);
}

function isStraight(cards: Array<{ suit: string; value: string; display: string; rank: number }>) {
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  
  // Check for regular straight
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].rank !== sorted[i].rank + 1) {
      // Check for A-2-3-4-5 (wheel)
      if (sorted[0].rank === 2 && sorted[4].rank === 14) {
        const wheel = [2, 3, 4, 5, 14];
        const isWheel = sorted.every((card, idx) => card.rank === wheel[idx]);
        if (isWheel) return { isStraight: true, highCard: 5 }; // In wheel, 5 is high
      }
      return { isStraight: false, highCard: 0 };
    }
  }
  
  return { isStraight: true, highCard: sorted[4].rank };
}

function getHandValue(cards: Array<{ suit: string; value: string; display: string; rank: number }>) {
  const valueCount: Record<string, number> = {};
  const suitCount: Record<string, number> = {};
  
  cards.forEach(card => {
    valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
  });

  const counts = Object.values(valueCount).sort((a, b) => b - a);
  const isFlush = Object.values(suitCount).some(count => count === 5);
  const straightResult = isStraight(cards);
  const isStraightValue = straightResult.isStraight;
  
  // Get high card
  const highCard = Math.max(...cards.map(c => c.rank));
  
  // Royal Flush (A-K-Q-J-10 suited)
  if (isFlush && isStraightValue && straightResult.highCard === 14) {
    return { rank: 10, name: '👑 ROYAL FLUSH', multiplier: 100, highCard };
  }
  
  // Straight Flush
  if (isFlush && isStraightValue) {
    return { rank: 9, name: '💎 Straight Flush', multiplier: 50, highCard: straightResult.highCard };
  }
  
  // Four of a Kind
  if (counts[0] === 4) {
    return { rank: 8, name: '🎰 Four of a Kind', multiplier: 25, highCard };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: 7, name: '🏠 Full House', multiplier: 15, highCard };
  }
  
  // Flush
  if (isFlush) {
    return { rank: 6, name: '🌟 Flush', multiplier: 10, highCard };
  }
  
  // Straight
  if (isStraightValue) {
    return { rank: 5, name: '📊 Straight', multiplier: 7, highCard: straightResult.highCard };
  }
  
  // Three of a Kind
  if (counts[0] === 3) {
    return { rank: 4, name: '🎲 Three of a Kind', multiplier: 5, highCard };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: 3, name: '👥 Two Pair', multiplier: 3, highCard };
  }
  
  // One Pair
  if (counts[0] === 2) {
    return { rank: 2, name: '🎯 One Pair', multiplier: 2, highCard };
  }
  
  // High Card
  return { rank: 1, name: '🃏 High Card', multiplier: 1.5, highCard };
}

// Intelligent dealer strategy
function dealerStrategy(hand: Array<{ suit: string; value: string; display: string; rank: number }>, playerHandRank: number) {
  const handValue = getHandValue(hand);
  
  // If dealer has high card or low pair and player seems strong, dealer might "improve" hand
  if (handValue.rank <= 2 && playerHandRank >= 4) {
    // 30% chance dealer gets lucky and redraws
    if (Math.random() < 0.3) {
      const deck = shuffleDeck(createDeck());
      return dealHand(deck); // Lucky redraw
    }
  }
  
  return hand;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poker')
    .setDescription('Play 5-card poker against the dealer!')
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription('Amount of Saloon Tokens to bet')
        .setRequired(true)
        .setMinValue(20)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');

    if (!bet) {
      await interaction.reply({
        content: '❌ Please specify a bet amount!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const now = Date.now();
    const cooldownAmount = 15000;

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: `⏰ Hold on there, partner! Wait ${timeLeft.toFixed(1)} more seconds before playing again.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    const currentGold = getUserGold(userId);

    if (currentGold < bet) {
      await interaction.reply({
        content: `❌ You don't have enough tokens! You have ${currentGold} 🎫 but tried to bet ${bet} 🎫.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Create and shuffle deck
    let deck = shuffleDeck(createDeck());
    
    // Deal hands
    const playerHand = dealHand(deck);
    let dealerHand = dealHand(deck);
    
    const playerResult = getHandValue(playerHand);
    
    // Dealer uses strategy (might redraw if hand is weak)
    dealerHand = dealerStrategy(dealerHand, playerResult.rank);
    const dealerResult = getHandValue(dealerHand);


    let won = false;
    let winAmount = 0;
    let resultText = '';
    let resultColor = '#FF0000';

    // Determine winner
    if (playerResult.rank > dealerResult.rank) {
        won = true;
        winAmount = Math.floor(bet * playerResult.multiplier);
        resultText = `🎉 **YOU WIN!** 🎉\n\nYour ${playerResult.name} beats dealer's ${dealerResult.name}!`;
        resultColor = '#00FF00';

        const netWinnings = winAmount - bet;
        const addResult = addUserGold(userId, netWinnings);

        if (!addResult.success) {
            await interaction.reply({
                content: `🚫 **You won but your inventory is full!**\n\n${addResult.error}\n\nYour bet was not deducted. Free up space and try again!`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    } else if (playerResult.rank === dealerResult.rank) {
        // Same hand rank - compare high cards
        if (playerResult.highCard > dealerResult.highCard) {
            won = true;
            winAmount = bet * 2; // Lower multiplier for kicker win
            resultText = `😊 **YOU WIN BY KICKER!** 😊\n\nBoth have ${playerResult.name}, but your high card (${values[playerResult.highCard - 2]}) wins!`;
            resultColor = '#FFFF00';

            addUserGold(userId, bet); // Just add the bet amount
        } else if (playerResult.highCard === dealerResult.highCard) {
            won = false;
            winAmount = bet; // Return bet
            resultText = `🤝 **PERFECT TIE!** 🤝\n\nBoth have ${playerResult.name} with same high card. No tokens exchanged.`;
            resultColor = '#FFD700';
            // No transaction
        } else {
            won = false;
            resultText = `😔 **DEALER WINS BY KICKER** 😔\n\nBoth have ${playerResult.name}, but dealer's high card wins.`;
            resultColor = '#FF0000';
            removeUserGold(userId, bet);
        }
    } else {
        won = false;
        resultText = `😔 **DEALER WINS** 😔\n\nDealer's ${dealerResult.name} beats your ${playerResult.name}.`;
        resultColor = '#FF0000';
        removeUserGold(userId, bet);
    }

    const newGold = getUserGold(userId);

    const playerCards = playerHand.map(c => c.display).join(' ');
    const dealerCards = dealerHand.map(c => c.display).join(' ');
    
    const profit = won ? winAmount - bet : -bet;
    const profitText = profit > 0 ? `💰 **Profit: +${profit} tokens**` : (profit === 0 ? `🤝 **No loss**` : `💸 **Lost: ${Math.abs(profit)} tokens**`);

    const embed = new EmbedBuilder()
      .setColor(resultColor as any)
      .setTitle('🃏 TEXAS HOLD\'EM POKER 🃏')
      .setDescription(`${resultText}\n\n${profitText}`)
      .addFields(
        { name: '👤 Your Hand', value: `\`${playerCards}\`\n**${playerResult.name}**`, inline: false },
        { name: '🎩 Dealer Hand', value: `\`${dealerCards}\`\n**${dealerResult.name}**`, inline: false },
        { name: '💰 Bet', value: `${bet} 🎫`, inline: true },
        { name: '🎯 Multiplier', value: `x${playerResult.multiplier}`, inline: true },
        { name: won ? '✅ Won' : (profit === 0 ? '🤝 Tie' : '❌ Lost'), value: won ? `${winAmount} 🎫` : (profit === 0 ? 'Bet returned' : `${bet} 🎫`), inline: true },
        { name: '💼 New Balance', value: `**${newGold.toLocaleString()} 🎫** Saloon Tokens`, inline: false }
      )
      .setFooter({ text: won ? `${getCowboyEmoji()} You got a winning hand, partner!` : (profit === 0 ? '🎲 Evenly matched!' : '🃏 The cards weren\'t in your favor this time!') })
      .setTimestamp();

    cooldowns.set(userId, now);
    setTimeout(() => cooldowns.delete(userId), cooldownAmount);

    await interaction.reply({ embeds: [embed] });
  },
};
