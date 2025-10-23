import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
const { getUserSilver, addUserSilver, removeUserSilver } = require('../../utils/dataManager');
import path from 'path';

const activeDuels = new Map();
const cooldowns = new Map();

// Duel mechanics: Rock-Paper-Scissors style with HP system
const ACTIONS = {
  quick_shot: {
    name: '⚡ Quick Shot',
    emoji: '⚡',
    beats: 'aim',
    losesTo: 'dodge',
    damage: 2,
    description: 'Fast but less accurate'
  },
  aim: {
    name: '🎯 Aimed Shot',
    emoji: '🎯',
    beats: 'dodge',
    losesTo: 'quick_shot',
    damage: 3,
    description: 'Slow but powerful'
  },
  dodge: {
    name: '🤸 Dodge Roll',
    emoji: '🤸',
    beats: 'quick_shot',
    losesTo: 'aim',
    damage: 1,
    description: 'Avoid damage, counter lightly'
  }
};

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
        .setDescription('Amount of Silver Coins to bet')
        .setRequired(true)
        .setMinValue(50)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('opponent');
    const bet = interaction.options.getInteger('bet');

    if (!opponent || !bet) {
      await interaction.reply({
        content: '❌ Please specify both opponent and bet!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Validation checks
    if (opponent.bot) {
      await interaction.reply({
        content: '❌ Bots don\'t duel, partner!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (opponent.id === challenger.id) {
      await interaction.reply({
        content: '❌ You can\'t duel yourself!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check cooldown
    const now = Date.now();
    const cooldownAmount = 30000; // 30 seconds

    if (cooldowns.has(challenger.id)) {
      const expirationTime = cooldowns.get(challenger.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000);
        await interaction.reply({
          content: `⏰ You just finished a duel! Wait ${timeLeft} more seconds before challenging again.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    // Check if challenger has enough money
    const challengerBalance = getUserSilver(challenger.id);
    if (challengerBalance < bet) {
      await interaction.reply({
        content: `❌ You don't have enough Silver Coins! You have 🪙 ${challengerBalance.toLocaleString()} but need 🪙 ${bet.toLocaleString()}.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if opponent has enough money
    const opponentBalance = getUserSilver(opponent.id);
    if (opponentBalance < bet) {
      await interaction.reply({
        content: `❌ ${opponent.username} doesn't have enough Silver Coins to accept this bet!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if either player is already in a duel
    if (activeDuels.has(challenger.id) || activeDuels.has(opponent.id)) {
      await interaction.reply({
        content: '❌ One of you is already in a duel!',
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
      .setTitle('🔫 DUEL CHALLENGE!')
      .setDescription(`**${challenger.username}** challenges **${opponent.username}** to a Western duel!\n\n💰 **Wager:** 🪙 ${bet.toLocaleString()} Silver Coins\n⏰ **30 seconds** to accept or decline!`)
      .addFields(
        { name: '🎮 How to Play', value: 'Best of 3 rounds! Each player has 5 HP. Choose your action wisely!', inline: false },
        { name: '⚡ Quick Shot', value: 'Beats 🎯 Aimed Shot (2 damage)', inline: true },
        { name: '🎯 Aimed Shot', value: 'Beats 🤸 Dodge (3 damage)', inline: true },
        { name: '🤸 Dodge Roll', value: 'Beats ⚡ Quick Shot (1 damage)', inline: true }
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
      const challengerCurrentBalance = getUserSilver(challenger.id);
      const opponentCurrentBalance = getUserSilver(opponent.id);

      if (challengerCurrentBalance < bet) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Insufficient Funds')
          .setDescription(`**${challenger.username}** no longer has enough Silver Coins! Duel cancelled.`)
          .setFooter({ text: 'Balance changed during challenge' });

        await i.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      if (opponentCurrentBalance < bet) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Insufficient Funds')
          .setDescription(`**${opponent.username}** no longer has enough Silver Coins! Duel cancelled.`)
          .setFooter({ text: 'Balance changed during challenge' });

        await i.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      // Deduct bets BEFORE marking duel as active
      const challengerRemove = removeUserSilver(challenger.id, bet);
      const opponentRemove = removeUserSilver(opponent.id, bet);

      if (!challengerRemove.success || !opponentRemove.success) {
        // Rollback if one succeeded but the other failed
        if (challengerRemove.success) {
          addUserSilver(challenger.id, bet);
        }
        if (opponentRemove.success) {
          addUserSilver(opponent.id, bet);
        }

        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Transaction Failed')
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
          .setTitle('⏰ Duel Timeout')
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
    .setTitle(`🔫 DUEL - Round ${state.round}/${state.maxRounds}`)
    .setDescription('**Both players:** Choose your action!\n\n⚡ Quick Shot beats 🎯 Aim\n🎯 Aim beats 🤸 Dodge\n🤸 Dodge beats ⚡ Quick Shot')
    .addFields(
      { name: `${state.challenger.user.username}`, value: `❤️ ${state.challenger.hp}/5 HP`, inline: true },
      { name: 'VS', value: '⚔️', inline: true },
      { name: `${state.opponent.user.username}`, value: `❤️ ${state.opponent.hp}/5 HP`, inline: true }
    )
    .setFooter({ text: 'You have 15 seconds to choose!' })
    .setTimestamp();

  await interaction.update({ embeds: [roundEmbed], components: [row] });

  const collector = interaction.message.createMessageComponentCollector({
    filter: (i: any) => [state.challenger.user.id, state.opponent.user.id].includes(i.user.id),
    time: 15000
  });

  collector.on('collect', async (i: any) => {
    const action = i.customId.replace('duel_', '');
    
    if (i.user.id === state.challenger.user.id) {
      state.challenger.choice = action;
      await i.reply({ content: `You chose ${(ACTIONS as any)[action].emoji} ${(ACTIONS as any)[action].name}!`, flags: MessageFlags.Ephemeral });
    } else if (i.user.id === state.opponent.user.id) {
      state.opponent.choice = action;
      await i.reply({ content: `You chose ${(ACTIONS as any)[action].emoji} ${(ACTIONS as any)[action].name}!`, flags: MessageFlags.Ephemeral });
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

  if (cAction.beats === state.opponent.choice) {
    // Challenger wins round
    oDamage = cAction.damage;
    state.opponent.hp = Math.max(0, state.opponent.hp - oDamage);
    result = `${state.challenger.user.username}'s ${cAction.emoji} beats ${state.opponent.user.username}'s ${oAction.emoji}!\n**${state.opponent.user.username}** takes ${oDamage} damage!`;
  } else if (oAction.beats === state.challenger.choice) {
    // Opponent wins round
    cDamage = oAction.damage;
    state.challenger.hp = Math.max(0, state.challenger.hp - cDamage);
    result = `${state.opponent.user.username}'s ${oAction.emoji} beats ${state.challenger.user.username}'s ${cAction.emoji}!\n**${state.challenger.user.username}** takes ${cDamage} damage!`;
  } else {
    // Draw - both take 1 damage
    cDamage = 1;
    oDamage = 1;
    state.challenger.hp = Math.max(0, state.challenger.hp - 1);
    state.opponent.hp = Math.max(0, state.opponent.hp - 1);
    result = `Both chose ${cAction.emoji}! It's a draw!\nBoth take 1 damage!`;
  }

  const roundResultEmbed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle(`🎯 Round ${state.round} Result`)
    .setDescription(result)
    .addFields(
      { name: `${state.challenger.user.username}`, value: `${cAction.emoji} ${cAction.name}\n❤️ ${state.challenger.hp}/5 HP`, inline: true },
      { name: 'VS', value: '⚔️', inline: true },
      { name: `${state.opponent.user.username}`, value: `${oAction.emoji} ${oAction.name}\n❤️ ${state.opponent.hp}/5 HP`, inline: true }
    )
    .setTimestamp();

  await message.edit({ embeds: [roundResultEmbed], components: [] });

  // Check for winner
  if (state.challenger.hp <= 0 || state.opponent.hp <= 0 || state.round >= state.maxRounds) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await endDuel(message, state);
  } else {
    state.round++;
    await new Promise(resolve => setTimeout(resolve, 3000));
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
    const refundChallengerResult = addUserSilver(state.challenger.user.id, state.bet);
    const refundOpponentResult = addUserSilver(state.opponent.user.id, state.bet);

    const drawEmbed = new EmbedBuilder()
      .setColor('#808080')
      .setTitle('🤝 Duel Draw!')
      .setDescription(`Both outlaws are equally matched! The duel ends in a draw.\n\n💰 Both players get their 🪙 ${state.bet.toLocaleString()} Silver Coins back.`)
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
  const addResult = addUserSilver(winner.id, winnings);

  if (!addResult.success) {
    // Refund both if winner's inventory is full
    addUserSilver(state.challenger.user.id, state.bet);
    addUserSilver(state.opponent.user.id, state.bet);

    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Duel Error')
      .setDescription(`${winner.username}'s inventory is too full! Both players refunded.`)
      .setTimestamp();

    activeDuels.delete(state.challenger.user.id);
    activeDuels.delete(state.opponent.user.id);

    return message.edit({ embeds: [errorEmbed], components: [] });
  }

  const winEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🏆 DUEL WINNER!')
    .setDescription(`**${winner.username}** wins the duel!\n\n${loser.username} has been defeated in the streets of the Wild West!`)
    .addFields(
      { name: '💰 Prize', value: `🪙 ${winnings.toLocaleString()} Silver Coins`, inline: true },
      { name: '🎯 Final HP', value: `${winner.username}: ${winner.id === state.challenger.user.id ? state.challenger.hp : state.opponent.hp}/5`, inline: true }
    )
    .setFooter({ text: 'The fastest gun in the West!' })
    .setTimestamp();

  await message.edit({ embeds: [winEmbed], components: [] });

  activeDuels.delete(state.challenger.user.id);
  activeDuels.delete(state.opponent.user.id);
  cooldowns.set(state.challenger.user.id, Date.now());
  cooldowns.set(state.opponent.user.id, Date.now());
}
