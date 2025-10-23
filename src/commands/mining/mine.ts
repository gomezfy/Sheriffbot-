import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { getSilverCoinEmoji, getGoldBarEmoji } from '../../utils/customEmojis';
const { addItem, getInventory, removeItem, transferItem } = require('../../utils/inventoryManager');
const { addUserSilver, getUserSilver, removeUserSilver } = require('../../utils/dataManager');
const { showProgressBar } = require('../../utils/progressBar');
const { readData, writeData } = require('../../utils/database');

const GOLD_VALUE = 700; // Silver Coins por barra de ouro
const SOLO_COOLDOWN = 50 * 60 * 1000; // 50 minutos
const COOP_COOLDOWN = 2 * 60 * 60 * 1000; // 2 horas

// Garantir que o arquivo existe

function getMiningData() {
  return readData('mining.json');
}

function saveMiningData(data: any) {
  writeData('mining.json', data);
}

function canMine(userId: string) {
  const data = getMiningData();
  if (!data[userId]) return { canMine: true };
  
  const now = Date.now();
  const cooldownEnd = data[userId].cooldownEnd;
  
  if (now < cooldownEnd) {
    const timeLeft = cooldownEnd - now;
    return { canMine: false, timeLeft };
  }
  
  return { canMine: true };
}

