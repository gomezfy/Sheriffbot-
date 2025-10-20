import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
const { addBounty, getBountyByTarget, getUserSilver, removeUserSilver } = require('../../utils/dataManager');
const { createWantedPoster } = require('../../utils/wantedPoster');

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
    const reason = interaction.options.getString('reason') || 'General mischief';

    if (target.bot) {
      await interaction.reply({
        content: '❌ You can\'t place a bounty on a bot!',
        ephemeral: true
      });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({
        content: '❌ You can\'t place a bounty on yourself, partner!',
        ephemeral: true
      });
      return;
    }

    const existingBounty = getBountyByTarget(target.id);
    if (existingBounty) {
      await interaction.reply({
        content: `❌ ${target.tag} already has an active bounty of **${existingBounty.amount.toLocaleString()} 🪙**!\n\nWait until it's cleared before placing a new one.`,
        ephemeral: true
      });
      return;
    }

    const userBalance = getUserSilver(interaction.user.id);
    if (userBalance < amount) {
      await interaction.reply({
        content: `❌ You don't have enough Silver Coins!\n\nYou have **${userBalance.toLocaleString()} 🪙** but need **${amount.toLocaleString()} 🪙**.`,
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    const removeResult = removeUserSilver(interaction.user.id, amount);
    if (!removeResult.success) {
      await interaction.editReply({
        content: `❌ Error removing coins: ${removeResult.error}`
      });
      return;
    }

    addBounty(target.id, target.tag, interaction.user.id, interaction.user.tag, amount);

    const poster = await createWantedPoster(target, amount, reason, interaction.user.tag);
    const attachment = new AttachmentBuilder(poster, { name: 'wanted-poster.png' });

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('🎯 BOUNTY PLACED!')
      .setDescription(`**${target.tag}** is now WANTED!\n\nDead or Alive!`)
      .addFields(
        { name: '💰 Bounty Reward', value: `**${amount.toLocaleString()} 🪙** Silver Coins`, inline: true },
        { name: '🔎 Wanted For', value: reason, inline: true },
        { name: '📜 Posted By', value: `${interaction.user.tag}`, inline: true }
      )
      .setImage('attachment://wanted-poster.png')
      .setFooter({ text: 'Good luck catching this outlaw, partner!' })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [attachment]
    });
  },
};
