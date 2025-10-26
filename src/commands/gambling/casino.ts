import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ColorResolvable, MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { isValidBetAmount, MAX_BET_AMOUNT, isSafeMultiplication } from '../../utils/security';
import { getSaloonTokenEmoji, getSlotMachineEmoji, getCancelEmoji, getMoneybagEmoji, getDartEmoji, getCheckEmoji, getCowboyEmoji } from '../../utils/customEmojis';
const { getUserGold, addUserGold, removeUserGold } = require('../../utils/dataManager');

const cooldowns = new Map();
const userStats = new Map<string, { wins: number; losses: number; biggestWin: number; currentStreak: number; bestStreak: number }>();
const userStreaks = new Map<string, { wins: number; lastPlayed: number }>();

// Weighted slot symbols (rarer = higher payout but lower chance)
const slotSymbols = [
  { symbol: '🍒', weight: 30, name: 'Cherry', color: '#DC143C' },      // Common (30%)
  { symbol: '🍋', weight: 25, name: 'Lemon', color: '#FFD700' },       // Common (25%)
  { symbol: '🍊', weight: 20, name: 'Orange', color: '#FF8C00' },      // Uncommon (20%)
  { symbol: '🔔', weight: 15, name: 'Bell', color: '#FFD700' },        // Uncommon (15%)
  { symbol: '⭐', weight: 8, name: 'Star', color: '#FFFF00' },         // Rare (8%)
  { symbol: '💎', weight: 2, name: 'Diamond', color: '#00CED1' }       // Very Rare (2%)
];

function getWeightedSymbol() {
  const totalWeight = slotSymbols.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of slotSymbols) {
    random -= item.weight;
    if (random <= 0) {
      return item.symbol;
    }
  }
  
  return slotSymbols[0].symbol; // Fallback
}

function getUserStatistics(userId: string) {
  if (!userStats.has(userId)) {
    userStats.set(userId, {
      wins: 0,
      losses: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0
    });
  }
  return userStats.get(userId)!;
}

function updateStatistics(userId: string, won: boolean, winAmount: number) {
  const stats = getUserStatistics(userId);
  
  if (won) {
    stats.wins++;
    stats.currentStreak++;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    stats.biggestWin = Math.max(stats.biggestWin, winAmount);
  } else {
    stats.losses++;
    stats.currentStreak = 0;
  }
}

function getStreakMultiplier(userId: string): number {
  const streak = userStreaks.get(userId);
  if (!streak) return 1.0;
  
  const now = Date.now();
  const timeDiff = now - streak.lastPlayed;
  
  // Reset streak if more than 5 minutes passed
  if (timeDiff > 300000) {
    userStreaks.delete(userId);
    return 1.0;
  }
  
  // Bonus multiplier based on win streak (max 1.5x at 5+ wins)
  if (streak.wins >= 5) return 1.5;
  if (streak.wins >= 4) return 1.4;
  if (streak.wins >= 3) return 1.3;
  if (streak.wins >= 2) return 1.2;
  if (streak.wins >= 1) return 1.1;
  
  return 1.0;
}

function updateStreak(userId: string, won: boolean) {
  const now = Date.now();
  
  if (won) {
    const current = userStreaks.get(userId) || { wins: 0, lastPlayed: now };
    userStreaks.set(userId, { wins: current.wins + 1, lastPlayed: now });
  } else {
    userStreaks.delete(userId);
  }
}

