import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
const { getUserGold, addUserGold, removeUserGold, setUserGold, transferGold } = require('../../utils/dataManager');
import path from 'path';

const cooldowns = new Map();
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Challenge another player to a dice duel!')
    .addUserOption(option =>
      option
        .setName('opponent')
        .setDescription('The player you want to challenge')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('bet')
        .setDescription('Amount of Saloon Tokens to bet')
        .setRequired(true)
        .setMinValue(10)
    )
    .addIntegerOption(option =>
      option
        .setName('guess')
        .setDescription('Your guess for the dice total (2-12)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(12)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('opponent');
    const bet = interaction.options.getInteger('bet');
    const challengerGuess = interaction.options.getInteger('guess');

    if (!opponent || !bet || !challengerGuess) {
      await interaction.reply({
        content: '❌ Please specify both opponent, bet, and guess!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const now = Date.now();
    const cooldownAmount = 10000;

    if (opponent.bot) {
      await interaction.reply({
        content: '❌ You can\'t challenge a bot to a dice game, partner!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (opponent.id === challenger.id) {
      await interaction.reply({
        content: '❌ You can\'t challenge yourself, partner!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (cooldowns.has(challenger.id)) {
      const expirationTime = cooldowns.get(challenger.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: `⏰ Hold your horses! Wait ${timeLeft.toFixed(1)} more seconds before challenging again.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    if (cooldowns.has(opponent.id)) {
      const expirationTime = cooldowns.get(opponent.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: `⏰ ${opponent.tag} is still recovering from their last duel! They need ${timeLeft.toFixed(1)} more seconds.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    if (activeGames.has(challenger.id) || activeGames.has(opponent.id)) {
      await interaction.reply({
        content: '❌ One of you is already in an active dice game!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const challengerGold = getUserGold(challenger.id);
    const opponentGold = getUserGold(opponent.id);

    if (challengerGold < bet) {
      await interaction.reply({
        content: `❌ You don't have enough tokens! You have ${challengerGold} Saloon Tokens but tried to bet ${bet} Saloon Tokens.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (opponentGold < bet) {
      await interaction.reply({
        content: `❌ ${opponent.tag} doesn't have enough tokens for this bet! They only have ${opponentGold} Saloon Tokens.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const gameId = `${challenger.id}_${Date.now()}`;
    
    const guessButtons: ButtonBuilder[] = [];
    for (let i = 2; i <= 12; i++) {
      guessButtons.push(
        new ButtonBuilder()
          .setCustomId(`dice_guess_${gameId}_${i}`)
          .setLabel(`${i}`)
          .setStyle(ButtonStyle.Secondary)
      );
    }

    const rows = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(guessButtons.slice(0, 5)),
      new ActionRowBuilder<ButtonBuilder>().addComponents(guessButtons.slice(5, 10)),
      new ActionRowBuilder<ButtonBuilder>().addComponents(guessButtons.slice(10))
    ];

    const diceGameImage = new AttachmentBuilder(path.join(process.cwd(), 'assets/dice-game.png'));

    const challengeEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎲 DICE DUEL CHALLENGE!')
      .setDescription(`**${challenger.tag}** has challenged **${opponent.tag}** to a dice duel!\n\n🎫 **Bet:** ${bet} Saloon Tokens\n🎯 **${challenger.tag}'s Guess:** ${challengerGuess}\n\n${opponent}, choose your guess (2-12) below!`)
      .setImage('attachment://dice-game.png')
      .addFields(
        { name: '⏰ Time Limit', value: '30 seconds to accept', inline: true },
        { name: '🏆 Winner Takes All', value: `${bet * 2} Saloon Tokens total`, inline: true }
      )
      .setFooter({ text: 'Choose wisely, partner!' })
      .setTimestamp();

    await interaction.reply({ 
      content: `${opponent}, you've been challenged to a dice duel!`,
      embeds: [challengeEmbed], 
      components: rows, 
      files: [diceGameImage]
    });
    const message = await interaction.fetchReply();

    activeGames.set(challenger.id, gameId);
    activeGames.set(opponent.id, gameId);

    const collector = message.createMessageComponentCollector({
      filter: i => i.user.id === opponent.id && i.customId.startsWith(`dice_guess_${gameId}`),
      time: 30000,
      max: 1
    });

    collector.on('collect', async i => {
      const opponentGuess = parseInt(i.customId.split('_').pop() || '0');

      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const challengerDiff = Math.abs(total - challengerGuess);
      const opponentDiff = Math.abs(total - opponentGuess);

      let winner, loser, winnerGuess, loserGuess;

      if (challengerDiff < opponentDiff) {
        winner = challenger;
        loser = opponent;
        winnerGuess = challengerGuess;
        loserGuess = opponentGuess;
        
        winner = challenger;
        loser = opponent;
        winnerGuess = challengerGuess;
        loserGuess = opponentGuess;
      } else if (opponentDiff < challengerDiff) {
        winner = opponent;
        loser = challenger;
        winnerGuess = opponentGuess;
        loserGuess = challengerGuess;
      } else {
        const tieEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🎲 DICE DUEL - TIE!')
          .setDescription(`**It's a tie!** Both players were equally close!\n\n🎲 Dice: ${dice1} + ${dice2} = **${total}**`)
          .addFields(
            { name: `${challenger.tag}'s Guess`, value: `${challengerGuess} (diff: ${challengerDiff})`, inline: true },
            { name: `${opponent.tag}'s Guess`, value: `${opponentGuess} (diff: ${opponentDiff})`, inline: true },
            { name: 'Result', value: 'Bets returned to both players', inline: false }
          )
          .setFooter({ text: 'No winners, no losers - perfectly balanced!' })
          .setTimestamp();

        await i.update({ embeds: [tieEmbed], components: [] });
        activeGames.delete(challenger.id);
        activeGames.delete(opponent.id);
        cooldowns.set(challenger.id, Date.now());
        cooldowns.set(opponent.id, Date.now());
        setTimeout(() => {
          cooldowns.delete(challenger.id);
          cooldowns.delete(opponent.id);
        }, cooldownAmount);
        return;
      }

      const transferResult = transferGold(loser.id, winner.id, bet);

      if (!transferResult.success) {
        const fullInventoryEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🎲 DICE DUEL - INVENTORY FULL!')
          .setDescription(`**${winner.tag}** won but their inventory is too heavy!\n\n🎲 Dice: ${dice1} + ${dice2} = **${total}**\n\n🚫 ${winner.tag} couldn't carry the prize! The bet is returned to ${loser.tag}.`)
          .addFields(
            { name: `🎯 ${winner.tag}'s Guess`, value: `${winnerGuess} (diff: ${Math.abs(total - winnerGuess)})`, inline: true },
            { name: `❌ ${loser.tag}'s Guess`, value: `${loserGuess} (diff: ${Math.abs(total - loserGuess)})`, inline: true }
          )
          .setFooter({ text: 'Clean out your inventory before dueling!' })
          .setTimestamp();

        await i.update({ embeds: [fullInventoryEmbed], components: [] });
      } else {
        const winnerNewGold = getUserGold(winner.id);
        const loserNewGold = getUserGold(loser.id);

        const resultEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎲 DICE DUEL RESULTS!')
        .setDescription(`🎲 The dice showed: ${dice1} + ${dice2} = **${total}**\n\n🏆 **${winner.tag} wins ${bet * 2} Saloon Tokens!**`)
        .addFields(
          { name: `🎯 ${winner.tag}'s Guess`, value: `${winnerGuess} (difference: ${Math.abs(total - winnerGuess)})`, inline: true },
          { name: `❌ ${loser.tag}'s Guess`, value: `${loserGuess} (difference: ${Math.abs(total - loserGuess)})`, inline: true },
          { name: '\u200B', value: '\u200B', inline: false },
          { name: `🎫 ${winner.tag}'s Tokens`, value: `${winnerNewGold} Saloon Tokens`, inline: true },
          { name: `🎫 ${loser.tag}'s Tokens`, value: `${loserNewGold} Saloon Tokens`, inline: true }
        )
        .setFooter({ text: `${winner.tag} called it closest!` })
        .setTimestamp();

        await i.update({ embeds: [resultEmbed], components: [] });
      }

      activeGames.delete(challenger.id);
      activeGames.delete(opponent.id);

      cooldowns.set(challenger.id, Date.now());
      cooldowns.set(opponent.id, Date.now());

      setTimeout(() => {
        cooldowns.delete(challenger.id);
        cooldowns.delete(opponent.id);
      }, cooldownAmount);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('⏰ Challenge Expired')
          .setDescription(`${opponent.tag} didn't respond in time. The challenge has been cancelled.`)
          .setFooter({ text: 'Better luck next time!' })
          .setTimestamp();

        message.edit({ embeds: [timeoutEmbed], components: [] });
        activeGames.delete(challenger.id);
        activeGames.delete(opponent.id);
      }
    });
  },
};