function setCooldown(userId: string, duration: number) {
  const data = getMiningData();
  data[userId] = {
    cooldownEnd: Date.now() + duration
  };
  saveMiningData(data);
}

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('⛏️ Mine for gold in the mountains'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    
    // Verificar cooldown
    const mineCheck = canMine(userId);
    if (!mineCheck.canMine) {
      const timeLeft = formatTime(mineCheck.timeLeft ?? 0);
      await interaction.reply({
        embeds: [{
          color: 0x8B4513,
          title: '⛏️ MINING',
          description: `You're too tired to mine right now, partner!\n\n⏰ Come back in: **${timeLeft}**`,
          footer: { text: 'Rest up and try again later!' }
        }],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Criar botões
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mine_solo')
          .setLabel('⛏️ Mine Alone (50min)')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('mine_coop')
          .setLabel('👥 Find Partner (2h)')
          .setStyle(ButtonStyle.Success)
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
          value: '```yaml\nDuration: 50 minutes\nReward: 1-3 Gold Bars\nRisk: Lower```',
          inline: true
        },
        {
          name: '👥 Cooperative Mining',
          value: '```yaml\nDuration: 2 hours\nReward: 4-6 Gold Bars (split)\nRisk: Higher```',
          inline: true
        },
        {
          name: '💰 Gold Value',
          value: `\`\`\`1 Gold Bar = ${GOLD_VALUE} Silver Coins\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: 'Choose your mining method wisely!' })
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
      if (i.customId === 'mine_solo') {
        // Verify user for solo mining
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '❌ This mining operation is not for you!', flags: MessageFlags.Ephemeral });
        }

        await i.deferUpdate();
        await showProgressBar(i, '⛏️ MINING IN PROGRESS', 'Mining for gold...', 3000, '#FFD700');

        const goldAmount = Math.floor(Math.random() * 3) + 1;
        const addResult = addItem(userId, 'gold', goldAmount);

        if (!addResult.success) {
          return i.editReply({
            embeds: [{
              color: 0xFF0000,
              title: '⚠️ MINING FAILED',
              description: `${addResult.error}\n\nYour saddlebag is too heavy to carry the gold!`,
              footer: { text: 'Free up some space and try again!' }
            }],
            components: []
          });
        }

        setCooldown(userId, SOLO_COOLDOWN);
        
        // Get user's inventory to show correct maxWeight
        const userInventory = getInventory(userId);
        const userMaxWeight = userInventory.maxWeight;

        await i.editReply({
          embeds: [{
            color: 0xFFD700,
            title: '⛏️ MINING SUCCESS!',
            description: `\`\`\`diff\n+ You mined ${goldAmount} ${goldEmoji} Gold Bar${goldAmount > 1 ? 's' : ''}!\n\`\`\`\n💼 Weight: **${addResult.newWeight.toFixed(2)}kg / ${userMaxWeight}kg**`,
            fields: [
              {
                name: '💰 Value',
                value: `\`${goldAmount * GOLD_VALUE} ${silverEmoji} Silver Coins\``,
                inline: true
              },
              {
                name: '⏰ Next Mining',
                value: `\`In 50 minutes\``,
                inline: true
              }
            ],
            footer: { text: '🤠 Good work, partner!' },
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
            description: `**${interaction.user.username}** is looking for a mining partner!\n\n${goldEmoji} Reward: 4-6 Gold Bars (split between both)\n⏰ Duration: 2 hours cooldown\n\n**Click below to join!**`,
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
          
          // Verificar se parceiro pode minerar
          const partnerCheck = canMine(partnerId);
          if (!partnerCheck.canMine) {
            const timeLeft = formatTime(partnerCheck.timeLeft ?? 0);
            return coopI.reply({ 
              content: `❌ You're too tired! Come back in ${timeLeft}`, 
              flags: MessageFlags.Ephemeral 
            });
          }

          // Mine cooperatively
          const goldAmount = Math.floor(Math.random() * 3) + 4; // 4-6 gold
          const goldPerPerson = Math.floor(goldAmount / 2);
          const remainder = goldAmount % 2;

          // If there's a remainder, check if owner can pay BEFORE distributing
          let ownerGetsExtra = false;
          if (remainder === 1) {
            const ownerSilver = getUserSilver(userId);
            
            // Owner only gets extra if they have Silver to pay
            ownerGetsExtra = ownerSilver >= GOLD_VALUE;
          }

          // Distribute gold based on who can pay
          const ownerGold = goldPerPerson + (ownerGetsExtra ? 1 : 0);
          const partnerGold = goldPerPerson + (remainder === 1 && !ownerGetsExtra ? 1 : 0);
          
          const ownerResult = addItem(userId, 'gold', ownerGold);
          const partnerResult = addItem(partnerId, 'gold', partnerGold);

          let resultMessage = '';

          // If one of them can't carry, REVERT all
          if (!ownerResult.success || !partnerResult.success) {
            // Rollback: remove already added gold
            
            if (ownerResult.success) {
              removeItem(userId, 'gold', ownerGold);
            }
            if (partnerResult.success) {
              removeItem(partnerId, 'gold', partnerGold);
            }

            if (!ownerResult.success && !partnerResult.success) {
              resultMessage = `❌ Both saddlebags are too full!\n\nMining operation cancelled.`;
            } else if (!ownerResult.success) {
              resultMessage = `❌ ${interaction.user.username}'s saddlebag is too full!\n\nMining operation cancelled.`;
            } else {
              resultMessage = `❌ ${coopI.user.username}'s saddlebag is too full!\n\nMining operation cancelled.`;
            }

            return coopI.update({
              embeds: [{
                color: 0xFF0000,
                title: '⚠️ MINING FAILED',
                description: resultMessage,
                footer: { text: 'Free up space and try again!' }
              }],
              components: []
            });
          }

          // Handle odd split - REAL PAYMENT
          let compensationMessage = '';
          if (remainder === 1) {
            if (ownerGetsExtra) {
              // Owner got extra, must pay partner
              
              const ownerPayment = removeUserSilver(userId, GOLD_VALUE);
              
              if (ownerPayment.success) {
                // Pay partner
                const partnerPayment = addUserSilver(partnerId, GOLD_VALUE);
                
                if (partnerPayment.success) {
                  compensationMessage = `\n\n💰 ${interaction.user.username} paid ${coopI.user.username} **${GOLD_VALUE} ${silverEmoji} Silver Coins** for keeping the extra gold!`;
                } else {
                  // Partner can't receive Silver - transfer extra gold to them
                  addUserSilver(userId, GOLD_VALUE); // Return Silver to owner
                  
                  
                  // Remove 1 gold from owner
                  removeItem(userId, 'gold', 1);
                  
                  // Try to give to partner
                  const partnerGoldAdd = addItem(partnerId, 'gold', 1);
                  
                  if (partnerGoldAdd.success) {
                    compensationMessage = `\n\n⚠️ ${coopI.user.username}'s bag was too full for Silver, so they got the extra gold instead!`;
                  } else {
                    // Partner cannot receive compensation in any way - REVERT ALL
                    
                    // Remove all gold from both
                    removeItem(userId, 'gold', ownerGold - 1); // -1 because we already removed 1 above
                    removeItem(partnerId, 'gold', partnerGold);
                    
                    // Remove cooldowns
                    const data = getMiningData();
                    delete data[userId];
                    delete data[partnerId];
                    saveMiningData(data);
                    
                    return coopI.update({
                      embeds: [{
                        color: 0xFF0000,
                        title: '⚠️ MINING CANCELLED',
                        description: `❌ ${coopI.user.username}'s saddlebag is completely full!\n\nCannot compensate for odd split.\n\n**Mining operation cancelled** - no cooldown applied.`,
                        footer: { text: 'Partner needs to free up space!' }
                      }],
                      components: []
                    });
                  }
                }
              } else {
                // Owner doesn't have Silver (lost after check) - transfer extra gold to partner
                
                removeItem(userId, 'gold', 1);
                const partnerGoldAdd = addItem(partnerId, 'gold', 1);
                
                if (partnerGoldAdd.success) {
                  compensationMessage = `\n\n⚠️ ${interaction.user.username} lost their Silver! Extra gold went to ${coopI.user.username}.`;
                } else {
                  // Partner can't receive - REVERT ALL
                  removeItem(userId, 'gold', ownerGold - 1);
                  removeItem(partnerId, 'gold', partnerGold);
                  
                  const data = getMiningData();
                  delete data[userId];
                  delete data[partnerId];
                  saveMiningData(data);
                  
                  return coopI.update({
                    embeds: [{
                      color: 0xFF0000,
                      title: '⚠️ MINING CANCELLED',
                      description: `❌ Cannot compensate for odd split!\n\n${interaction.user.username} lacks Silver and ${coopI.user.username}'s bag is full.\n\n**Mining operation cancelled** - no cooldown applied.`,
                      footer: { text: 'Try again later!' }
                    }],
                    components: []
                  });
                }
              }
            } else {
              // Partner got extra because owner didn't have Silver
              compensationMessage = `\n\n⚠️ ${coopI.user.username} got the extra gold because ${interaction.user.username} lacks ${GOLD_VALUE} Silver Coins!`;
            }
          }

          // Apply cooldown for both
          setCooldown(userId, COOP_COOLDOWN);
          setCooldown(partnerId, COOP_COOLDOWN);
          
          // Get both users' inventories for correct maxWeight display
          const ownerInventory = getInventory(userId);
          const partnerInventory = getInventory(partnerId);
          const ownerMaxWeight = ownerInventory.maxWeight;
          const partnerMaxWeight = partnerInventory.maxWeight;

          await coopI.update({
            embeds: [{
              color: 0xFFD700,
              title: '⛏️ COOPERATIVE MINING SUCCESS!',
              description: `\`\`\`diff\n+ Found ${goldAmount} ${goldEmoji} Gold Bars!\n\`\`\``,
              fields: [
                {
                  name: `${interaction.user.username}'s Share`,
                  value: `\`${ownerGold} ${goldEmoji} Gold Bars\`\n*Weight: ${ownerResult.newWeight.toFixed(2)}kg/${ownerMaxWeight}kg*`,
                  inline: true
                },
                {
                  name: `${coopI.user.username}'s Share`,
                  value: `\`${partnerGold} ${goldEmoji} Gold Bars\`\n*Weight: ${partnerResult.newWeight.toFixed(2)}kg/${partnerMaxWeight}kg*`,
                  inline: true
                }
              ],
              footer: { text: '🤠 Great teamwork, partners! Come back in 2 hours.' },
              timestamp: new Date().toISOString()
            }],
            components: []
          });

          if (compensationMessage) {
            await coopI.followUp({ 
              content: compensationMessage
            });
          }

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
