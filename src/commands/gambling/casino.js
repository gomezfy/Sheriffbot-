const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserGold, addUserGold, removeUserGold } = require('../../utils/dataManager');

const cooldowns = new Map();

// Weighted slot symbols (rarer = higher payout but lower chance)
const slotSymbols = [
  { symbol: '🍒', weight: 30, name: 'Cherry' },      // Common (30%)
  { symbol: '🍋', weight: 25, name: 'Lemon' },       // Common (25%)
  { symbol: '🍊', weight: 20, name: 'Orange' },      // Uncommon (20%)
  { symbol: '🔔', weight: 15, name: 'Bell' },        // Uncommon (15%)
  { symbol: '⭐', weight: 8, name: 'Star' },         // Rare (8%)
  { symbol: '💎', weight: 2, name: 'Diamond' }       // Very Rare (2%)
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casino')
    .setDescription('Try your luck at the slot machine!')
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription('Amount of Saloon Tokens to bet')
        .setRequired(true)
        .setMinValue(10)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');

    const now = Date.now();
    const cooldownAmount = 10000;

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({
          content: `⏰ Slow down, partner! Wait ${timeLeft.toFixed(1)} more seconds before spinning again.`,
          ephemeral: true
        });
      }
    }

    const currentGold = getUserGold(userId);

    if (currentGold < bet) {
      return interaction.reply({
        content: `❌ You don't have enough tokens! You have ${currentGold} 🎫 but tried to bet ${bet} 🎫.`,
        ephemeral: true
      });
    }

    // Remove bet first
    const removeResult = removeUserGold(userId, bet);
    
    if (!removeResult.success) {
      return interaction.reply({
        content: `❌ Error removing bet: ${removeResult.error}`,
        ephemeral: true
      });
    }

    // Generate weighted random symbols
    const slot1 = getWeightedSymbol();
    const slot2 = getWeightedSymbol();
    const slot3 = getWeightedSymbol();

    // Calculate result
    let multiplier = 0;
    let result = '';
    let resultColor = '#FF0000';

    // JACKPOT - All 3 match
    if (slot1 === slot2 && slot2 === slot3) {
      if (slot1 === '💎') {
        multiplier = 50;
        result = '💰 **MEGA JACKPOT!** 💰\nTriple Diamonds! You hit the motherload!';
        resultColor = '#FFD700';
      } else if (slot1 === '⭐') {
        multiplier = 20;
        result = '⭐ **SUPER WIN!** ⭐\nTriple Stars! Lady Luck is with you!';
        resultColor = '#FFD700';
      } else if (slot1 === '🔔') {
        multiplier = 10;
        result = '🔔 **BIG WIN!** 🔔\nTriple Bells! The saloon is ringing!';
        resultColor = '#00FF00';
      } else if (slot1 === '🍊') {
        multiplier = 5;
        result = '🍊 **GREAT WIN!** 🍊\nTriple Oranges! Sweet victory!';
        resultColor = '#00FF00';
      } else if (slot1 === '🍋') {
        multiplier = 3;
        result = '🍋 **NICE WIN!** 🍋\nTriple Lemons! Sour but profitable!';
        resultColor = '#00FF00';
      } else {
        multiplier = 2.5;
        result = '🍒 **WIN!** 🍒\nTriple Cherries! Not bad, cowboy!';
        resultColor = '#00FF00';
      }
    }
    // Two diamonds (special bonus even without 3)
    else if ((slot1 === '💎' && slot2 === '💎') || (slot2 === '💎' && slot3 === '💎') || (slot1 === '💎' && slot3 === '💎')) {
      multiplier = 5;
      result = '💎 **DIAMOND BONUS!** 💎\nTwo Diamonds! Rare and valuable!';
      resultColor = '#FFD700';
    }
    // Two matching symbols
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      const matchSymbol = slot1 === slot2 ? slot1 : (slot2 === slot3 ? slot2 : slot1);
      
      if (matchSymbol === '⭐') {
        multiplier = 2;
        result = '⭐ Small win! Two Stars shining!';
        resultColor = '#FFFF00';
      } else if (matchSymbol === '🔔') {
        multiplier = 1.5;
        result = '🔔 Small win! Two Bells ringing!';
        resultColor = '#FFFF00';
      } else {
        multiplier = 1.2;
        result = '😊 Small win! Two matching symbols!';
        resultColor = '#FFFF00';
      }
    }
    // Near miss - 2 diamonds but no match
    else if ((slot1 === '💎' || slot2 === '💎' || slot3 === '💎')) {
      multiplier = 0;
      result = '💔 **SO CLOSE!** One Diamond away from glory!\nBetter luck next spin!';
    }
    // Total loss
    else {
      multiplier = 0;
      result = '😔 No match... The house wins this round!\nTry again, partner!';
    }

    const won = multiplier > 0;
    const winAmount = won ? Math.floor(bet * multiplier) : 0;

    // If won, add winnings
    let finalMessage = '';
    if (won) {
      const addResult = addUserGold(userId, winAmount);
      
      if (!addResult.success) {
        // Couldn't add winnings due to weight! Return the bet
        addUserGold(userId, bet);
        
        return interaction.reply({
          content: `🚫 **You won but your inventory is full!**\n\n${addResult.error}\n\nYour bet was returned. Free up space and try again!`,
          ephemeral: true
        });
      }
      
      finalMessage = `\n\n💵 **Profit: +${winAmount - bet} tokens**`;
    } else {
      finalMessage = `\n\n💸 **Lost: -${bet} tokens**`;
    }

    const newGold = getUserGold(userId);

    // Create spinning animation effect
    const spinningEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎰 SALOON SLOT MACHINE 🎰')
      .setDescription('```\n🎲 ? | ? | ? 🎲\n```\n\n**SPINNING...**')
      .setFooter({ text: 'Good luck, cowboy!' });

    await interaction.reply({ embeds: [spinningEmbed] });

    // Wait 1.5 seconds for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show result
    const embed = new EmbedBuilder()
      .setColor(resultColor)
      .setTitle('🎰 SALOON SLOT MACHINE 🎰')
      .setDescription(`\`\`\`\n🎲 ${slot1} | ${slot2} | ${slot3} 🎲\n\`\`\`\n\n${result}${finalMessage}`)
      .addFields(
        { name: '💰 Bet Amount', value: `${bet} 🎫`, inline: true },
        { name: '🎯 Multiplier', value: `x${multiplier}`, inline: true },
        { name: won ? '✅ Won' : '❌ Lost', value: won ? `${winAmount} 🎫` : `${bet} 🎫`, inline: true },
        { name: '💼 New Balance', value: `**${newGold.toLocaleString()} 🎫** Saloon Tokens`, inline: false }
      )
      .setFooter({ text: won ? '🤠 The house always wins... except today!' : '🎰 Try again, fortune favors the brave!' })
      .setTimestamp();

    cooldowns.set(userId, now);
    setTimeout(() => cooldowns.delete(userId), cooldownAmount);

    await interaction.editReply({ embeds: [embed] });
  },
};
