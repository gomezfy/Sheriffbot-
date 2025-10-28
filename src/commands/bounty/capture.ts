import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
const { getBountyByTarget, removeBounty } = require('../../utils/dataManager');
const { addItem } = require('../../utils/inventoryManager');

const CAPTURE_COOLDOWN = 30 * 60 * 1000;
const captureData: { [userId: string]: number } = {};

interface Bounty {
  targetId: string;
  targetTag: string;
  totalAmount: number;
  contributors: Array<{
    id: string;
    tag: string;
    amount: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

module.exports = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('capture')
      .setDescription('Capture a wanted criminal and earn the bounty')
      .addUserOption(option =>
        option
          .setName('outlaw')
          .setDescription('The wanted outlaw to capture')
          .setRequired(true)
      ),
    'capture'
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
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    if (target.id === hunter.id) {
      const embed = warningEmbed(
        'Can\'t Capture Yourself',
        'You can\'t capture yourself, that doesn\'t make sense!',
        'Choose another outlaw'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    // Verificar se o alvo está no servidor
    if (!interaction.guild) {
      const embed = errorEmbed(
        'Server Only',
        'This command can only be used in a server!',
        'Try using this command in a server'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      await interaction.guild.members.fetch(target.id);
    } catch (error) {
      const embed = errorEmbed(
        'Outlaw Not in Server',
        `**${target.tag}** is not in this server!\n\nYou can only capture outlaws who are currently in the server.`,
        'The outlaw must be present to be captured'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const bounty: Bounty = getBountyByTarget(target.id);
    if (!bounty) {
      const embed = errorEmbed(
        'No Bounty Found',
        `**${target.tag}** doesn't have an active bounty!\n\nThey're not wanted right now.`,
        'Use /bounties to see active bounties'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    removeBounty(target.id);
    captureData[hunter.id] = now;

    const embed = successEmbed(
      '🎯 Outlaw Captured!',
      `**${hunter.tag}** successfully captured **${target.tag}**!\n\nThe reward has been collected!`,
      'Justice prevails in the Wild West!'
    )
      .addFields(
        { name: '👤 Hunter', value: hunter.tag, inline: true },
        { name: '🎯 Outlaw', value: target.tag, inline: true },
        { name: '💰 Reward', value: formatCurrency(reward, 'silver'), inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
