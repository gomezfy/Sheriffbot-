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
import { 
  getSilverCoinEmoji, 
  getMoneybagEmoji, 
  getDartEmoji, 
  getStatsEmoji,
  getCheckEmoji,
  getCancelEmoji,
  getGreenCircle,
  getRedCircle,
  getGiftEmoji,
  getClipboardEmoji,
  getPartyEmoji,
  getBuildingEmoji
} from '../../utils/customEmojis';
import { t } from '../../utils/i18n';
import { applyLocalizations } from '../../utils/commandLocalizations';
const { getUserSilver, removeUserSilver } = require('../../utils/dataManager');

module.exports = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('territories')
      .setDescription('🏛️ Browse and purchase valuable territories in the Wild West'),
    'territories'
  ),

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
            name: `${getMoneybagEmoji()} ${t(interaction, 'territories_price')}`,
            value: `${territory.price.toLocaleString()} ${silverEmoji} ${t(interaction, 'silver_coins')}`,
            inline: true
          },
          {
            name: `${getDartEmoji()} ${t(interaction, 'territories_rarity')}`,
            value: territory.rarity.charAt(0).toUpperCase() + territory.rarity.slice(1),
            inline: true
          },
          {
            name: `${getStatsEmoji()} ${t(interaction, 'territories_status')}`,
            value: owned ? `${getCheckEmoji()} **${t(interaction, 'territories_owned')}**` : userSilver >= territory.price ? `${getGreenCircle()} **${t(interaction, 'territories_available')}**` : `${getRedCircle()} **${t(interaction, 'territories_insufficient')}**`,
            inline: true
          },
          {
            name: `${getGiftEmoji()} ${t(interaction, 'territories_benefits')}`,
            value: territory.benefits.map(b => `• ${b}`).join('\n'),
            inline: false
          }
        )
        .setFooter({
          text: t(interaction, 'territories_footer', { current: index + 1, total: TERRITORIES.length, owned: ownedTerritories.length })
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
          .setLabel(t(interaction, 'territories_prev'))
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId('purchase')
          .setLabel(owned ? t(interaction, 'territories_owned') : t(interaction, 'territories_buy', { price: (territory.price / 1000).toFixed(0) }))
          .setStyle(owned ? ButtonStyle.Success : canAfford ? ButtonStyle.Primary : ButtonStyle.Danger)
          .setDisabled(owned || !canAfford),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel(t(interaction, 'territories_next'))
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === TERRITORIES.length - 1)
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('my_territories')
          .setLabel(t(interaction, 'territories_my_territories'))
          .setStyle(ButtonStyle.Success)
          .setDisabled(ownedTerritories.length === 0),
        new ButtonBuilder()
          .setCustomId('close')
          .setLabel(t(interaction, 'territories_close'))
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
          content: `${getCancelEmoji()} ${t(interaction, 'territories_not_yours')}`,
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
            content: `${getCancelEmoji()} ${t(interaction, 'territories_need_more', { amount: (territory.price - currentSilver).toLocaleString() })} ${silverEmoji}`,
            flags: MessageFlags.Ephemeral
          });
        }

        // Double-check ownership
        if (ownsTerritory(userId, territory.id)) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(interaction, 'territories_already_own')}`,
            flags: MessageFlags.Ephemeral
          });
        }

        // Process purchase
        const removed = removeUserSilver(userId, territory.price);
        if (!removed) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(interaction, 'territories_transaction_failed')}`,
            flags: MessageFlags.Ephemeral
          });
        }

        const success = purchaseTerritory(userId, territory.id, territory.price);
        if (!success) {
          // Refund if purchase failed
          const { addUserSilver } = require('../../utils/dataManager');
          addUserSilver(userId, territory.price);
          return i.reply({
            content: `${getCancelEmoji()} ${t(interaction, 'territories_purchase_failed')}`,
            flags: MessageFlags.Ephemeral
          });
        }

        // Success!
        const successEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle(`${getPartyEmoji()} ${t(interaction, 'territories_purchased_title')}`)
          .setDescription(t(interaction, 'territories_purchased_desc', { name: `${territory.emoji} ${territory.name}` }))
          .addFields(
            {
              name: `${getMoneybagEmoji()} ${t(interaction, 'territories_amount_paid')}`,
              value: `${territory.price.toLocaleString()} ${silverEmoji} ${t(interaction, 'silver_coins')}`,
              inline: true
            },
            {
              name: `${getMoneybagEmoji()} ${t(interaction, 'territories_remaining_balance')}`,
              value: `${(currentSilver - territory.price).toLocaleString()} ${silverEmoji}`,
              inline: true
            },
            {
              name: `${getGiftEmoji()} ${t(interaction, 'territories_benefits_unlocked')}`,
              value: territory.benefits.map(b => `• ${b}`).join('\n'),
              inline: false
            }
          )
          .setFooter({ text: t(interaction, 'territories_now_own', { count: getTerritoryCount(userId) }) })
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
            const terr = getTerritory(id);
            return terr ? `${terr.emoji} **${terr.name}** - ${terr.rarity}` : null;
          })
          .filter(Boolean)
          .join('\n');

        const myTerritoriesEmbed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle(`${getBuildingEmoji()} ${t(interaction, 'territories_my_title')}`)
          .setDescription(territoriesInfo || t(interaction, 'territories_no_territories'))
          .addFields({
            name: `${getStatsEmoji()} ${t(interaction, 'territories_statistics')}`,
            value: t(interaction, 'territories_owned_count', { owned: owned.length, total: TERRITORIES.length, percentage: Math.round((owned.length / TERRITORIES.length) * 100) }),
            inline: false
          })
          .setFooter({ text: t(interaction, 'territories_keep_expanding') })
          .setTimestamp();

        await i.reply({ embeds: [myTerritoriesEmbed], flags: MessageFlags.Ephemeral });

      } else if (i.customId === 'close') {
        await i.update({
          content: t(interaction, 'territories_browser_closed'),
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
