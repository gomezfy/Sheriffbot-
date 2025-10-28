import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, AttachmentBuilder } from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
import { generateWantedPoster } from '../../utils/wantedPoster';
import { getDartEmoji } from '../../utils/customEmojis';
const { addBounty, getBountyByTarget } = require('../../utils/dataManager');
const { getItem, removeItem } = require('../../utils/inventoryManager');

const MIN_BOUNTY = 1000;

module.exports = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('wanted')
      .setDescription('Place a bounty on a wanted user')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('The outlaw you want to place a bounty on')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName('amount')
          .setDescription('Bounty amount (minimum 1000 Silver Coins)')
          .setRequired(true)
          .setMinValue(MIN_BOUNTY)
      )
      .addStringOption(option =>
        option
          .setName('reason')
          .setDescription('Why are they wanted?')
          .setRequired(false)
      ),
    'wanted'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const reason = interaction.options.getString('reason') || 'General mischief and mayhem';

    if (target.bot) {
      const embed = errorEmbed(
        'Invalid Target',
        'You can\'t place a bounty on a bot, partner!',
        'Choose a real outlaw'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    if (target.id === interaction.user.id) {
      const embed = warningEmbed(
        'Self-Bounty Not Allowed',
        'You can\'t place a bounty on yourself!',
        'That would be mighty strange, partner'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const existingBounty = getBountyByTarget(target.id);
    if (existingBounty) {
      const embed = warningEmbed(
        'Bounty Already Active',
        `**${target.tag}** already has an active bounty!\n\n**Current Bounty:** ${formatCurrency(existingBounty.totalAmount, 'silver')}`,
        'Wait until it\'s cleared before placing a new one'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const currentSilver = getItem(interaction.user.id, 'silver') || 0;
    if (currentSilver < amount) {
      const embed = errorEmbed(
        'Insufficient Funds',
        `You don't have enough Silver Coins!\n\n**Required:** ${formatCurrency(amount, 'silver')}\n**You have:** ${formatCurrency(currentSilver, 'silver')}`,
        'Earn more silver first'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    const removeResult = removeItem(interaction.user.id, 'silver', amount);
    if (!removeResult.success) {
      const embed = errorEmbed(
        'Transaction Failed',
        `Could not deduct Silver Coins: ${removeResult.error}`,
        'Please try again'
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    addBounty(target.id, target.tag, interaction.user.id, interaction.user.tag, amount, reason);

    const poster = await generateWantedPoster(target, amount);
    const attachment = new AttachmentBuilder(poster, { name: `wanted-${target.id}.png` });

    const embed = successEmbed(
      `${getDartEmoji()} Bounty Placed!`,
      `**${target.tag}** is now WANTED!\n\n**Bounty:** ${formatCurrency(amount, 'silver')}\n**Reason:** ${reason}`,
      'Bounty hunters can now capture this outlaw!'
    )
      .setImage(`attachment://wanted-${target.id}.png`)
      .addFields(
        { name: '🎯 Target', value: target.tag, inline: true },
        { name: '💰 Reward', value: formatCurrency(amount, 'silver'), inline: true },
        { name: '👤 Posted By', value: interaction.user.tag, inline: true }
      );

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }
};
