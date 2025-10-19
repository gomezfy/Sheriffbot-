import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChatInputCommandInteraction, ComponentType, AttachmentBuilder } from 'discord.js';
import path from 'path';
const { getInventory, removeItem } = require('../../utils/inventoryManager');
const { addUserSilver } = require('../../utils/dataManager');

const TOKEN_TO_SILVER = 50; // 1 Saloon Token = 50 Silver Coins
const GOLD_TO_SILVER = 700; // 1 Gold Bar = 700 Silver Coins

module.exports = {
  data: new SlashCommandBuilder()
    .setName('middleman')
    .setDescription('💱 Convert Saloon Tokens and Gold Bars to Silver Coins'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const inventory = getInventory(userId);
    const saloonTokens = inventory.items['saloon_token'] || 0;
    const goldBars = inventory.items['gold'] || 0;

    const shopUrl = `https://${process.env.REPLIT_DEV_DOMAIN || 'sheriff-bot.repl.co'}/shop.html`;

    const blackMarketImage = new AttachmentBuilder(path.join(__dirname, '..', '..', '..', 'assets', 'black-market.png'));

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('💱 MIDDLEMAN - CURRENCY EXCHANGE')
      .setImage('attachment://black-market.png')
      .setDescription('**Welcome to the Middleman, partner!**\n\nExchange your valuable items for Silver Coins at fair rates.\n\n**📊 EXCHANGE RATES**\n🎫 1 Saloon Token = **50** 🪙 Silver Coins\n🥇 1 Gold Bar = **700** 🪙 Silver Coins')
      .addFields(
        {
          name: '💼 Your Inventory',
          value: `\`\`\`yaml\n🎫 Saloon Tokens: ${saloonTokens.toLocaleString()}\n🥇 Gold Bars: ${goldBars.toLocaleString()}\n\`\`\``,
          inline: false
        },
        {
          name: '💱 How to Exchange',
          value: '1. Click a button below to select what to convert\n2. Choose how many items to exchange\n3. Receive Silver Coins instantly!',
          inline: false
        }
      )
      .setFooter({ text: '🤠 Fair trades guaranteed by the Sheriff!' })
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

    const response = await interaction.reply({
      embeds: [embed],
      components: [buttons],
      files: [blackMarketImage],
      fetchReply: true
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ This exchange is not for you!', ephemeral: true });
      }

      if (i.customId === 'convert_tokens') {
        const currentInventory = getInventory(userId);
        const currentTokens = currentInventory.items['saloon_token'] || 0;

        if (currentTokens === 0) {
          return i.reply({ content: '❌ You don\'t have any Saloon Tokens to convert!', ephemeral: true });
        }

        const options = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Token → ${TOKEN_TO_SILVER} Silver`)
            .setValue('1')
            .setEmoji('🎫')
        ];

        if (currentTokens >= 5) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Tokens → ${TOKEN_TO_SILVER * 5} Silver`)
              .setValue('5')
              .setEmoji('🎫')
          );
        }

        if (currentTokens >= 10) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Tokens → ${TOKEN_TO_SILVER * 10} Silver`)
              .setValue('10')
              .setEmoji('🎫')
          );
        }

        if (currentTokens >= 25) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`25 Tokens → ${TOKEN_TO_SILVER * 25} Silver`)
              .setValue('25')
              .setEmoji('🎫')
          );
        }

        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`All (${currentTokens} Tokens) → ${TOKEN_TO_SILVER * currentTokens} Silver`)
            .setValue('all')
            .setEmoji('💰')
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('token_amount')
          .setPlaceholder('Select how many Tokens to convert')
          .addOptions(...options);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**Select amount to convert:**\nYou have **${currentTokens}** 🎫 Saloon Tokens`,
          components: [selectRow],
          ephemeral: true
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

          if (finalTokens < amount) {
            return si.update({ content: `❌ You don't have enough Saloon Tokens! You only have ${finalTokens}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'saloon_token', amount);
          if (!removeResult.success) {
            return si.update({ content: `❌ Error: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * TOKEN_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ EXCHANGE SUCCESSFUL!')
            .setDescription(`You converted **${amount}** 🎫 Saloon Tokens into **${silverAmount.toLocaleString()}** 🪙 Silver Coins!`)
            .addFields(
              { name: 'Tokens Converted', value: `${amount} 🎫`, inline: true },
              { name: 'Silver Received', value: `${silverAmount.toLocaleString()} 🪙`, inline: true }
            )
            .setFooter({ text: 'Thanks for using the Middleman service!' })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });

      } else if (i.customId === 'convert_gold') {
        const currentInventory = getInventory(userId);
        const currentGold = currentInventory.items['gold'] || 0;

        if (currentGold === 0) {
          return i.reply({ content: '❌ You don\'t have any Gold Bars to convert!', ephemeral: true });
        }

        const goldOptions = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Gold Bar → ${GOLD_TO_SILVER} Silver`)
            .setValue('1')
            .setEmoji('🥇')
        ];

        if (currentGold >= 5) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Gold Bars → ${GOLD_TO_SILVER * 5} Silver`)
              .setValue('5')
              .setEmoji('🥇')
          );
        }

        if (currentGold >= 10) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Gold Bars → ${GOLD_TO_SILVER * 10} Silver`)
              .setValue('10')
              .setEmoji('🥇')
          );
        }

        goldOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`All (${currentGold} Bars) → ${GOLD_TO_SILVER * currentGold} Silver`)
            .setValue('all')
            .setEmoji('💰')
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('gold_amount')
          .setPlaceholder('Select how many Gold Bars to convert')
          .addOptions(...goldOptions);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**Select amount to convert:**\nYou have **${currentGold}** 🥇 Gold Bars`,
          components: [selectRow],
          ephemeral: true
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

          if (finalGold < amount) {
            return si.update({ content: `❌ You don't have enough Gold Bars! You only have ${finalGold}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'gold', amount);
          if (!removeResult.success) {
            return si.update({ content: `❌ Error: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * GOLD_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ EXCHANGE SUCCESSFUL!')
            .setDescription(`You converted **${amount}** 🥇 Gold Bars into **${silverAmount.toLocaleString()}** 🪙 Silver Coins!`)
            .addFields(
              { name: 'Gold Converted', value: `${amount} 🥇`, inline: true },
              { name: 'Silver Received', value: `${silverAmount.toLocaleString()} 🪙`, inline: true }
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
