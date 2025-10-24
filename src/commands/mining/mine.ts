import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { getSilverCoinEmoji, getGoldBarEmoji } from '../../utils/customEmojis';
import { cleanupOldSessions, getActiveSessions, getUnclaimedSessions, getMiningStats, formatTime as formatMiningTime } from '../../utils/miningTracker';
const { addItem, getInventory, removeItem, transferItem } = require('../../utils/inventoryManager');
const { addUserSilver, getUserSilver, removeUserSilver } = require('../../utils/dataManager');
const { readData, writeData } = require('../../utils/database');

const GOLD_VALUE = 13439; // Silver Coins por barra de ouro
const SOLO_DURATION = 90 * 60 * 1000; // 1h30m (90 minutos)
const COOP_DURATION = 30 * 60 * 1000; // 30 minutos

function getMiningData() {
  return readData('mining.json');
}

function saveMiningData(data: any) {
  writeData('mining.json', data);
}

function getActiveMining(userId: string) {
  const data = getMiningData();
  if (!data[userId]) return null;
  
  const mining = data[userId];
  if (mining.claimed) return null;
  
  return mining;
}

function startMining(userId: string, type: 'solo' | 'coop', partnerId?: string, goldAmount?: number) {
  const data = getMiningData();
  const duration = type === 'solo' ? SOLO_DURATION : COOP_DURATION;
  const now = Date.now();
  
  data[userId] = {
    type,
    startTime: now,
    endTime: now + duration,
    claimed: false,
    goldAmount: goldAmount || (type === 'solo' ? Math.floor(Math.random() * 3) + 1 : 0),
    partnerId: partnerId || null
  };
  
  saveMiningData(data);
}

