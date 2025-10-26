import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChatInputCommandInteraction,
  MessageFlags,
  ComponentType
} from 'discord.js';
import { addItem, removeItem, getInventory } from '../../utils/inventoryManager';
import { 
  getRevolverEmoji, 
  getDartEmoji, 
  getTrophyEmoji,
  getSilverCoinEmoji,
  getTimerEmoji,
  getCancelEmoji,
  getCheckEmoji,
  getLightningEmoji
} from '../../utils/customEmojis';
import { isValidBetAmount, commandRateLimiter } from '../../utils/security';

const activeDuels = new Map();
const cooldowns = new Map();

// Duel mechanics: Rock-Paper-Scissors style with HP system
const ACTIONS = {
  quick_shot: {
    name: 'Quick Shot',
    emoji: '⚡',
    beats: 'aim',
    losesTo: 'dodge',
    damage: 2,
    description: 'Fast but less accurate'
  },
  aim: {
    name: 'Aimed Shot',
    emoji: '🎯',
    beats: 'dodge',
    losesTo: 'quick_shot',
    damage: 3,
    description: 'Slow but powerful'
  },
  dodge: {
    name: 'Dodge Roll',
    emoji: '🤸',
    beats: 'quick_shot',
    losesTo: 'aim',
    damage: 1,
    description: 'Avoid damage, counter lightly'
  }
};

const MAX_BET = 100000; // Maximum bet of 100k Silver
const MIN_BET = 50;
const COOLDOWN_TIME = 60000; // 60 seconds

