import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
const { getUserSilver, addUserSilver } = require('../../utils/dataManager');
const { addItem } = require('../../utils/inventoryManager');
const { applyPunishment, isPunished, formatTime, getRemainingTime } = require('../../utils/punishmentManager');
const { createAutoWanted } = require('../../utils/autoWanted');
import path from 'path';

const activeRobberies = new Map();
const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bankrob')
    .setDescription('Start a bank robbery! Find a partner and rob the bank together!'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;

    // Check if user is punished (in jail)
    const punishment = isPunished(userId);
    if (punishment) {
      const remaining = getRemainingTime(userId);
      await interaction.reply({
        content: `🔒 **You're in jail!**\n\n${punishment.reason}\n\n⏰ Time remaining: **${formatTime(remaining)}**\n\nYou cannot commit crimes while serving your sentence!`,
        ephemeral: true
      });
    }

    const now = Date.now();
    const cooldownAmount = 300000; // 5 minutes

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000 / 60);
        await interaction.reply({
          content: `⏰ The sheriff's watching you closely! Wait ${timeLeft} more minutes before attempting another robbery.`,
          ephemeral: true
        });
      }
    }

    if (activeRobberies.has(userId)) {
      await interaction.reply({
        content: '❌ You already have an active robbery! Wait for it to finish or expire.',
        ephemeral: true
      });
    }

    const joinButton = new ButtonBuilder()
      .setCustomId(`bankrob_join_${userId}`)
      .setLabel('🤠 Join the Robbery')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);

    const bankRobberyImage = new AttachmentBuilder(path.join(__dirname, '../../../assets/bank-robbery.png'));

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🏦 BANK ROBBERY IN PROGRESS!')
      .setDescription(`**${interaction.user.username}** is planning a bank robbery!\n\nThis is a dangerous job, partner. We need one more outlaw to pull this off!\n\n⏰ You have **60 seconds** to find a partner!`)
      .setImage('attachment://bank-robbery.png')
      .addFields(
        { name: '🪙 Silver Reward', value: '800-2000 Coins (split)', inline: true },
        { name: '🥇 Gold Bonus', value: '2-4 Gold Bars (split)', inline: true },
        { name: '⏱️ Duration', value: '3 minutes', inline: true },
        { name: '⚠️ Risk', value: '30% chance of capture!', inline: true }
      )
      .setFooter({ text: 'Click the button to join!' })
      .setTimestamp();

    const message = await interaction.reply({ embeds: [embed], components: [row], files: [bankRobberyImage], fetchReply: true });

    activeRobberies.set(userId, {
      initiator: interaction.user,
      message: message,
      started: false,
      partner: null,
      channelId: interaction.channelId
    });

    const collector = message.createMessageComponentCollector({
      filter: i => i.customId === `bankrob_join_${userId}`,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id === userId) {
        await i.reply({ content: '❌ You can\'t join your own robbery!', ephemeral: true });
        return;
      }

      // Check if partner is also not punished
      const partnerPunishment = isPunished(i.user.id);
      if (partnerPunishment) {
        const remaining = getRemainingTime(i.user.id);
        await i.reply({
          content: `🔒 You're in jail and cannot join robberies!\n\n⏰ Time remaining: **${formatTime(remaining)}**`,
          ephemeral: true
        });
        return;
      }

      const robbery = activeRobberies.get(userId);
      if (!robbery || robbery.started) {
        await i.reply({ content: '❌ This robbery has already started or ended!', ephemeral: true });
        return;
      }

      robbery.partner = i.user;
      robbery.started = true;

      const createProgressBar = (percent: number): string => {
        const filled = Math.round(percent / 5);
        const empty = 20 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return bar;
      };

      const updateRobberyProgress = async (message: Message, percent: number, timeLeft: string): Promise<void> => {
        const progressBar = createProgressBar(percent);
        const embed = new EmbedBuilder()
          .setColor(percent < 50 ? '#FFD700' : percent < 80 ? '#FFA500' : '#FF4500')
          .setTitle('🏦 BANK ROBBERY IN PROGRESS!')
          .setDescription(`**${interaction.user.username}** and **${i.user.username}** are robbing the bank!\n\n**Progress:**\n\`${progressBar}\` ${percent}%\n\n⏰ Time remaining: **${timeLeft}**\n\n🤫 Keep quiet and don't attract attention!`)
          .setFooter({ text: 'The sheriff might be on patrol...' })
          .setTimestamp();

        try {
          await message.edit({ embeds: [embed], components: [] });
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      };

      const startEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏦 BANK ROBBERY STARTED!')
        .setDescription(`**${interaction.user.username}** and **${i.user.username}** are robbing the bank!\n\n**Progress:**\n\`${createProgressBar(0)}\` 0%\n\n⏰ Time remaining: **3m 0s**\n\n🤫 Keep quiet and don't attract attention!`)
        .setFooter({ text: 'The sheriff might be on patrol...' })
        .setTimestamp();

      await i.update({ embeds: [startEmbed], components: [] });

      const totalDuration = 180000;
      const updateInterval = 10000;
      let elapsed = 0;

      const progressInterval = setInterval(async () => {
        elapsed += updateInterval;
        const maxPercent = 95;
        const percent = Math.min(Math.round((elapsed / totalDuration) * maxPercent), maxPercent);
        const remainingMs = totalDuration - elapsed;
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        const timeLeft = `${minutes}m ${seconds}s`;

        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
        } else {
          await updateRobberyProgress(message, percent, timeLeft);
        }
      }, updateInterval);

      setTimeout(async () => {
        clearInterval(progressInterval);
        try {
          const outcomeRoll = Math.random();
          
          // 70% success, 20% partial escape, 10% total capture
          let outcome;
          if (outcomeRoll < 0.70) {
            outcome = 'success'; // Both escape
          } else if (outcomeRoll < 0.90) {
            outcome = 'partial'; // One escapes, one captured
          } else {
            outcome = 'fail'; // Both captured
          }

          // Silver Coins reward (800-2000)
          const silverReward = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
          const silverPerPerson = Math.floor(silverReward / 2);
          
          // Gold Bars bonus (2-4 bars)
          const goldBars = Math.floor(Math.random() * 3) + 2; // 2 to 4
          const goldPerPerson = Math.floor(goldBars / 2);
          const extraGold = goldBars % 2;

          await updateRobberyProgress(message, 100, '0m 0s');
          await new Promise(resolve => setTimeout(resolve, 500));

          if (outcome === 'success') {
            // BOTH ESCAPE SUCCESSFULLY
            const initiatorSilverResult = addUserSilver(userId, silverPerPerson);
            const partnerSilverResult = addUserSilver(i.user.id, silverPerPerson);
            
            let initiatorGoldResult = addItem(userId, 'gold', goldPerPerson);
            let partnerGoldResult = addItem(i.user.id, 'gold', goldPerPerson + extraGold);

            let initiatorLoot: string[] = [];
            let partnerLoot: string[] = [];
            let warnings: string[] = [];
            
            if (initiatorSilverResult.success) initiatorLoot.push(`${silverPerPerson} 🪙`);
            else warnings.push(`⚠️ ${interaction.user.username}'s bag too heavy for Silver!`);
            
            if (initiatorGoldResult.success) initiatorLoot.push(`${goldPerPerson} 🥇`);
            else warnings.push(`⚠️ ${interaction.user.username}'s bag too heavy for Gold!`);
            
            if (partnerSilverResult.success) partnerLoot.push(`${silverPerPerson} 🪙`);
            else warnings.push(`⚠️ ${i.user.username}'s bag too heavy for Silver!`);
            
            if (partnerGoldResult.success) partnerLoot.push(`${goldPerPerson + extraGold} 🥇`);
            else warnings.push(`⚠️ ${i.user.username}'s bag too heavy for Gold!`);

            const successEmbed = new EmbedBuilder()
              .setColor(warnings.length > 0 ? '#FFA500' : '#00FF00')
              .setTitle('🎉 ROBBERY SUCCESSFUL!')
              .setDescription(`**${interaction.user.username}** and **${i.user.username}** successfully robbed the bank and escaped!\n\nYou managed to escape with the loot!`)
              .addFields(
                { name: '💰 Total Haul', value: `${silverReward} 🪙 Silver Coins\n${goldBars} 🥇 Gold Bars`, inline: false },
                { name: `${interaction.user.username}'s Share`, value: initiatorLoot.length > 0 ? initiatorLoot.join(' + ') : '❌ Nothing (inventory full)', inline: true },
                { name: `${i.user.username}'s Share`, value: partnerLoot.length > 0 ? partnerLoot.join(' + ') : '❌ Nothing (inventory full)', inline: true }
              )
              .setFooter({ text: warnings.length > 0 ? 'Some loot was lost! Clean your inventory!' : 'Spend it wisely before the law catches up!' })
              .setTimestamp();
            
            if (warnings.length > 0) {
              successEmbed.addFields({ name: '⚠️ Warnings', value: warnings.join('\n'), inline: false });
            }

            if (interaction.channel && 'send' in interaction.channel) {
              await interaction.channel.send({ embeds: [successEmbed] });
            }

          } else if (outcome === 'partial') {
            // ONE ESCAPES, ONE CAPTURED
            const whoEscapes = Math.random() < 0.5 ? 'initiator' : 'partner';
            const escapee = whoEscapes === 'initiator' ? interaction.user : i.user;
            const captured = whoEscapes === 'initiator' ? i.user : interaction.user;
            
            // Escapee gets ALL the loot
            const escapeeId = escapee.id;
            const silverResult = addUserSilver(escapeeId, silverReward);
            const goldResult = addItem(escapeeId, 'gold', goldBars);
            
            let loot: string[] = [];
            if (silverResult.success) loot.push(`${silverReward} 🪙`);
            if (goldResult.success) loot.push(`${goldBars} 🥇`);
            
            // Apply punishment to captured person (30 min jail)
            applyPunishment(captured.id, 'Captured during bank robbery');
            
            // Create automatic wanted poster for escapee
            const wantedResult = await createAutoWanted(interaction.client, interaction.guildId, escapee, silverReward);

            const partialEmbed = new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⚖️ PARTIAL ESCAPE!')
              .setDescription(`**${escapee.username}** managed to escape, but **${captured.username}** was captured by the Sheriff!\n\n🚨 The escapee is now WANTED!`)
              .addFields(
                { name: '💰 Total Haul', value: `${silverReward} 🪙 + ${goldBars} 🥇`, inline: false },
                { name: '🏃 Escaped', value: `${escapee.username}\n${loot.length > 0 ? loot.join(' + ') : '(inventory full)'}`, inline: true },
                { name: '🔒 Captured', value: `${captured.username}\n**30 min jail time**`, inline: true },
                { name: '🎯 Bounty Placed', value: `${wantedResult.success ? `🪙 ${wantedResult.amount.toLocaleString()} Silver Coins` : 'System error'}`, inline: false }
              )
              .setFooter({ text: `${escapee.username} is now wanted! Use /claim to capture them!` })
              .setTimestamp();

            if (interaction.channel && 'send' in interaction.channel) {
              await interaction.channel.send({ embeds: [partialEmbed] });
            }

          } else {
            // BOTH CAPTURED
            applyPunishment(userId, 'Captured during bank robbery');
            applyPunishment(i.user.id, 'Captured during bank robbery');

            const failEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('🚨 BOTH CAPTURED!')
              .setDescription(`**${interaction.user.username}** and **${i.user.username}** were both caught by the Sheriff!\n\nNo loot was stolen, and both outlaws are now in jail!`)
              .addFields(
                { name: '🔒 Punishment', value: '**30 minutes in jail**', inline: true },
                { name: '💸 Lost', value: 'All potential loot', inline: true }
              )
              .setFooter({ text: 'Crime doesn\'t pay when the Sheriff is on duty!' })
              .setTimestamp();

            if (interaction.channel && 'send' in interaction.channel) {
              await interaction.channel.send({ embeds: [failEmbed] });
            }
          }

          activeRobberies.delete(userId);
          cooldowns.set(userId, Date.now());
          cooldowns.set(i.user.id, Date.now());

          setTimeout(() => {
            cooldowns.delete(userId);
            cooldowns.delete(i.user.id);
          }, cooldownAmount);
        } catch (error) {
          console.error('Error during bank robbery:', error);
          activeRobberies.delete(userId);
        }
      }, 180000);

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const failEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('❌ Robbery Cancelled')
          .setDescription('No partner joined the robbery. The plan was abandoned.')
          .setFooter({ text: 'Better luck next time, partner!' })
          .setTimestamp();

        message.edit({ embeds: [failEmbed], components: [] });
        activeRobberies.delete(userId);
      }
    });
  },
};
