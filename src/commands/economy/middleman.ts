import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChatInputCommandInteraction, ComponentType, AttachmentBuilder ,MessageFlags} from 'discord.js';
import path from 'path';
import { getSilverCoinEmoji, getGoldBarEmoji, getSaloonTokenEmoji, getCurrencyEmoji, getBriefcaseEmoji, getCheckEmoji, getStatsEmoji, getCancelEmoji, getCowboyEmoji, getMoneybagEmoji } from '../../utils/customEmojis';
import { t, getLocale } from '../../utils/i18n';
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
    const locale = getLocale(interaction);
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
      .setTitle(`${currencyEmoji} ${t(interaction, 'middleman_title')}`)
      .setImage('attachment://black-market.png')
      .setDescription(`**${t(interaction, 'middleman_welcome')}**\n\n${t(interaction, 'middleman_description')}\n\n**${statsEmoji} ${t(interaction, 'middleman_exchange_rates')}**\n${tokenEmoji} 1 ${locale === 'pt-BR' ? 'Ficha Saloon' : 'Saloon Token'} = **50** ${silverEmoji} ${t(interaction, 'silver_coins')}\n${goldEmoji} 1 ${locale === 'pt-BR' ? 'Barra de Ouro' : 'Gold Bar'} = **13,439** ${silverEmoji} ${t(interaction, 'silver_coins')}`)
      .addFields(
        {
          name: `${briefcaseEmoji} ${t(interaction, 'middleman_your_inventory')}`,
          value: `\`\`\`yaml\n${t(interaction, 'middleman_saloon_tokens')}: ${saloonTokens.toLocaleString()}\n${t(interaction, 'middleman_gold_bars')}: ${goldBars.toLocaleString()}\n\`\`\``,
          inline: false
        },
        {
          name: `${currencyEmoji} ${t(interaction, 'middleman_how_to_exchange')}`,
          value: `${t(interaction, 'middleman_step1')}\n${t(interaction, 'middleman_step2')}\n${t(interaction, 'middleman_step3')}`,
          inline: false
        }
      )
      .setFooter({ text: `🤠 ${t(interaction, 'middleman_fair_trades')}` })
      .setTimestamp();

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('convert_tokens')
          .setLabel(t(interaction, 'middleman_tokens_to_silver'))
          .setStyle(ButtonStyle.Primary)
          .setDisabled(saloonTokens === 0),
        new ButtonBuilder()
          .setCustomId('convert_gold')
          .setLabel(t(interaction, 'middleman_gold_to_silver'))
          .setStyle(ButtonStyle.Success)
          .setDisabled(goldBars === 0),
        new ButtonBuilder()
          .setLabel(`🛒 ${t(interaction, 'middleman_visit_shop')}`)
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
      const locale = getLocale(i);
      
      if (i.user.id !== userId) {
        return i.reply({ content: `${cancelEmoji} ${t(i, 'middleman_not_for_you')}`, flags: MessageFlags.Ephemeral });
      }

      if (i.customId === 'convert_tokens') {
        const currentInventory = getInventory(userId);
        const currentTokens = currentInventory.items['saloon_token'] || 0;

        if (currentTokens === 0) {
          return i.reply({ content: `${cancelEmoji} ${t(i, 'middleman_no_tokens')}`, flags: MessageFlags.Ephemeral });
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
          .setPlaceholder(t(i, 'middleman_select_tokens'))
          .addOptions(...options);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**${t(i, 'middleman_select_amount')}**\n${t(i, 'middleman_you_have_tokens')} **${currentTokens}** ${tokenEmoji} ${locale === 'pt-BR' ? t(i, 'middleman_tokens') : 'Saloon Tokens'}`,
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
          const locale = getLocale(si);
          
          if (finalTokens < amount) {
            return si.update({ content: `${cancelEmoji} ${t(si, 'middleman_not_enough_tokens')} ${finalTokens}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'saloon_token', amount);
          if (!removeResult.success) {
            return si.update({ content: `${cancelEmoji} ${t(si, 'middleman_error')}: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * TOKEN_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${checkEmoji} ${t(si, 'middleman_success_title')}`)
            .setDescription(`${t(si, 'middleman_converted_tokens')} **${amount}** ${tokenEmoji} ${locale === 'pt-BR' ? (amount === 1 ? t(si, 'middleman_token') : t(si, 'middleman_tokens')) : 'Saloon Token' + (amount > 1 ? 's' : '')} ${t(si, 'middleman_into')} **${silverAmount.toLocaleString()}** ${silverEmoji} ${t(si, 'silver_coins')}!`)
            .addFields(
              { name: t(si, 'middleman_tokens_converted'), value: `${amount} ${tokenEmoji}`, inline: true },
              { name: t(si, 'middleman_silver_received'), value: `${silverAmount.toLocaleString()} ${silverEmoji}`, inline: true }
            )
            .setFooter({ text: t(si, 'middleman_thanks') })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });

      } else if (i.customId === 'convert_gold') {
        const currentInventory = getInventory(userId);
        const currentGold = currentInventory.items['gold'] || 0;

        if (currentGold === 0) {
          return i.reply({ content: `${cancelEmoji} ${t(i, 'middleman_no_gold')}`, flags: MessageFlags.Ephemeral });
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
          .setPlaceholder(t(i, 'middleman_select_gold'))
          .addOptions(...goldOptions);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await i.reply({
          content: `**${t(i, 'middleman_select_amount')}**\n${t(i, 'middleman_you_have_gold')} **${currentGold}** ${goldEmoji} ${locale === 'pt-BR' ? (currentGold === 1 ? t(i, 'middleman_bar') : t(i, 'middleman_bars')) : 'Gold Bar' + (currentGold > 1 ? 's' : '')}`,
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
          const locale = getLocale(si);
          
          if (finalGold < amount) {
            return si.update({ content: `${cancelEmoji} ${t(si, 'middleman_not_enough_gold')} ${finalGold}.`, components: [] });
          }

          const removeResult = removeItem(userId, 'gold', amount);
          if (!removeResult.success) {
            return si.update({ content: `${cancelEmoji} ${t(si, 'middleman_error')}: ${removeResult.error}`, components: [] });
          }

          const silverAmount = amount * GOLD_TO_SILVER;
          addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${checkEmoji} ${t(si, 'middleman_success_title')}`)
            .setDescription(`${t(si, 'middleman_converted_gold')} **${amount}** ${goldEmoji} ${locale === 'pt-BR' ? (amount === 1 ? t(si, 'middleman_bar') : t(si, 'middleman_bars')) + ' de Ouro' : 'Gold Bar' + (amount > 1 ? 's' : '')} ${t(si, 'middleman_into')} **${silverAmount.toLocaleString()}** ${silverEmoji} ${t(si, 'silver_coins')}!`)
            .addFields(
              { name: t(si, 'middleman_gold_converted'), value: `${amount} ${goldEmoji}`, inline: true },
              { name: t(si, 'middleman_silver_received'), value: `${silverAmount.toLocaleString()} ${silverEmoji}`, inline: true }
            )
            .setFooter({ text: t(si, 'middleman_thanks') })
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