function createHealthBar(hp: number, maxHp: number = 5): string {
  const hearts = '❤️'.repeat(hp);
  const empty = '🖤'.repeat(maxHp - hp);
  return `${hearts}${empty} ${hp}/${maxHp}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duel')
    .setDescription('🔫 Challenge another player to a Western duel!')
    .addUserOption(option =>
      option
        .setName('opponent')
        .setDescription('The outlaw you want to duel')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription(`Amount of Silver Coins to bet (${MIN_BET}-${MAX_BET.toLocaleString()})`)
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('opponent');
    const bet = interaction.options.getInteger('bet');

    if (!opponent || !bet) {
      await interaction.reply({
        content: `${getCancelEmoji()} Please specify both opponent and bet!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Validation checks
    if (opponent.bot) {
      await interaction.reply({
        content: `${getCancelEmoji()} Bots don't duel, partner!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (opponent.id === challenger.id) {
      await interaction.reply({
        content: `${getCancelEmoji()} You can't duel yourself!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Security: Validate bet amount
    if (!isValidBetAmount(bet)) {
      await interaction.reply({
        content: `${getCancelEmoji()} Invalid bet amount! Must be between ${MIN_BET} and ${MAX_BET.toLocaleString()}.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Security: Rate limiting
    if (!commandRateLimiter.canExecute('duel', challenger.id, COOLDOWN_TIME)) {
      const remaining = commandRateLimiter.getRemainingCooldown('duel', challenger.id, COOLDOWN_TIME);
      await interaction.reply({
        content: `${getTimerEmoji()} You just finished a duel! Wait ${Math.ceil(remaining / 1000)} more seconds before challenging again.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (cooldowns.has(challenger.id)) {
      const expirationTime = cooldowns.get(challenger.id) + COOLDOWN_TIME;
      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000);
        await interaction.reply({
          content: `${getTimerEmoji()} You just finished a duel! Wait ${timeLeft} more seconds before challenging again.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    // Check if challenger has enough money
    const challengerInventory = getInventory(challenger.id);
    const challengerBalance = challengerInventory.items['silver'] || 0;
    
    if (challengerBalance < bet) {
      await interaction.reply({
        content: `${getCancelEmoji()} You don't have enough Silver Coins! You have ${getSilverCoinEmoji()} ${challengerBalance.toLocaleString()} but need ${getSilverCoinEmoji()} ${bet.toLocaleString()}.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if opponent has enough money
    const opponentInventory = getInventory(opponent.id);
    const opponentBalance = opponentInventory.items['silver'] || 0;
    
    if (opponentBalance < bet) {
      await interaction.reply({
        content: `${getCancelEmoji()} ${opponent.username} doesn't have enough Silver Coins to accept this bet!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if either player is already in a duel
    if (activeDuels.has(challenger.id) || activeDuels.has(opponent.id)) {
      await interaction.reply({
        content: `${getCancelEmoji()} One of you is already in a duel!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Create accept/decline buttons
    const acceptButton = new ButtonBuilder()
      .setCustomId(`duel_accept_${challenger.id}`)
      .setLabel('⚔️ Accept Duel')
      .setStyle(ButtonStyle.Danger);

    const declineButton = new ButtonBuilder()
      .setCustomId(`duel_decline_${challenger.id}`)
      .setLabel('❌ Decline')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton);

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle(`${getRevolverEmoji()} DUEL CHALLENGE!`)
      .setDescription(`**${challenger.username}** challenges **${opponent.username}** to a Western duel!\n\n💰 **Wager:** ${getSilverCoinEmoji()} ${bet.toLocaleString()} Silver Coins\n${getTimerEmoji()} **30 seconds** to accept or decline!`)
      .addFields(
        { name: `${getDartEmoji()} How to Play`, value: 'Best of 3 rounds! Each player has 5 HP. Choose your action wisely!', inline: false },
        { name: '⚡ Quick Shot (2 dmg)', value: 'Beats 🎯 Aimed Shot', inline: true },
        { name: '🎯 Aimed Shot (3 dmg)', value: 'Beats 🤸 Dodge', inline: true },
        { name: '🤸 Dodge Roll (1 dmg)', value: 'Beats ⚡ Quick Shot', inline: true }
      )
      .setFooter({ text: `${opponent.username}, click Accept to duel!` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      filter: i => i.user.id === opponent.id && i.customId.startsWith('duel_'),
      time: 30000,
      max: 1
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === `duel_decline_${challenger.id}`) {
        const declineEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('❌ Duel Declined')
          .setDescription(`**${opponent.username}** declined the duel challenge.`)
          .setFooter({ text: 'Maybe next time, partner!' });

        await i.update({ embeds: [declineEmbed], components: [] });
        return;
      }

      // Duel accepted! Re-check balances before deducting (prevent race condition)
      const challengerCurrentInventory = getInventory(challenger.id);
      const opponentCurrentInventory = getInventory(opponent.id);
      
      const challengerCurrentBalance = challengerCurrentInventory.items['silver'] || 0;
      const opponentCurrentBalance = opponentCurrentInventory.items['silver'] || 0;

      if (challengerCurrentBalance < bet) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`${getCancelEmoji()} Insufficient Funds`)
          .setDescription(`**${challenger.username}** no longer has enough Silver Coins! Duel cancelled.`)
          .setFooter({ text: 'Balance changed during challenge' });

        await i.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      if (opponentCurrentBalance < bet) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`${getCancelEmoji()} Insufficient Funds`)
          .setDescription(`**${opponent.username}** no longer has enough Silver Coins! Duel cancelled.`)
          .setFooter({ text: 'Balance changed during challenge' });

        await i.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      // Deduct bets BEFORE marking duel as active
      const challengerRemove = removeItem(challenger.id, 'silver', bet);
      const opponentRemove = removeItem(opponent.id, 'silver', bet);

      if (!challengerRemove.success || !opponentRemove.success) {
        // Rollback if one succeeded but the other failed
        if (challengerRemove.success) {
          addItem(challenger.id, 'silver', bet);
        }
        if (opponentRemove.success) {
          addItem(opponent.id, 'silver', bet);
        }

        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`${getCancelEmoji()} Transaction Failed`)
          .setDescription('Failed to process bets. Duel cancelled.')
          .setFooter({ text: 'Your silver has been refunded' });

        await i.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      // Only mark as active after successful transaction
      activeDuels.set(challenger.id, true);
      activeDuels.set(opponent.id, true);

      // Initialize duel state
      const duelState = {
        challenger: { user: challenger, hp: 5, choice: null },
        opponent: { user: opponent, hp: 5, choice: null },
        round: 1,
        maxRounds: 3,
        bet: bet,
        messageId: message.id
      };

      await startDuelRound(i, duelState);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle(`${getTimerEmoji()} Duel Timeout`)
          .setDescription(`**${opponent.username}** didn't respond in time. Duel cancelled.`)
          .setFooter({ text: 'Challenge them again when they\'re ready!' });

        message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};

async function startDuelRound(interaction: any, state: any) {
  state.challenger.choice = null;
  state.opponent.choice = null;

  const actionButtons = [
    new ButtonBuilder()
      .setCustomId('duel_quick_shot')
      .setLabel('⚡ Quick Shot')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('duel_aim')
      .setLabel('🎯 Aimed Shot')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('duel_dodge')
      .setLabel('🤸 Dodge Roll')
      .setStyle(ButtonStyle.Secondary)
  ];

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(actionButtons);

  const roundEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle(`${getRevolverEmoji()} DUEL - Round ${state.round}/${state.maxRounds}`)
    .setDescription(`**Both players:** Choose your action!\n\n⚡ Quick Shot (2 dmg) beats 🎯 Aim\n🎯 Aim (3 dmg) beats 🤸 Dodge\n🤸 Dodge (1 dmg) beats ⚡ Quick Shot`)
    .addFields(
      { 
        name: `${state.challenger.user.username}`, 
        value: createHealthBar(state.challenger.hp), 
        inline: true 
      },
      { name: 'VS', value: '⚔️', inline: true },
      { 
        name: `${state.opponent.user.username}`, 
        value: createHealthBar(state.opponent.hp), 
        inline: true 
      }
    )
    .setFooter({ text: '⏰ You have 15 seconds to choose!' })
    .setTimestamp();

  await interaction.update({ embeds: [roundEmbed], components: [row] });

  const collector = interaction.message.createMessageComponentCollector({
    filter: (i: any) => [state.challenger.user.id, state.opponent.user.id].includes(i.user.id),
    time: 15000,
    componentType: ComponentType.Button
  });

  collector.on('collect', async (i: any) => {
    const action = i.customId.replace('duel_', '');
    
    if (i.user.id === state.challenger.user.id) {
      state.challenger.choice = action;
      await i.reply({ 
        content: `${getCheckEmoji()} You chose ${(ACTIONS as any)[action].emoji} ${(ACTIONS as any)[action].name}!`, 
        flags: MessageFlags.Ephemeral 
      });
    } else if (i.user.id === state.opponent.user.id) {
      state.opponent.choice = action;
      await i.reply({ 
        content: `${getCheckEmoji()} You chose ${(ACTIONS as any)[action].emoji} ${(ACTIONS as any)[action].name}!`, 
        flags: MessageFlags.Ephemeral 
      });
    }

    // Both players chose
    if (state.challenger.choice && state.opponent.choice) {
      collector.stop('both_chose');
    }
  });

  collector.on('end', async (collected: any, reason: any) => {
    // Random choice for players who didn't choose
    if (!state.challenger.choice) {
      const actions = Object.keys(ACTIONS);
      state.challenger.choice = actions[Math.floor(Math.random() * actions.length)];
    }
    if (!state.opponent.choice) {
      const actions = Object.keys(ACTIONS);
      state.opponent.choice = actions[Math.floor(Math.random() * actions.length)];
    }

    await resolveRound(interaction.message, state);
  });
}

async function resolveRound(message: any, state: any) {
  const cAction = (ACTIONS as any)[state.challenger.choice];
  const oAction = (ACTIONS as any)[state.opponent.choice];

  let result = '';
  let cDamage = 0;
  let oDamage = 0;
  let embedColor = '#FFA500';

  if (cAction.beats === state.opponent.choice) {
    // Challenger wins round
    oDamage = cAction.damage;
    state.opponent.hp = Math.max(0, state.opponent.hp - oDamage);
    result = `${getLightningEmoji()} **${state.challenger.user.username}'s** ${cAction.emoji} ${cAction.name} beats **${state.opponent.user.username}'s** ${oAction.emoji} ${oAction.name}!\n\n💥 **${state.opponent.user.username}** takes **${oDamage} damage**!`;
    embedColor = '#00FF00';
  } else if (oAction.beats === state.challenger.choice) {
    // Opponent wins round
    cDamage = oAction.damage;
    state.challenger.hp = Math.max(0, state.challenger.hp - cDamage);
    result = `${getLightningEmoji()} **${state.opponent.user.username}'s** ${oAction.emoji} ${oAction.name} beats **${state.challenger.user.username}'s** ${cAction.emoji} ${cAction.name}!\n\n💥 **${state.challenger.user.username}** takes **${cDamage} damage**!`;
    embedColor = '#FF4500';
  } else {
    // Draw - both take 1 damage
    cDamage = 1;
    oDamage = 1;
    state.challenger.hp = Math.max(0, state.challenger.hp - 1);
    state.opponent.hp = Math.max(0, state.opponent.hp - 1);
    result = `🤝 Both chose ${cAction.emoji} ${cAction.name}! It's a **DRAW**!\n\n💥 Both players take **1 damage**!`;
    embedColor = '#FFD700';
  }

  const roundResultEmbed = new EmbedBuilder()
    .setColor(parseInt(embedColor.replace('#', ''), 16))
    .setTitle(`🎯 Round ${state.round} Result`)
    .setDescription(result)
    .addFields(
      { 
        name: `${state.challenger.user.username}`, 
        value: `${cAction.emoji} ${cAction.name}\n${createHealthBar(state.challenger.hp)}`, 
        inline: true 
      },
      { name: '⚔️', value: '\u200B', inline: true },
      { 
        name: `${state.opponent.user.username}`, 
        value: `${oAction.emoji} ${oAction.name}\n${createHealthBar(state.opponent.hp)}`, 
        inline: true 
      }
    )
    .setTimestamp();

  await message.edit({ embeds: [roundResultEmbed], components: [] });

  // Check for winner
  if (state.challenger.hp <= 0 || state.opponent.hp <= 0 || state.round >= state.maxRounds) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await endDuel(message, state);
  } else {
    state.round++;
    await new Promise(resolve => setTimeout(resolve, 4000));
    await startDuelRound({ update: async (data: any) => message.edit(data), message }, state);
  }
}

async function endDuel(message: any, state: any) {
  let winner, loser;

  if (state.challenger.hp > state.opponent.hp) {
    winner = state.challenger.user;
    loser = state.opponent.user;
  } else if (state.opponent.hp > state.challenger.hp) {
    winner = state.opponent.user;
    loser = state.challenger.user;
  } else {
    // Draw - refund both
    const refundChallengerResult = addItem(state.challenger.user.id, 'silver', state.bet);
    const refundOpponentResult = addItem(state.opponent.user.id, 'silver', state.bet);

    const drawEmbed = new EmbedBuilder()
      .setColor('#808080')
      .setTitle('🤝 Duel Draw!')
      .setDescription(`Both outlaws are equally matched! The duel ends in a draw.\n\n💰 Both players get their ${getSilverCoinEmoji()} ${state.bet.toLocaleString()} Silver Coins back.`)
      .setFooter({ text: 'Rematch anytime!' })
      .setTimestamp();

    activeDuels.delete(state.challenger.user.id);
    activeDuels.delete(state.opponent.user.id);
    cooldowns.set(state.challenger.user.id, Date.now());
    cooldowns.set(state.opponent.user.id, Date.now());

    return message.edit({ embeds: [drawEmbed], components: [] });
  }

  // Winner gets double the bet
  const winnings = state.bet * 2;
  const addResult = addItem(winner.id, 'silver', winnings);

  if (!addResult.success) {
    // Refund both if winner's inventory is full
    addItem(state.challenger.user.id, 'silver', state.bet);
    addItem(state.opponent.user.id, 'silver', state.bet);

    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`${getCancelEmoji()} Duel Error`)
      .setDescription(`${winner.username}'s inventory is too full! Both players refunded.`)
      .setTimestamp();

    activeDuels.delete(state.challenger.user.id);
    activeDuels.delete(state.opponent.user.id);

    return message.edit({ embeds: [errorEmbed], components: [] });
  }

  const winnerHp = winner.id === state.challenger.user.id ? state.challenger.hp : state.opponent.hp;
  const loserHp = loser.id === state.challenger.user.id ? state.challenger.hp : state.opponent.hp;

  const winEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`${getTrophyEmoji()} DUEL WINNER!`)
    .setDescription(`**${winner.username}** wins the duel!\n\n${loser.username} has been defeated in the streets of the Wild West!`)
    .addFields(
      { 
        name: '💰 Prize', 
        value: `${getSilverCoinEmoji()} **${winnings.toLocaleString()}** Silver Coins`, 
        inline: true 
      },
      { 
        name: '🎯 Final Score', 
        value: `${winner.username}: ${createHealthBar(winnerHp)}\n${loser.username}: ${createHealthBar(loserHp)}`, 
        inline: true 
      }
    )
    .setFooter({ text: 'The fastest gun in the West!' })
    .setTimestamp();

  await message.edit({ embeds: [winEmbed], components: [] });

  activeDuels.delete(state.challenger.user.id);
  activeDuels.delete(state.opponent.user.id);
  cooldowns.set(state.challenger.user.id, Date.now());
  cooldowns.set(state.opponent.user.id, Date.now());
}
