import { SlashCommandBuilder, AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
import { generateWantedPoster } from '../../utils/wantedPoster';
const { addBounty, getBountyByTarget } = require('../../utils/dataManager');
const { getItem, removeItem } = require('../../utils/inventoryManager');

const MIN_BOUNTY = 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('🎯 Place a bounty on someone\'s head!')
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
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const reason = interaction.options.getString('reason') || 'General mischief and mayhem';

    // Validation: No bots
    if (target.bot) {
      const embed = errorEmbed(
        'Invalid Target',
        'You can\'t place a bounty on a bot, partner!',
        'Choose a real outlaw'
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Validation: No self-bounties
    if (target.id === interaction.user.id) {
      const embed = warningEmbed(
        'Self-Bounty Not Allowed',
        'You can\'t place a bounty on yourself!',
        'That would be mighty strange, partner'
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if target already has a bounty
    const existingBounty = getBountyByTarget(target.id);
    if (existingBounty) {
      const embed = warningEmbed(
        'Bounty Already Active',
        `**${target.tag}** already has an active bounty!\n\n**Current Bounty:** ${formatCurrency(existingBounty.amount, 'silver')}`,
        'Wait until it\'s cleared before placing a new one'
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check user balance
    const userBalance = getItem(interaction.user.id, 'silver');
    if (userBalance < amount) {
      const embed = errorEmbed(
        'Insufficient Funds',
        `You don't have enough Silver Coins!\n\n**Your Balance:** ${formatCurrency(userBalance, 'silver')}\n**Required:** ${formatCurrency(amount, 'silver')}\n**Missing:** ${formatCurrency(amount - userBalance, 'silver')}`,
        'Earn more coins with /work or /daily'
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply();

    // Remove silver from user
    const removeResult = removeItem(interaction.user.id, 'silver', amount);
    if (!removeResult.success) {
      const embed = errorEmbed(
        'Transaction Failed',
        `Error removing coins: ${removeResult.error}`,
        'Please try again'
      );
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Add bounty to database
    addBounty(target.id, target.tag, interaction.user.id, interaction.user.tag, amount);

    // Generate wanted poster
    const poster = await generateWantedPoster(target, amount);
    const attachment = new AttachmentBuilder(poster, { name: 'wanted-poster.png' });

    // Success message
    const embed = successEmbed(
      '🎯 Bounty Placed!',
      `**${target.tag}** is now WANTED - Dead or Alive!`
    )
      .addFields(
        { name: '💰 Reward', value: formatCurrency(amount, 'silver'), inline: true },
        { name: '🔎 Crime', value: reason, inline: true },
        { name: '📜 Posted By', value: interaction.user.tag, inline: true }
      )
      .setImage('attachment://wanted-poster.png')
      .setFooter({ text: 'Good luck catching this outlaw, partner!' });

    await interaction.editReply({
      embeds: [embed],
      files: [attachment]
    });
  },
};
