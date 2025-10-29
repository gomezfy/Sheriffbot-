import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { getSilverCoinEmoji, getGoldBarEmoji, getCowboyEmoji, getPickaxeEmoji, getCheckEmoji, getSparklesEmoji, getMoneybagEmoji, getBackpackEmoji } from '../../utils/customEmojis';
import { cleanupOldSessions, getActiveSessions, getUnclaimedSessions, getMiningStats, formatTime as formatMiningTime } from '../../utils/miningTracker';
import { t, getLocale } from '../../utils/i18n';
import { applyLocalizations } from '../../utils/commandLocalizations';
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
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('mine')
      .setDescription('Mine for gold in the mountains! Solo or cooperative')
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    'mine'
  ),
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
          .setLabel(t(interaction, 'mine_sessions_btn'))
          .setStyle(ButtonStyle.Secondary);
        
        const progressRow = new ActionRowBuilder<ButtonBuilder>().addComponents(viewSessionsButton);
        
        const mineType = activeMining.type === 'solo' ? `${getPickaxeEmoji()} ${t(interaction, 'mine_solo')}` : `👥 ${t(interaction, 'mine_coop')}`;
        const goldBarText = t(interaction, 'gold_bars');
        
        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle(`${getPickaxeEmoji()} ${t(interaction, 'mine_in_progress')}`)
          .setDescription(`${t(interaction, 'mine_currently_mining')}\n\n${bar}\n\n**${t(interaction, 'mine_time_remaining')}:** ${formatTime(timeLeft)}\n**${t(interaction, 'mine_type')}:** ${mineType}\n**${t(interaction, 'mine_expected_reward')}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}`)
          .setFooter({ text: t(interaction, 'mine_come_back') })
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
              .setTitle(`${getPickaxeEmoji()} ${t(i, 'mine_sessions_tracker')}`)
              .setDescription(t(i, 'mine_current_operations'))
              .addFields({
                name: `📊 ${t(i, 'mine_overview')}`,
                value: `\`\`\`yaml
${t(i, 'mine_active_sessions')}: ${stats.totalActive}
${t(i, 'mine_solo_mining_label')}: ${stats.soloMining}
${t(i, 'mine_cooperative_label')}: ${stats.coopMining}
${t(i, 'mine_ready_to_claim')}: ${stats.unclaimed}
${t(i, 'mine_pending_gold')}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions.slice(0, 10).map(({ userId: uid, session }) => {
                const timeLeft = session.endTime - nowTime;
                const progress = Math.floor(((nowTime - session.startTime) / (session.endTime - session.startTime)) * 10);
                const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
                return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? `${getPickaxeEmoji()} Solo` : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n\n');

              sessionsEmbed.addFields({
                name: `⏳ ${t(i, 'mine_active_mining')}`,
                value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} ${t(i, 'mine_more')}_` : ''),
                inline: false
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions.slice(0, 5).map(({ userId: uid, session }) => {
                return `<@${uid}> • ${session.type === 'solo' ? `${getPickaxeEmoji()}` : '👥'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n');

              sessionsEmbed.addFields({
                name: `✅ ${t(i, 'mine_ready_to_claim')}`,
                value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} ${t(i, 'mine_more')}_` : ''),
                inline: false
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: `💤 ${t(i, 'mine_no_active_sessions')}`,
                value: t(i, 'mine_no_one_mining'),
                inline: false
              });
            }

            sessionsEmbed.setFooter({ text: `${getPickaxeEmoji()} ${t(i, 'mine_sessions_realtime')}` }).setTimestamp();
            await i.reply({ embeds: [sessionsEmbed], flags: MessageFlags.Ephemeral });
          }
        });
        
        return;
      } else {
        // Mineração completa - pode coletar
        const claimButton = new ButtonBuilder()
          .setCustomId('claim_mining')
          .setLabel(t(interaction, 'mine_collect_btn'))
          .setStyle(ButtonStyle.Success);
        
        const viewSessionsClaimButton = new ButtonBuilder()
          .setCustomId('view_sessions_claim')
          .setLabel(t(interaction, 'mine_sessions_btn'))
          .setStyle(ButtonStyle.Secondary);
        
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, viewSessionsClaimButton);
        
        const goldEmoji = getGoldBarEmoji();
        
        const goldBarText = t(interaction, 'gold_bars');
        
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle(`✅ ${t(interaction, 'mine_complete')}`)
          .setDescription(`${t(interaction, 'mine_complete_desc')}\n\n💰 **${t(interaction, 'mine_reward')}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!\n\n${t(interaction, 'mine_click_to_join')}`)
          .setFooter({ text: t(interaction, 'mine_great_work') })
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
              .setTitle(`${getPickaxeEmoji()} ${t(i, 'mine_sessions_tracker')}`)
              .setDescription(t(i, 'mine_current_operations'))
              .addFields({
                name: `📊 ${t(i, 'mine_overview')}`,
                value: `\`\`\`yaml
${t(i, 'mine_active_sessions')}: ${stats.totalActive}
${t(i, 'mine_solo_mining_label')}: ${stats.soloMining}
${t(i, 'mine_cooperative_label')}: ${stats.coopMining}
${t(i, 'mine_ready_to_claim')}: ${stats.unclaimed}
${t(i, 'mine_pending_gold')}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions.slice(0, 10).map(({ userId: uid, session }) => {
                const timeLeft = session.endTime - nowTime;
                const progress = Math.floor(((nowTime - session.startTime) / (session.endTime - session.startTime)) * 10);
                const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
                return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? `${getPickaxeEmoji()} Solo` : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n\n');

              sessionsEmbed.addFields({
                name: `⏳ ${t(i, 'mine_active_mining')}`,
                value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} ${t(i, 'mine_more')}_` : ''),
                inline: false
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions.slice(0, 5).map(({ userId: uid, session }) => {
                return `<@${uid}> • ${session.type === 'solo' ? `${getPickaxeEmoji()}` : '👥'} • ${session.goldAmount} ${goldEmoji}`;
              }).join('\n');

              sessionsEmbed.addFields({
                name: `✅ ${t(i, 'mine_ready_to_claim')}`,
                value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} ${t(i, 'mine_more')}_` : ''),
                inline: false
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: `💤 ${t(i, 'mine_no_active_sessions')}`,
                value: t(i, 'mine_no_one_mining'),
                inline: false
              });
            }

            sessionsEmbed.setFooter({ text: `${getPickaxeEmoji()} ${t(i, 'mine_sessions_realtime')}` }).setTimestamp();
            return i.reply({ embeds: [sessionsEmbed], flags: MessageFlags.Ephemeral });
          }
          
          if (i.customId !== 'claim_mining') return;
          if (i.user.id !== userId) {
            return i.reply({ content: `❌ ${t(interaction, 'mine_not_yours')}`, flags: MessageFlags.Ephemeral });
          }
          
          await i.deferUpdate();
          
          const addResult = addItem(userId, 'gold', activeMining.goldAmount);
          
          if (!addResult.success) {
            return i.editReply({
              embeds: [{
                color: 0xFF0000,
                title: `⚠️ ${t(interaction, 'mine_collection_failed')}`,
                description: `${addResult.error}\n\n${t(interaction, 'mine_inventory_heavy')}`,
                footer: { text: t(interaction, 'mine_gold_waiting') }
              }],
              components: []
            });
          }
          
          // Chance de encontrar diamante (5% de chance)
          let foundDiamond = false;
          const diamondChance = Math.random();
          if (diamondChance < 0.05) {
            const diamondResult = addItem(userId, 'diamond', 1);
            if (diamondResult.success) {
              foundDiamond = true;
            }
          }
          
          claimMining(userId);
          
          const userInventory = getInventory(userId);
          const silverEmoji = getSilverCoinEmoji();
          const checkEmoji = getCheckEmoji();
          const sparklesEmoji = getSparklesEmoji();
          const moneybagEmoji = getMoneybagEmoji();
          const backpackEmoji = getBackpackEmoji();
          
          const goldBarText = t(interaction, 'gold_bars');
          const silverCoinText = t(interaction, 'silver_coins');
          const weightText = t(interaction, 'weight');
          const valueText = t(interaction, 'mine_value');
          
          const locale = getLocale(i);
          const diamondText = foundDiamond ? `\n${sparklesEmoji} **${locale === 'pt-BR' ? 'BÔNUS RARO' : 'RARE BONUS'}:** +1 💎 ${locale === 'pt-BR' ? 'Diamante' : 'Diamond'}!` : '';
          
          await i.editReply({
            embeds: [{
              color: foundDiamond ? 0x00FFFF : 0xFFD700,
              title: `${checkEmoji} ${getPickaxeEmoji()} ${t(interaction, 'mine_collected')} ${sparklesEmoji}`,
              description: `\`\`\`diff\n+ ${t(interaction, 'mine_you_collected')} ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!\n\`\`\`${diamondText}\n${backpackEmoji} **${weightText}:** ${addResult.newWeight.toFixed(2)}kg / ${userInventory.maxWeight}kg`,
              fields: [
                {
                  name: `${moneybagEmoji} ${valueText}`,
                  value: `\`${activeMining.goldAmount * GOLD_VALUE} ${silverEmoji} ${silverCoinText}\``,
                  inline: true
                }
              ],
              footer: { text: `${getCowboyEmoji()} ${t(interaction, 'mine_can_mine_again')}` },
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
          .setLabel(t(interaction, 'mine_alone_duration'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('mine_coop')
          .setLabel(t(interaction, 'mine_find_partner'))
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('view_sessions')
          .setLabel(t(interaction, 'mine_sessions_btn'))
          .setStyle(ButtonStyle.Secondary)
      );

    const miningImage = new AttachmentBuilder(path.join(process.cwd(), 'assets', 'gold-mining.png'));

    const goldEmoji = getGoldBarEmoji();
    const silverEmoji = getSilverCoinEmoji();

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`${getPickaxeEmoji()} ${t(interaction, 'mine_title')}`)
      .setImage('attachment://gold-mining.png')
      .setDescription(t(interaction, 'mine_choose'))
      .addFields(
        {
          name: `${getPickaxeEmoji()} ${t(interaction, 'mine_solo_mining_label')}`,
          value: `\`\`\`yaml\n${t(interaction, 'mine_duration_1h30')}\n${t(interaction, 'mine_reward_1_3')}\n${t(interaction, 'mine_players_1')}\`\`\``,
          inline: true
        },
        {
          name: `👥 ${t(interaction, 'mine_coop')}`,
          value: `\`\`\`yaml\n${t(interaction, 'mine_duration_30min')}\n${t(interaction, 'mine_reward_4_6_split')}\n${t(interaction, 'mine_players_2')}\`\`\``,
          inline: true
        },
        {
          name: `💰 ${t(interaction, 'mine_gold_value_label')}`,
          value: `\`\`\`${t(interaction, 'mine_gold_value', { value: GOLD_VALUE })}\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: t(interaction, 'mine_auto_come_back') })
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
          .setTitle(`${getPickaxeEmoji()} MINING SESSIONS TRACKER`)
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
              return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === 'solo' ? '${getPickaxeEmoji()} Solo' : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
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
              return `<@${uid}> • ${session.type === 'solo' ? '${getPickaxeEmoji()}' : '👥'} • ${session.goldAmount} ${goldEmoji}`;
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
            name: `💤 ${t(i, 'mine_no_active_sessions')}`,
            value: t(i, 'mine_no_one_mining_start'),
            inline: false
          });
        }

        sessionsEmbed.setFooter({ text: `${getPickaxeEmoji()} Use the buttons below to start mining!` })
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
            title: `${getPickaxeEmoji()} SOLO MINING STARTED!`,
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
              .setLabel('Join Mining!')
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
              title: `${getPickaxeEmoji()} COOPERATIVE MINING STARTED!`,
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