function claimMining(userId: string) {
  const data = getMiningData();
  if (!data[userId]) return false;
  
  data[userId].claimed = true;
  saveMiningData(data);
  return true;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('⛏️ Mine for gold in the mountains'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    
    // Clean up old claimed sessions (older than 24 hours)
    cleanupOldSessions();
    
    // Verificar se já está minerando
    const activeMining = getActiveMining(userId);
    
    if (activeMining) {
      const now = Date.now();
      const timeLeft = activeMining.endTime - now;
      
      if (timeLeft > 0) {
        // Ainda está minerando
        const goldEmoji = getGoldBarEmoji();
        const progressBar = Math.floor(((now - activeMining.startTime) / (activeMining.endTime - activeMining.startTime)) * 20);
        const bar = '█'.repeat(progressBar) + '░'.repeat(20 - progressBar);
        
        const viewSessionsButton = new ButtonBuilder()
          .setCustomId('view_sessions_progress')
          .setLabel('📊 Ver Sessões')
          .setStyle(ButtonStyle.Secondary);
        
        const progressRow = new ActionRowBuilder<ButtonBuilder>().addComponents(viewSessionsButton);
        
        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('⛏️ MINING IN PROGRESS')
          .setDescription(`You're currently mining for gold!\n\n${bar}\n\n**Time Remaining:** ${formatTime(timeLeft)}\n**Type:** ${activeMining.type === 'solo' ? '⛏️ Solo Mining' : '👥 Cooperative Mining'}\n**Expected Reward:** ${activeMining.goldAmount} ${goldEmoji} Gold Bar${activeMining.goldAmount > 1 ? 's' : ''}`)
          .setFooter({ text: 'Come back when mining is complete!' })
          .setTimestamp();
        
        const reply = await interaction.reply({ embeds: [embed], components: [progressRow], flags: MessageFlags.Ephemeral });
        
        // Handler for view sessions button in progress state
        const progressCollector = reply.createMessageComponentCollector({ time: 300000 });
        
        progressCollector.on('collect', async i => {
          if (i.customId === 'view_sessions_progress') {
            const activeSessions = getActiveSessions();
            const unclaimedSessions = getUnclaimedSessions();
            const stats = getMiningStats();
            const nowTime = Date.now();

            const sessionsEmbed = new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle('⛏️ MINING SESSIONS TRACKER')
              .setDescription('Current mining operations across the server')
              .addFields({
                name: '📊 Overview',
                value: `\`\`\`yaml
Active Sessions: ${stats.totalActive}
Solo Mining: ${stats.soloMining}
Cooperative: ${stats.coopMining}
Ready to Claim: ${stats.unclaimed}
Pending Gold: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions.slice(0, 10).map(({ userId: uid, session }) => {
                const timeLeft = session.endTime - nowTime;
                const progress = Math.floor(((nowTime - session.startTime) / (session.endTime - session.startTime)) * 10);
                const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
                return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? '⛏️ Solo' : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n\n');

              sessionsEmbed.addFields({
                name: '⏳ Active Mining',
                value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} more..._` : ''),
                inline: false
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions.slice(0, 5).map(({ userId: uid, session }) => {
                return `<@${uid}> • ${session.type === 'solo' ? '⛏️' : '👥'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n');

              sessionsEmbed.addFields({
                name: '✅ Ready to Claim',
                value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} more..._` : ''),
                inline: false
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: '💤 No Active Sessions',
                value: 'No one is currently mining.',
                inline: false
              });
            }

            sessionsEmbed.setFooter({ text: '⛏️ Mining sessions update in real-time' }).setTimestamp();
            await i.reply({ embeds: [sessionsEmbed], flags: MessageFlags.Ephemeral });
          }
        });
        
        return;
      } else {
        // Mineração completa - pode coletar
        const claimButton = new ButtonBuilder()
          .setCustomId('claim_mining')
          .setLabel('💎 Collect Gold')
          .setStyle(ButtonStyle.Success);
        
        const viewSessionsClaimButton = new ButtonBuilder()
          .setCustomId('view_sessions_claim')
          .setLabel('📊 Ver Sessões')
          .setStyle(ButtonStyle.Secondary);
        
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, viewSessionsClaimButton);
        
        const goldEmoji = getGoldBarEmoji();
        
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('✅ MINING COMPLETE!')
          .setDescription(`Your mining operation is complete!\n\n💰 **Reward:** ${activeMining.goldAmount} ${goldEmoji} Gold Bar${activeMining.goldAmount > 1 ? 's' : ''}!\n\nClick below to collect your gold!`)
          .setFooter({ text: 'Great work, partner!' })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], components: [row] });
        
        const response = await interaction.fetchReply();
        const collector = response.createMessageComponentCollector({ time: 300000 }); // 5 min to collect
        
        collector.on('collect', async i => {
          if (i.customId === 'view_sessions_claim') {
            const activeSessions = getActiveSessions();
            const unclaimedSessions = getUnclaimedSessions();
            const stats = getMiningStats();
            const nowTime = Date.now();

            const sessionsEmbed = new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle('⛏️ MINING SESSIONS TRACKER')
              .setDescription('Current mining operations across the server')
              .addFields({
                name: '📊 Overview',
                value: `\`\`\`yaml
Active Sessions: ${stats.totalActive}
Solo Mining: ${stats.soloMining}
Cooperative: ${stats.coopMining}
Ready to Claim: ${stats.unclaimed}
Pending Gold: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions.slice(0, 10).map(({ userId: uid, session }) => {
                const timeLeft = session.endTime - nowTime;
                const progress = Math.floor(((nowTime - session.startTime) / (session.endTime - session.startTime)) * 10);
                const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
                return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? '⛏️ Solo' : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n\n');

              sessionsEmbed.addFields({
                name: '⏳ Active Mining',
                value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} more..._` : ''),
                inline: false
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions.slice(0, 5).map(({ userId: uid, session }) => {
                return `<@${uid}> • ${session.type === 'solo' ? '⛏️' : '👥'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n');

              sessionsEmbed.addFields({
                name: '✅ Ready to Claim',
                value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} more..._` : ''),
                inline: false
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: '💤 No Active Sessions',
                value: 'No one is currently mining.',
                inline: false
              });
            }

            sessionsEmbed.setFooter({ text: '⛏️ Mining sessions update in real-time' }).setTimestamp();
            return i.reply({ embeds: [sessionsEmbed], flags: MessageFlags.Ephemeral });
          }
          
          if (i.customId !== 'claim_mining') return;
          if (i.user.id !== userId) {
            return i.reply({ content: '❌ This gold is not yours!', flags: MessageFlags.Ephemeral });
          }
          
          await i.deferUpdate();
          
          const addResult = addItem(userId, 'gold', activeMining.goldAmount);
          
          if (!addResult.success) {
            return i.editReply({
              embeds: [{
                color: 0xFF0000,
                title: '⚠️ COLLECTION FAILED',
                description: `${addResult.error}\n\nYour saddlebag is too heavy to carry the gold!\n\nFree up some space and use /mine again to collect.`,
                footer: { text: 'The gold will wait for you!' }
              }],
              components: []
            });
          }
          
          claimMining(userId);
          
          const userInventory = getInventory(userId);
          const silverEmoji = getSilverCoinEmoji();
          
          await i.editReply({
            embeds: [{
              color: 0xFFD700,
              title: '⛏️ GOLD COLLECTED!',
              description: `\`\`\`diff\n+ You collected ${activeMining.goldAmount} ${goldEmoji} Gold Bar${activeMining.goldAmount > 1 ? 's' : ''}!\n\`\`\`\n💼 Weight: **${addResult.newWeight.toFixed(2)}kg / ${userInventory.maxWeight}kg**`,
              fields: [
                {
                  name: '💰 Value',
                  value: `\`${activeMining.goldAmount * GOLD_VALUE} ${silverEmoji} Silver Coins\``,
                  inline: true
                }
              ],
              footer: { text: '🤠 Great work, partner! You can mine again now.' },
              timestamp: new Date().toISOString()
            }],
            components: []
          });
          
          collector.stop();
        });
        
        return;
      }
    }
    
    // Não está minerando - mostrar opções
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mine_solo')
          .setLabel('⛏️ Mine Alone (1h30m)')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('mine_coop')
          .setLabel('👥 Find Partner (30min)')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('view_sessions')
          .setLabel('📊 Ver Sessões')
          .setStyle(ButtonStyle.Secondary)
      );

    const miningImage = new AttachmentBuilder(path.join(process.cwd(), 'assets', 'gold-mining.png'));

    const goldEmoji = getGoldBarEmoji();
    const silverEmoji = getSilverCoinEmoji();

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⛏️ GOLD MINING')
      .setImage('attachment://gold-mining.png')
      .setDescription('Choose your mining method:')
      .addFields(
        {
          name: '⛏️ Solo Mining',
          value: '```yaml\nDuration: 1h 30min\nReward: 1-3 Gold Bars\nPlayers: 1```',
          inline: true
        },
        {
          name: '👥 Cooperative Mining',
          value: '```yaml\nDuration: 30 minutes\nReward: 4-6 Gold Bars (split)\nPlayers: 2```',
          inline: true
        },
        {
          name: '💰 Gold Value',
          value: `\`\`\`1 Gold Bar = ${GOLD_VALUE} Silver Coins\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: 'Mining happens automatically - come back when done!' })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      files: [miningImage]
    });
    
    const response = await interaction.fetchReply();

    // Collector para os botões
    const collector = response.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'view_sessions') {
        // Show mining sessions
        const activeSessions = getActiveSessions();
        const unclaimedSessions = getUnclaimedSessions();
        const stats = getMiningStats();
        const now = Date.now();

        const sessionsEmbed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('⛏️ MINING SESSIONS TRACKER')
          .setDescription('Current mining operations across the server')
          .addFields(
            {
              name: '📊 Overview',
              value: `\`\`\`yaml
Active Sessions: ${stats.totalActive}
Solo Mining: ${stats.soloMining}
Cooperative: ${stats.coopMining}
Ready to Claim: ${stats.unclaimed}
Pending Gold: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
              inline: false
            }
          );

        // Show active mining sessions
        if (activeSessions.length > 0) {
          const activeList = activeSessions
            .slice(0, 10)
            .map(({ userId: uid, session }) => {
              const timeLeft = session.endTime - now;
              const progress = Math.floor(((now - session.startTime) / (session.endTime - session.startTime)) * 10);
              const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
              return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? '⛏️ Solo' : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
            })
            .join('\n\n');

          sessionsEmbed.addFields({
            name: '⏳ Active Mining',
            value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} more..._` : ''),
            inline: false
          });
        }

        // Show unclaimed sessions
        if (unclaimedSessions.length > 0) {
          const unclaimedList = unclaimedSessions
            .slice(0, 5)
            .map(({ userId: uid, session }) => {
              return `<@${uid}> • ${session.type === 'solo' ? '⛏️' : '👥'} • ${session.goldAmount} ${goldEmoji}`;
            })
            .join('\n');

          sessionsEmbed.addFields({
            name: '✅ Ready to Claim',
            value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} more..._` : ''),
            inline: false
          });
        }

        if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
          sessionsEmbed.addFields({
            name: '💤 No Active Sessions',
            value: 'No one is currently mining. Use the buttons below to start!',
            inline: false
          });
        }

        sessionsEmbed.setFooter({ text: '⛏️ Use the buttons below to start mining!' })
          .setTimestamp();

        await i.reply({ embeds: [sessionsEmbed], flags: MessageFlags.Ephemeral });

      } else if (i.customId === 'mine_solo') {
        // Verify user for solo mining
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '❌ This mining operation is not for you!', flags: MessageFlags.Ephemeral });
        }

        const goldAmount = Math.floor(Math.random() * 3) + 1;
        startMining(userId, 'solo', undefined, goldAmount);

        await i.update({
          embeds: [{
            color: 0xFFD700,
            title: '⛏️ SOLO MINING STARTED!',
            description: `You started mining for gold!\n\n⏰ **Duration:** 1 hour 30 minutes\n💎 **Expected:** ${goldAmount} ${goldEmoji} Gold Bar${goldAmount > 1 ? 's' : ''}\n\nThe mining will happen automatically.\n**Come back in 1h30m** to collect your gold!`,
            footer: { text: 'Use /mine to check progress!' },
            timestamp: new Date().toISOString()
          }],
          components: []
        });

      } else if (i.customId === 'mine_coop') {
        // Verify user for cooperative mining
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '❌ This mining operation is not for you!', flags: MessageFlags.Ephemeral });
        }
        
        // Mineração cooperativa - criar convite
        const inviteRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('join_mining')
              .setLabel('⛏️ Join Mining!')
              .setStyle(ButtonStyle.Success)
          );

        await i.update({
          embeds: [{
            color: 0x00FF00,
            title: '👥 LOOKING FOR MINING PARTNER',
            description: `**${interaction.user.username}** is looking for a mining partner!\n\n${goldEmoji} **Reward:** 4-6 Gold Bars (split between both)\n⏰ **Duration:** 30 minutes\n\n**Click below to join!**`,
            footer: { text: 'First person to click joins!' }
          }],
          components: [inviteRow]
        });

        // Collector para convite cooperativo
        const coopCollector = response.createMessageComponentCollector({ time: 120000 });

        coopCollector.on('collect', async coopI => {
          if (coopI.customId !== 'join_mining') return;
          
          if (coopI.user.id === interaction.user.id) {
            return coopI.reply({ content: '❌ You cannot mine with yourself!', flags: MessageFlags.Ephemeral });
          }

          const partnerId = coopI.user.id;
          
          // Verificar se parceiro já está minerando
          const partnerMining = getActiveMining(partnerId);
          if (partnerMining) {
            return coopI.reply({ 
              content: `❌ You're already mining! Complete your current operation first.`, 
              flags: MessageFlags.Ephemeral 
            });
          }

          // Iniciar mineração cooperativa
          const goldAmount = Math.floor(Math.random() * 3) + 4; // 4-6 gold
          const goldPerPerson = Math.floor(goldAmount / 2);
          const remainder = goldAmount % 2;
          
          const ownerGold = goldPerPerson + (remainder === 1 ? 1 : 0);
          const partnerGold = goldPerPerson;
          
          startMining(userId, 'coop', partnerId, ownerGold);
          startMining(partnerId, 'coop', userId, partnerGold);

          await coopI.update({
            embeds: [{
              color: 0xFFD700,
              title: '⛏️ COOPERATIVE MINING STARTED!',
              description: `**${interaction.user.username}** and **${coopI.user.username}** started mining together!\n\n⏰ **Duration:** 30 minutes\n💎 **Total Gold:** ${goldAmount} ${goldEmoji} Gold Bars\n\n**${interaction.user.username}:** ${ownerGold} ${goldEmoji}\n**${coopI.user.username}:** ${partnerGold} ${goldEmoji}\n\nThe mining will happen automatically.\n**Come back in 30 minutes** to collect your gold!`,
              footer: { text: 'Use /mine to check progress!' },
              timestamp: new Date().toISOString()
            }],
            components: []
          });

          coopCollector.stop();
        });

        coopCollector.on('end', async (collected) => {
          if (collected.size === 0) {
            await response.edit({
              embeds: [{
                color: 0x808080,
                title: '⏰ MINING INVITATION EXPIRED',
                description: 'No one joined your mining operation.\n\nTry again or mine solo!',
                footer: { text: 'Better luck next time!' }
              }],
              components: []
            });
          }
        });

        collector.stop();
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await response.edit({
          embeds: [{
            color: 0x808080,
            title: '⏰ MINING INVITATION EXPIRED',
            description: 'You took too long to decide!\n\nUse `/mine` again to start.',
            footer: { text: 'Time waits for no one!' }
          }],
          components: []
        });
      }
    });
  },
};
