import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  MessageFlags
} from 'discord.js';
import {
  TERRITORIES,
  getTerritory,
  getUserTerritories,
  ownsTerritory,
  purchaseTerritory,
  getTerritoryCount
} from '../../utils/territoryManager';
import { getSilverCoinEmoji } from '../../utils/customEmojis';
const { getUserSilver, removeUserSilver } = require('../../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('territories')
    .setDescription('🏛️ Browse and purchase valuable territories in the Wild West'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    let currentIndex = 0;

    const silverEmoji = getSilverCoinEmoji();

    // Function to create embed for current territory
    const createTerritoryEmbed = (index: number) => {
      // Always fetch fresh data
      const userSilver = getUserSilver(userId);
      const ownedTerritories = getUserTerritories(userId);
      const territory = TERRITORIES[index];
      const owned = ownsTerritory(userId, territory.id);

      const embed = new EmbedBuilder()
        .setColor(territory.color)
        .setTitle(`${territory.emoji} ${territory.name.toUpperCase()}`)
        .setDescription(territory.description)
        .addFields(
          {
            name: '💰 Price',
            value: `${territory.price.toLocaleString()} ${silverEmoji} Silver Coins`,
            inline: true
          },
          {
            name: '🎯 Rarity',
            value: territory.rarity.charAt(0).toUpperCase() + territory.rarity.slice(1),
            inline: true
          },
          {
            name: '📊 Status',
            value: owned ? '✅ **OWNED**' : userSilver >= territory.price ? '🟢 **Available**' : '🔴 **Insufficient Funds**',
            inline: true
          },
          {
            name: '🎁 Benefits',
            value: territory.benefits.map(b => `• ${b}`).join('\n'),
            inline: false
          }
        )
        .setFooter({
          text: `Territory ${index + 1} of ${TERRITORIES.length} • You own ${ownedTerritories.length}/${TERRITORIES.length} territories`
        })
        .setTimestamp();

      // Add image if available
      if (territory.image) {
        embed.setImage(territory.image);
      }

      return embed;
    };

    // Function to create navigation buttons
    const createButtons = (index: number) => {
      // Always fetch fresh data
      const userSilver = getUserSilver(userId);
      const ownedTerritories = getUserTerritories(userId);
      const territory = TERRITORIES[index];
      const owned = ownsTerritory(userId, territory.id);
      const canAfford = userSilver >= territory.price;

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId('purchase')
          .setLabel(owned ? '✅ Owned' : `💰 Buy for ${(territory.price / 1000).toFixed(0)}k`)
          .setStyle(owned ? ButtonStyle.Success : canAfford ? ButtonStyle.Primary : ButtonStyle.Danger)
          .setDisabled(owned || !canAfford),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === TERRITORIES.length - 1)
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('my_territories')
          .setLabel('📋 My Territories')
          .setStyle(ButtonStyle.Success)
          .setDisabled(ownedTerritories.length === 0),
        new ButtonBuilder()
          .setCustomId('close')
          .setLabel('❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

      return [row1, row2];
    };

    // Send initial message
    const initialEmbed = createTerritoryEmbed(currentIndex);
    const initialButtons = createButtons(currentIndex);

    const response = await interaction.reply({
      embeds: [initialEmbed],
      components: initialButtons
    });

    // Create collector
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (i) => {
      // Only allow the command user to interact
      if (i.user.id !== userId) {
        return i.reply({
          content: '❌ This territory browser is not for you!',
          flags: MessageFlags.Ephemeral
        });
      }

      if (i.customId === 'prev') {
        currentIndex = Math.max(0, currentIndex - 1);
        await i.update({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex)
        });

      } else if (i.customId === 'next') {
        currentIndex = Math.min(TERRITORIES.length - 1, currentIndex + 1);
        await i.update({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex)
        });

      } else if (i.customId === 'purchase') {
        const territory = TERRITORIES[currentIndex];
        const currentSilver = getUserSilver(userId);

        // Double-check affordability
        if (currentSilver < territory.price) {
          return i.reply({
            content: `❌ You need ${(territory.price - currentSilver).toLocaleString()} ${silverEmoji} more Silver Coins to purchase this territory!`,
            flags: MessageFlags.Ephemeral
          });
        }

        // Double-check ownership
        if (ownsTerritory(userId, territory.id)) {
          return i.reply({
            content: '❌ You already own this territory!',
            flags: MessageFlags.Ephemeral
          });
        }

        // Process purchase
        const removed = removeUserSilver(userId, territory.price);
        if (!removed) {
          return i.reply({
            content: '❌ Transaction failed! Please try again.',
            flags: MessageFlags.Ephemeral
          });
        }

        const success = purchaseTerritory(userId, territory.id, territory.price);
        if (!success) {
          // Refund if purchase failed
          const { addUserSilver } = require('../../utils/dataManager');
          addUserSilver(userId, territory.price);
          return i.reply({
            content: '❌ Purchase failed! Your silver has been refunded.',
            flags: MessageFlags.Ephemeral
          });
        }

        // Success!
        const successEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 TERRITORY PURCHASED!')
          .setDescription(`Congratulations! You are now the proud owner of **${territory.emoji} ${territory.name}**!`)
          .addFields(
            {
              name: '💰 Amount Paid',
              value: `${territory.price.toLocaleString()} ${silverEmoji} Silver Coins`,
              inline: true
            },
            {
              name: '💵 Remaining Balance',
              value: `${(currentSilver - territory.price).toLocaleString()} ${silverEmoji}`,
              inline: true
            },
            {
              name: '🎁 Benefits Unlocked',
              value: territory.benefits.map(b => `• ${b}`).join('\n'),
              inline: false
            }
          )
          .setFooter({ text: `You now own ${getTerritoryCount(userId)} territories!` })
          .setTimestamp();

        await i.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });

        // Update the main message
        await interaction.editReply({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex)
        });

      } else if (i.customId === 'my_territories') {
        const owned = getUserTerritories(userId);
        const territoriesInfo = owned
          .map(id => {
            const t = getTerritory(id);
            return t ? `${t.emoji} **${t.name}** - ${t.rarity}` : null;
          })
          .filter(Boolean)
          .join('\n');

        const myTerritoriesEmbed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('🏛️ YOUR TERRITORIES')
          .setDescription(territoriesInfo || 'You don\'t own any territories yet.')
          .addFields({
            name: '📊 Statistics',
            value: `**Owned:** ${owned.length}/${TERRITORIES.length}\n**Completion:** ${Math.round((owned.length / TERRITORIES.length) * 100)}%`,
            inline: false
          })
          .setFooter({ text: 'Keep expanding your empire!' })
          .setTimestamp();

        await i.reply({ embeds: [myTerritoriesEmbed], flags: MessageFlags.Ephemeral });

      } else if (i.customId === 'close') {
        await i.update({
          content: '🤠 Territory browser closed. Come back anytime, partner!',
          embeds: [],
          components: []
        });
        collector.stop();
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          components: []
        }).catch(() => {});
      }
    });
  }
};
