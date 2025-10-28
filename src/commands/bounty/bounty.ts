import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, AttachmentBuilder } from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency, infoEmbed } from '../../utils/embeds';
import { generateWantedPoster } from '../../utils/wantedPoster';
import { getDartEmoji, getMoneybagEmoji, getScrollEmoji, getCowboysEmoji, getStarEmoji } from '../../utils/customEmojis';
const { addBounty, getBountyByTarget, removeBounty, getAllBounties } = require('../../utils/dataManager');
const { addItem, getItem, removeItem } = require('../../utils/inventoryManager');

const MIN_BOUNTY = 1000;
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
      .setName('bounty')
      .setDescription('Bounty hunting system')
      
      // LIST SUBCOMMAND (formerly /bounties)
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setDescription('View all active bounties')
      )
      
      // WANTED SUBCOMMAND (formerly /wanted)
      .addSubcommand(subcommand =>
        subcommand
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
          )
      )
      
      // CAPTURE SUBCOMMAND (formerly /capture)
      .addSubcommand(subcommand =>
        subcommand
          .setName('capture')
          .setDescription('Capture a wanted criminal and earn the bounty')
          .addUserOption(option =>
            option
              .setName('outlaw')
              .setDescription('The wanted outlaw to capture')
              .setRequired(true)
          )
      )
      
      // CLEAR SUBCOMMAND (formerly /clearbounty)
      .addSubcommand(subcommand =>
        subcommand
          .setName('clear')
          .setDescription('Remove a bounty (Admin only)')
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('User to clear bounty from')
              .setRequired(true)
          )
      ),
    'bounties'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'list':
        await executeList(interaction);
        break;
      case 'wanted':
        await executeWanted(interaction);
        break;
      case 'capture':
        await executeCapture(interaction);
        break;
      case 'clear':
        await executeClear(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    }
  }
};

// ============== LIST ==============
async function executeList(interaction: ChatInputCommandInteraction): Promise<void> {
  const bounties: Bounty[] = getAllBounties();

  if (bounties.length === 0) {
    const embed = warningEmbed(
      'No Active Bounties',
      'The Wild West is peaceful today!\n\nNo outlaws are currently wanted.',
      'Use /bounty wanted to place a bounty'
    );
    
    await interaction.reply({ embeds: [embed] });
    return;
  }

  const sortedBounties = bounties.sort((a, b) => b.totalAmount - a.totalAmount);
  let description = '**Most Wanted Outlaws:**\n\n';
  const moneyEmoji = getMoneybagEmoji();
  const groupEmoji = getCowboysEmoji();
  
  for (const bounty of sortedBounties.slice(0, 10)) {
    const starEmoji = getStarEmoji();
    const stars = starEmoji.repeat(Math.min(Math.floor(bounty.totalAmount / 5000), 5)) || '🔸';
    
    description += `${stars} **${bounty.targetTag}**\n`;
    description += `   ${moneyEmoji} Reward: ${formatCurrency(bounty.totalAmount, 'silver')}\n`;
    description += `   ${groupEmoji} Contributors: ${bounty.contributors.length}\n\n`;
  }

  if (bounties.length > 10) {
    description += `*...and ${bounties.length - 10} more outlaws*`;
  }

  const embed = infoEmbed(
    `${getScrollEmoji()} Active Bounties`,
    description
  )
    .addFields(
      { name: `${getDartEmoji()} Total Bounties`, value: bounties.length.toString(), inline: true },
      { name: `${getMoneybagEmoji()} Total Rewards`, value: formatCurrency(
        bounties.reduce((sum, b) => sum + b.totalAmount, 0),
        'silver'
      ), inline: true }
    )
    .setFooter({ text: 'Hunt outlaws and claim rewards with /bounty capture!' });

  await interaction.reply({ embeds: [embed] });
}

// ============== WANTED ==============
async function executeWanted(interaction: ChatInputCommandInteraction): Promise<void> {
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

// ============== CAPTURE ==============
async function executeCapture(interaction: ChatInputCommandInteraction): Promise<void> {
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

  const bounty = getBountyByTarget(target.id);
  if (!bounty) {
    const embed = errorEmbed(
      'No Bounty Found',
      `**${target.tag}** doesn't have an active bounty!\n\nThey're not wanted right now.`,
      'Use /bounty list to see active bounties'
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

// ============== CLEAR ==============
async function executeClear(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.memberPermissions?.has('Administrator')) {
    const embed = errorEmbed(
      'Permission Denied',
      'Only administrators can clear bounties!',
      'Contact a server admin'
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const target = interaction.options.getUser('user', true);
  const bounty = getBountyByTarget(target.id);
  
  if (!bounty) {
    const embed = warningEmbed(
      'No Bounty Found',
      `**${target.tag}** doesn't have an active bounty.`,
      'Nothing to clear'
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  removeBounty(target.id);

  const embed = successEmbed(
    '🚫 Bounty Cleared',
    `Bounty on **${target.tag}** has been cleared by an administrator.`,
    'The outlaw is no longer wanted'
  )
    .addFields(
      { name: '🎯 Target', value: target.tag, inline: true },
      { name: '💰 Amount Cleared', value: formatCurrency(bounty.totalAmount, 'silver'), inline: true },
      { name: '⚙️ Cleared By', value: interaction.user.tag, inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
