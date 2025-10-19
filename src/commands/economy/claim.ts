import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { addUserXP } = require('../../utils/xpManager');
const { addItem } = require('../../utils/inventoryManager');
const { showProgressBar } = require('../../utils/progressBar');
const { readData, writeData } = require('../../utils/database');

const claimCooldown = 6 * 60 * 60 * 1000;

interface ClaimData {
  [userId: string]: number;
}

function getClaimData(): ClaimData {
  return readData('claim.json');
}

function saveClaimData(data: ClaimData): void {
  writeData('claim.json', data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('🎁 Claim your 6-hour reward!'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const claimData = getClaimData();
    
    const now = Date.now();
    const lastClaim = claimData[userId] || 0;
    const timeSinceLastClaim = now - lastClaim;
    
    if (timeSinceLastClaim < claimCooldown) {
      const timeLeft = claimCooldown - timeSinceLastClaim;
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      await interaction.reply({
        embeds: [{
          color: 0xFF6B6B,
          title: '⏰ CLAIM COOLDOWN',
          description: `You need to wait before claiming again!\n\n**Time remaining:** ${hoursLeft}h ${minutesLeft}m`,
          footer: { text: 'Come back later, partner!' }
        }],
        ephemeral: true
      });
    }

    await interaction.deferReply();
    await showProgressBar(interaction, '🎁 CLAIMING REWARD', 'Collecting your reward...', 2000, '#FFD700');

    const silverAmount = Math.floor(Math.random() * 300) + 200;
    const tokenAmount = Math.floor(Math.random() * 3) + 1;
    const xpAmount = Math.floor(Math.random() * 50) + 25;

    const silverResult = addItem(userId, 'silver', silverAmount);
    const tokenResult = addItem(userId, 'saloon_token', tokenAmount);

    if (!silverResult.success || !tokenResult.success) {
      const error = !silverResult.success ? silverResult.error : tokenResult.error;
      await interaction.editReply({
        embeds: [{
          color: 0xFF0000,
          title: '❌ CLAIM FAILED',
          description: `${error}\n\nYour inventory is too full to claim this reward!`,
          footer: { text: 'Free up space and try again!' }
        }]
      });
    }

    addUserXP(userId, xpAmount);
    
    claimData[userId] = now;
    saveClaimData(claimData);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎁 CLAIM SUCCESSFUL!')
      .setDescription('```diff\n+ Reward claimed successfully!\n```')
      .addFields(
        { name: '🪙 Silver Coins', value: `**+${silverAmount.toLocaleString()}**`, inline: true },
        { name: '🎫 Saloon Tokens', value: `**+${tokenAmount}**`, inline: true },
        { name: '⭐ XP Gained', value: `**+${xpAmount}**`, inline: true }
      )
      .setFooter({ text: 'Next claim available in 6 hours!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