function getPayoutTable(): string {
  return `
╔════════════════════════════════╗
║     💰 PAYOUT TABLE 💰         ║
╠════════════════════════════════╣
║ 💎💎💎  →  x50  (MEGA JACKPOT) ║
║ ⭐⭐⭐  →  x20  (SUPER WIN)    ║
║ 🔔🔔🔔  →  x10  (BIG WIN)      ║
║ 🍊🍊🍊  →  x5   (GREAT WIN)    ║
║ 🍋🍋🍋  →  x3   (NICE WIN)     ║
║ 🍒🍒🍒  →  x2.5 (WIN)          ║
║                                ║
║ 💎💎    →  x5   (DIAMOND BONUS)║
║ ⭐⭐    →  x2   (STAR PAIR)    ║
║ 🔔🔔    →  x1.5 (BELL PAIR)    ║
║ Others  →  x1.2 (SMALL WIN)    ║
╚════════════════════════════════╝
🎰 **Streak Bonus:** Win multiple times in a row for up to +50% extra!
`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casino')
    .setDescription('Try your luck at the slot machine!')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription('Amount of Saloon Tokens to bet')
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(MAX_BET_AMOUNT)
    )
    .addBooleanOption(option =>
      option
        .setName('show-odds')
        .setDescription('Show the payout table before playing')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const showOdds = interaction.options.getBoolean('show-odds') || false;
    
    if (!bet) {
      await interaction.reply({
        content: `${getCancelEmoji()} Please specify a bet amount!`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    // Show payout table if requested
    if (showOdds) {
      const oddsEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`${getSlotMachineEmoji()} CASINO PAYOUT TABLE ${getSlotMachineEmoji()}`)
        .setDescription(getPayoutTable())
        .setFooter({ text: 'Good luck, partner! 🤠' });
      
      await interaction.reply({ embeds: [oddsEmbed], flags: [MessageFlags.Ephemeral] });
      return;
    }
    
    // Security: Validate bet amount
    if (!isValidBetAmount(bet)) {
      await interaction.reply({
        content: `${getCancelEmoji()} Invalid bet amount! Must be between 10 and ${MAX_BET_AMOUNT.toLocaleString()}.`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const now = Date.now();
    const cooldownAmount = 8000; // Reduced from 10s to 8s

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: `⏰ Slow down, partner! Wait ${timeLeft.toFixed(1)} more seconds before spinning again.`,
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }
    }

    const currentGold = getUserGold(userId);

    const tokenEmoji = getSaloonTokenEmoji();
    if (currentGold < bet) {
      await interaction.reply({
        content: `${getCancelEmoji()} You don't have enough tokens! You have ${currentGold} ${tokenEmoji} but tried to bet ${bet} ${tokenEmoji}.`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    // Generate weighted random symbols
    const slot1 = getWeightedSymbol();
    const slot2 = getWeightedSymbol();
    const slot3 = getWeightedSymbol();

    // Calculate base multiplier
    let multiplier = 0;
    let result = '';
    let resultColor: ColorResolvable = '#FF0000';

    // JACKPOT - All 3 match
    if (slot1 === slot2 && slot2 === slot3) {
      if (slot1 === '💎') {
        multiplier = 50;
        result = '💰 **MEGA JACKPOT!** 💰\n✨ Triple Diamonds! You hit the motherload! ✨';
        resultColor = '#FFD700';
      } else if (slot1 === '⭐') {
        multiplier = 20;
        result = '⭐ **SUPER WIN!** ⭐\n🌟 Triple Stars! Lady Luck is with you! 🌟';
        resultColor = '#FFD700';
      } else if (slot1 === '🔔') {
        multiplier = 10;
        result = '🔔 **BIG WIN!** 🔔\n🎉 Triple Bells! The saloon is ringing! 🎉';
        resultColor = '#00FF00';
      } else if (slot1 === '🍊') {
        multiplier = 5;
        result = '🍊 **GREAT WIN!** 🍊\n🎊 Triple Oranges! Sweet victory! 🎊';
        resultColor = '#00FF00';
      } else if (slot1 === '🍋') {
        multiplier = 3;
        result = '🍋 **NICE WIN!** 🍋\n😊 Triple Lemons! Sour but profitable! 😊';
        resultColor = '#00FF00';
      } else {
        multiplier = 2.5;
        result = '🍒 **WIN!** 🍒\n👍 Triple Cherries! Not bad, cowboy! 👍';
        resultColor = '#00FF00';
      }
    }
    // Two diamonds (special bonus even without 3)
    else if ((slot1 === '💎' && slot2 === '💎') || (slot2 === '💎' && slot3 === '💎') || (slot1 === '💎' && slot3 === '💎')) {
      multiplier = 5;
      result = '💎 **DIAMOND BONUS!** 💎\n💍 Two Diamonds! Rare and valuable! 💍';
      resultColor = '#FFD700';
    }
    // Two matching symbols
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      const matchSymbol = slot1 === slot2 ? slot1 : (slot2 === slot3 ? slot2 : slot1);
      
      if (matchSymbol === '⭐') {
        multiplier = 2;
        result = '⭐ Small win! Two Stars shining! ⭐';
        resultColor = '#FFFF00';
      } else if (matchSymbol === '🔔') {
        multiplier = 1.5;
        result = '🔔 Small win! Two Bells ringing! 🔔';
        resultColor = '#FFFF00';
      } else {
        multiplier = 1.2;
        result = '😊 Small win! Two matching symbols!';
        resultColor = '#FFFF00';
      }
    }
    // Near miss - 1 diamond
    else if ((slot1 === '💎' || slot2 === '💎' || slot3 === '💎')) {
      multiplier = 0;
      result = '💔 **SO CLOSE!** One Diamond away from glory!\n🎲 Better luck next spin!';
    }
    // Total loss
    else {
      multiplier = 0;
      result = '😔 No match... The house wins this round!\n🔄 Try again, partner!';
    }

    const won = multiplier > 0;
    
    // Apply streak bonus
    const streakMultiplier = getStreakMultiplier(userId);
    const finalMultiplier = won ? multiplier * streakMultiplier : 0;
    
    // Security: Check for integer overflow before calculating winnings
    if (won && !isSafeMultiplication(bet, finalMultiplier)) {
      await interaction.reply({
        content: '❌ Bet amount too large for this multiplier!',
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }
    
    const winAmount = won ? Math.floor(bet * finalMultiplier) : 0;

    let finalMessage = '';
    if (won) {
      const netWinnings = winAmount - bet;
      const addResult = addUserGold(userId, netWinnings);

      if (!addResult.success) {
        await interaction.reply({
          content: `🚫 **You won but your inventory is full!**\n\n${addResult.error}\n\nYour bet was not deducted. Free up space and try again!`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      finalMessage = `\n\n💵 **Net Profit: +${netWinnings.toLocaleString()} ${tokenEmoji}**`;
      
      if (streakMultiplier > 1.0) {
        const bonusPercent = Math.round((streakMultiplier - 1.0) * 100);
        finalMessage += `\n🔥 **Streak Bonus: +${bonusPercent}% (${userStreaks.get(userId)?.wins || 0} wins in a row!)**`;
      }
    } else {
      removeUserGold(userId, bet);
      finalMessage = `\n\n💸 **Lost: -${bet.toLocaleString()} ${tokenEmoji}**`;
    }

    // Update statistics and streaks
    updateStatistics(userId, won, winAmount);
    updateStreak(userId, won);
    
    const newGold = getUserGold(userId);
    const stats = getUserStatistics(userId);

    const slotEmoji = getSlotMachineEmoji();
    
    // Stage 1: Initial spin
    const spinningEmbed1 = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${slotEmoji} SALOON SLOT MACHINE ${slotEmoji}`)
      .setDescription('```\n╔═══════════════╗\n║  🎰 ? ? ? 🎰  ║\n╚═══════════════╝\n```\n\n**🎲 SPINNING...**')
      .setFooter({ text: `💰 Bet: ${bet.toLocaleString()} ${tokenEmoji}` });

    await interaction.reply({ embeds: [spinningEmbed1] });

    // Stage 2: First reel stops
    await new Promise(resolve => setTimeout(resolve, 800));
    const spinningEmbed2 = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${slotEmoji} SALOON SLOT MACHINE ${slotEmoji}`)
      .setDescription(`\`\`\`\n╔═══════════════╗\n║  🎰 ${slot1} ? ? 🎰  ║\n╚═══════════════╝\n\`\`\`\n\n**🎲 SPINNING...**`)
      .setFooter({ text: `💰 Bet: ${bet.toLocaleString()} ${tokenEmoji}` });
    
    await interaction.editReply({ embeds: [spinningEmbed2] });

    // Stage 3: Second reel stops
    await new Promise(resolve => setTimeout(resolve, 800));
    const spinningEmbed3 = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${slotEmoji} SALOON SLOT MACHINE ${slotEmoji}`)
      .setDescription(`\`\`\`\n╔═══════════════╗\n║  🎰 ${slot1} ${slot2} ? 🎰  ║\n╚═══════════════╝\n\`\`\`\n\n**🎲 FINAL SPIN...**`)
      .setFooter({ text: `💰 Bet: ${bet.toLocaleString()} ${tokenEmoji}` });
    
    await interaction.editReply({ embeds: [spinningEmbed3] });

    // Stage 4: Final result
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show result
    const embed = new EmbedBuilder()
      .setColor(resultColor)
      .setTitle(`${slotEmoji} SALOON SLOT MACHINE ${slotEmoji}`)
      .setDescription(`\`\`\`\n╔═══════════════╗\n║  🎰 ${slot1} ${slot2} ${slot3} 🎰  ║\n╚═══════════════╝\n\`\`\`\n\n${result}${finalMessage}`)
      .addFields(
        { name: `${getMoneybagEmoji()} Bet`, value: `${bet.toLocaleString()} ${tokenEmoji}`, inline: true },
        { name: `${getDartEmoji()} Multiplier`, value: `x${finalMultiplier.toFixed(1)}`, inline: true },
        { name: won ? `${getCheckEmoji()} Won` : `${getCancelEmoji()} Lost`, value: won ? `${winAmount.toLocaleString()} ${tokenEmoji}` : `${bet.toLocaleString()} ${tokenEmoji}`, inline: true },
        { name: `${getMoneybagEmoji()} Balance`, value: `**${newGold.toLocaleString()} ${tokenEmoji}**`, inline: true },
        { name: '📊 Your Stats', value: `🏆 ${stats.wins}W - ${stats.losses}L | 🔥 Best: ${stats.bestStreak}`, inline: true },
        { name: '💎 Biggest Win', value: `${stats.biggestWin.toLocaleString()} ${tokenEmoji}`, inline: true }
      )
      .setFooter({ text: won ? `${getCowboyEmoji()} The house always wins... except today!` : '🎰 Try again, fortune favors the brave!' })
      .setTimestamp();

    cooldowns.set(userId, now);
    setTimeout(() => cooldowns.delete(userId), cooldownAmount);

    await interaction.editReply({ embeds: [embed] });
  },
};
