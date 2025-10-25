import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChatInputCommandInteraction, ComponentType, AttachmentBuilder ,MessageFlags} from 'discord.js';
import path from 'path';
import { getSilverCoinEmoji, getGoldBarEmoji, getSaloonTokenEmoji, getCurrencyEmoji, getBriefcaseEmoji, getCheckEmoji, getStatsEmoji, getCancelEmoji, getCowboyEmoji, getMoneybagEmoji } from '../../utils/customEmojis';
const { getInventory, removeItem } = require('../../utils/inventoryManager');
const { addUserSilver } = require('../../utils/dataManager');

const TOKEN_TO_SILVER = 50; // 1 Saloon Token = 50 Silver Coins
const GOLD_TO_SILVER = 13439; // 1 Gold Bar = 13,439 Silver Coins

module.exports = {
  data: new SlashCommandBuilder()
    .setName('middleman')
    .setDescription('Convert Saloon Tokens and Gold Bars to Silver Coins'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const inventory = getInventory(userId);
    const saloonTokens = inventory.items['saloon_token'] || 0;
    const goldBars = inventory.items['gold'] || 0;

    const shopUrl = `https://${process.env.REPLIT_DEV_DOMAIN || 'sheriff-bot.repl.co'}/shop.html`;

    const blackMarketImage = new AttachmentBuilder(path.join(process.cwd(), 'assets', 'black-market.png'));

    const tokenEmoji = getSaloonTokenEmoji();
    const silverEmoji = getSilverCoinEmoji();
    const goldEmoji = getGoldBarEmoji();
    const currencyEmoji = getCurrencyEmoji();
    const briefcaseEmoji = getBriefcaseEmoji();

    const statsEmoji = getStatsEmoji();
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`${currencyEmoji} MIDDLEMAN - CURRENCY EXCHANGE`)
      .setImage('attachment://black-market.png')
      .setDescription(`**Welcome to the Middleman, partner!**\n\nExchange your valuable items for Silver Coins at fair rates.\n\n**${statsEmoji} EXCHANGE RATES**\n${tokenEmoji} 1 Saloon Token = **50** ${silverEmoji} Silver Coins\n${goldEmoji} 1 Gold Bar = **13,439** ${silverEmoji} Silver Coins`)
      .addFields(
        {
          name: `${briefcaseEmoji} Your Inventory`,
          value: `\`\`\`yaml\nSaloon Tokens: ${saloonTokens.toLocaleString()}\nGold Bars: ${goldBars.toLocaleString()}\n\`\`\``,
          inline: false
        },
        {
          name: `${currencyEmoji} How to Exchange`,
          value: '1. Click a button below to select what to convert\n2. Choose how many items to exchange\n3. Receive Silver Coins instantly!',
          inline: false
        }
      )
      .setFooter({ text: `${getCowboyEmoji()} Fair trades guaranteed by the Sheriff!` })
      .setTimestamp();

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('convert_tokens')
          .setLabel('Tokens → Silver')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(saloonTokens === 0),
        new ButtonBuilder()
          .setCustomId('convert_gold')
          .setLabel('Gold → Silver')
          .setStyle(ButtonStyle.Success)
          .setDisabled(goldBars === 0),
        new ButtonBuilder()
          .setLabel('🛒 Visit Shop')
          .setStyle(ButtonStyle.Link)
          .setURL(shopUrl)
      );

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
      files: [blackMarketImage]
    });
    const response = await interaction.fetchReply();

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000
    });

    collector.on('collect', async (i) => {
      const cancelEmoji = getCancelEmoji();
      
      if (i.user.id !== userId) {
        return i.reply({ content: `${cancelEmoji} This exchange is not for you!`, flags: MessageFlags.Ephemeral });
      }

      if (i.customId === 'convert_tokens') {
        const currentInventory = getInventory(userId);
        const currentTokens = currentInventory.items['saloon_token'] || 0;

        if (currentTokens === 0) {
          return i.reply({ content: `${cancelEmoji} You don\'t have any Saloon Tokens to convert!`, flags: MessageFlags.Ephemeral });
        }

        const options = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Token → ${TOKEN_TO_SILVER} Silver`)
            .setValue('1')
        ];

        if (currentTokens >= 5) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Tokens → ${TOKEN_TO_SILVER * 5} Silver`)
              .setValue('5')
          );
        }

        if (currentTokens >= 10) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Tokens → ${TOKEN_TO_SILVER * 10} Silver`)
              .setValue('10')
          );
        }

        if (currentTokens >= 25) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`25 Tokens → ${TOKEN_TO_SILVER * 25} Silver`)
              .setValue('25')
          );
        }

        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`All (${currentTokens} Tokens) → ${TOKEN_TO_SILVER * currentTokens} Silver`)
            .setValue('all')
            .setEmoji(getMoneybagEmoji() || '💰')
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('token_amount')
          .setPlaceholder('Select how many Tokens to convert')
          .addOptions(...options);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**Select amount to convert:**\nYou have **${currentTokens}** ${tokenEmoji} Saloon Tokens`,
          components: [selectRow],
          flags: MessageFlags.Ephemeral
        });

        const selectCollector = i.channel?.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
          filter: (si) => si.user.id === userId && si.customId === 'token_amount'
        });

        selectCollector?.on('collect', async (si) => {
          const amount = si.values[0] === 'all' ? currentTokens : parseInt(si.values[0]);
          const finalInventory = getInventory(userId);
          const finalTokens = finalInventory.items['saloon_token'] || 0;

          const cancelEmoji = getCancelEmoji();
          
          if (finalTokens < amount) {
            return si.update({ content: `${cancelEmoji} You don't have enough Saloon Tokens! You only have ${finalTokens}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'saloon_token', amount);
          if (!removeResult.success) {
            return si.update({ content: `${cancelEmoji} Error: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * TOKEN_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${checkEmoji} EXCHANGE SUCCESSFUL!`)
            .setDescription(`You converted **${amount}** ${tokenEmoji} Saloon Tokens into **${silverAmount.toLocaleString()}** ${silverEmoji} Silver Coins!`)
            .addFields(
              { name: 'Tokens Converted', value: `${amount} ${tokenEmoji}`, inline: true },
              { name: 'Silver Received', value: `${silverAmount.toLocaleString()} ${silverEmoji}`, inline: true }
            )
            .setFooter({ text: 'Thanks for using the Middleman service!' })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });

      } else if (i.customId === 'convert_gold') {
        const currentInventory = getInventory(userId);
        const currentGold = currentInventory.items['gold'] || 0;

        if (currentGold === 0) {
          return i.reply({ content: `${cancelEmoji} You don\'t have any Gold Bars to convert!`, flags: MessageFlags.Ephemeral });
        }

        const goldOptions = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Gold Bar → ${GOLD_TO_SILVER} Silver`)
            .setValue('1')
        ];

        if (currentGold >= 5) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Gold Bars → ${GOLD_TO_SILVER * 5} Silver`)
              .setValue('5')
          );
        }

        if (currentGold >= 10) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Gold Bars → ${GOLD_TO_SILVER * 10} Silver`)
              .setValue('10')
          );
        }

        goldOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`All (${currentGold} Bars) → ${GOLD_TO_SILVER * currentGold} Silver`)
            .setValue('all')
            .setEmoji(getMoneybagEmoji() || '💰')
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('gold_amount')
          .setPlaceholder('Select how many Gold Bars to convert')
          .addOptions(...goldOptions);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**Select amount to convert:**\nYou have **${currentGold}** ${goldEmoji} Gold Bars`,
          components: [selectRow],
          flags: MessageFlags.Ephemeral
        });

        const selectCollector = i.channel?.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
          filter: (si) => si.user.id === userId && si.customId === 'gold_amount'
        });

        selectCollector?.on('collect', async (si) => {
          const amount = si.values[0] === 'all' ? currentGold : parseInt(si.values[0]);
          const finalInventory = getInventory(userId);
          const finalGold = finalInventory.items['gold'] || 0;

          const cancelEmoji = getCancelEmoji();
          
          if (finalGold < amount) {
            return si.update({ content: `${cancelEmoji} You don't have enough Gold Bars! You only have ${finalGold}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'gold', amount);
          if (!removeResult.success) {
            return si.update({ content: `${cancelEmoji} Error: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * GOLD_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${checkEmoji} EXCHANGE SUCCESSFUL!`)
            .setDescription(`You converted **${amount}** ${goldEmoji} Gold Bars into **${silverAmount.toLocaleString()}** ${silverEmoji} Silver Coins!`)
            .addFields(
              { name: 'Gold Converted', value: `${amount} ${goldEmoji}`, inline: true },
              { name: 'Silver Received', value: `${silverAmount.toLocaleString()} ${silverEmoji}`, inline: true }
            )
            .setFooter({ text: 'Thanks for using the Middleman service!' })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });
      }
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  },
};
