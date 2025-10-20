import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
const { getBountyByTarget, removeBounty } = require('../../utils/dataManager');
const { addItem, getItem } = require('../../utils/inventoryManager');

const CAPTURE_COOLDOWN = 30 * 60 * 1000;
const captureData: { [userId: string]: number } = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('capture')
    .setDescription('⚡ Capture a wanted outlaw and claim the bounty!')
    .addUserOption(option =>
      option
        .setName('outlaw')
        .setDescription('The wanted outlaw to capture')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const hunter = interaction.user;
    const target = interaction.options.getUser('outlaw', true);

    if (target.bot) {
      const embed = errorEmbed(
        'Invalid Target',
        'You can\'t capture a bot, partner!',
        'Target must be a real outlaw'
      );
      
      await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
      return;
    }

    if (target.id === hunter.id) {
      const embed = warningEmbed(
        'Can\'t Capture Yourself',
        'You can\'t capture yourself, that doesn\'t make sense!',
        'Choose another outlaw'
      );
      
      await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
      return;
    }

    const now = Date.now();
    const lastCapture = captureData[hunter.id] || 0;
    if (now - lastCapture < CAPTURE_COOLDOWN) {
      const timeLeft = CAPTURE_COOLDOWN - (now - lastCapture);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      
      const embed = warningEmbed(
        'Capture Cooldown',
        `You need to rest before attempting another capture!\n\n**Time remaining:** ${minutesLeft} minutes`,
        'Bounty hunting is exhausting work'
      );
      
      await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
      return;
    }

    const bounty = getBountyByTarget(target.id);
    
    if (!bounty) {
      const embed = errorEmbed(
        'No Bounty Found',
        `**${target.tag}** doesn't have an active bounty!\n\nThey're not wanted right now.`,
        'Use /bounties to see active bounties'
      );
      
      await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
      return;
    }

    const captureChance = Math.random();
    const baseSuccessRate = 0.50;
    
    if (captureChance > baseSuccessRate) {
      captureData[hunter.id] = now;
      
      const embed = warningEmbed(
        '💨 Outlaw Escaped!',
        `**${target.tag}** managed to escape!\n\nThe outlaw slipped through your fingers and fled into the desert.`,
        'Better luck next time, partner!'
      )
        .addFields(
          { name: '🎯 Target', value: target.tag, inline: true },
          { name: '💰 Lost Reward', value: formatCurrency(bounty.totalAmount, 'silver'), inline: true },
          { name: '📊 Success Rate', value: `${(baseSuccessRate * 100).toFixed(0)}%`, inline: true }
        );
      
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const reward = bounty.totalAmount;
    const result = addItem(hunter.id, 'silver', reward);

    if (!result.success) {
      const embed = errorEmbed(
        'Capture Failed',
        `Your inventory is too full to carry the reward!\n\n**Error:** ${result.error}`,
        'Free up space and try again'
      );
      
      await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
      return;
    }

    captureData[hunter.id] = now;
    removeBounty(target.id);

    const embed = successEmbed(
      '⚡ OUTLAW CAPTURED!',
      `**${hunter.tag}** successfully captured **${target.tag}**!\n\nThe outlaw has been brought to justice and the bounty is yours!`
    )
      .addFields(
        { name: '🎯 Captured', value: target.tag, inline: true },
        { name: '💰 Reward Claimed', value: formatCurrency(reward, 'silver'), inline: true },
        { name: '👥 Contributors', value: bounty.contributors.length.toString(), inline: true }
      )
      .setFooter({ text: `Next capture available in 30 minutes` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const newBalance = getItem(hunter.id, 'silver');
    console.log(`[BOUNTY] ${hunter.tag} captured ${target.tag} for ${reward} silver (new balance: ${newBalance})`);
  },
};
