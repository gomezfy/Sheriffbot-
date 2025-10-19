const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { getItem, addItem, removeItem } = require('../../utils/inventoryManager');
const { t } = require('../../utils/i18n');
const path = require('path');

const TOKEN_RATE = 1000; // 1 Token = 1000 Coins
const GOLD_RATE = 700;   // 1 Gold Bar = 700 Coins

module.exports = {
  data: new SlashCommandBuilder()
    .setName('middleman')
    .setDescription('Visit the Black Market to exchange currencies'),
  async execute(interaction) {
    const userId = interaction.user.id;

    // Get user balances
    const tokens = getItem(userId, 'saloon_token');
    const coins = getItem(userId, 'silver');
    const goldBars = getItem(userId, 'gold');

    // Create image attachment
    const imagePath = path.join(__dirname, '..', '..', '..', 'assets', 'black-market.png');
    const attachment = new AttachmentBuilder(imagePath, { name: 'black-market.png' });

    const embed = new EmbedBuilder()
      .setColor('#B8860B')
      .setTitle('🎩 BLACK MARKET - MIDDLEMAN')
      .setDescription(t(interaction, 'middleman_welcome'))
      .setImage('attachment://black-market.png')
      .addFields(
        { 
          name: '💰 ' + t(interaction, 'middleman_your_balance'), 
          value: `🎫 ${tokens.toLocaleString()} Tokens\n🪙 ${coins.toLocaleString()} Silver Coins\n🥇 ${goldBars.toLocaleString()} Gold Bars`,
          inline: false
        },
        { 
          name: '💱 ' + t(interaction, 'middleman_rates'), 
          value: `📤 **${t(interaction, 'middleman_sell_tokens')}:** 1 Token → ${TOKEN_RATE.toLocaleString()} Coins\n📥 **${t(interaction, 'middleman_buy_tokens')}:** ${TOKEN_RATE.toLocaleString()} Coins → 1 Token\n🥇 **${t(interaction, 'middleman_exchange_gold')}:** 1 Gold Bar → ${GOLD_RATE.toLocaleString()} Coins`,
          inline: false
        }
      )
      .setFooter({ text: t(interaction, 'middleman_footer') })
      .setTimestamp();

    // Shop button URL
    const shopUrl = 'https://sheriffbot.discloud.app/shop.html';

    // Create buttons - Row 1: Sell and Buy Tokens
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('middleman_sell_tokens')
          .setLabel(t(interaction, 'middleman_btn_sell_tokens'))
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('middleman_buy_tokens')
          .setLabel(t(interaction, 'middleman_btn_buy_tokens'))
          .setStyle(ButtonStyle.Primary)
      );

    // Create buttons - Row 2: Exchange Gold and Shop
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('middleman_exchange_gold')
          .setLabel(t(interaction, 'middleman_btn_exchange_gold'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel(t(interaction, 'middleman_btn_shop'))
          .setEmoji('🛒')
          .setStyle(ButtonStyle.Link)
          .setURL(shopUrl)
      );

    await interaction.reply({ 
      embeds: [embed], 
      files: [attachment],
      components: [row1, row2] 
    });

    // Create collector for button interactions
    const filter = i => i.user.id === userId && (
      i.customId.startsWith('middleman_') || 
      i.customId.startsWith('sell_confirm_') || 
      i.customId.startsWith('buy_confirm_') || 
      i.customId.startsWith('gold_confirm_')
    );
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'middleman_sell_tokens') {
        await handleSellTokens(i, userId);
      } else if (i.customId === 'middleman_buy_tokens') {
        await handleBuyTokens(i, userId);
      } else if (i.customId === 'middleman_exchange_gold') {
        await handleExchangeGold(i, userId);
      } else if (i.customId.startsWith('sell_confirm_')) {
        await executeSellTokens(i, userId);
      } else if (i.customId.startsWith('buy_confirm_')) {
        await executeBuyTokens(i, userId);
      } else if (i.customId.startsWith('gold_confirm_')) {
        await executeExchangeGold(i, userId);
      } else if (i.customId === 'middleman_cancel') {
        await i.update({ 
          content: t(i, 'middleman_cancelled'),
          embeds: [], 
          components: [],
          files: []
        });
        collector.stop();
      }
    });

    collector.on('end', () => {
      // Optionally disable buttons after timeout
    });
  },
};

// Handler: Sell Tokens for Coins
async function handleSellTokens(interaction, userId) {
  const tokens = getItem(userId, 'saloon_token');

  if (tokens === 0) {
    return interaction.followUp({ 
      content: t(interaction, 'middleman_no_tokens'), 
      ephemeral: true 
    });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sell_confirm_1')
        .setLabel(`1 Token → ${TOKEN_RATE} Coins`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('sell_confirm_10')
        .setLabel(`10 Tokens → ${TOKEN_RATE * 10} Coins`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(tokens < 10),
      new ButtonBuilder()
        .setCustomId('sell_confirm_all')
        .setLabel(t(interaction, 'middleman_all') + ` (${tokens})`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('middleman_cancel')
        .setLabel(t(interaction, 'middleman_cancel'))
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({
    content: t(interaction, 'middleman_sell_how_many'),
    embeds: [],
    components: [row],
    files: []
  });
}

// Handler: Buy Tokens with Coins
async function handleBuyTokens(interaction, userId) {
  const coins = getItem(userId, 'silver');

  if (coins < TOKEN_RATE) {
    return interaction.followUp({ 
      content: t(interaction, 'middleman_no_coins', { amount: TOKEN_RATE.toLocaleString() }), 
      ephemeral: true 
    });
  }

  const maxTokens = Math.floor(coins / TOKEN_RATE);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('buy_confirm_1')
        .setLabel(`${TOKEN_RATE} Coins → 1 Token`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('buy_confirm_10')
        .setLabel(`${TOKEN_RATE * 10} Coins → 10 Tokens`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(maxTokens < 10),
      new ButtonBuilder()
        .setCustomId(`buy_confirm_all`)
        .setLabel(t(interaction, 'middleman_all') + ` (${maxTokens})`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('middleman_cancel')
        .setLabel(t(interaction, 'middleman_cancel'))
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({
    content: t(interaction, 'middleman_buy_how_many'),
    embeds: [],
    components: [row],
    files: []
  });
}

// Handler: Exchange Gold for Coins
async function handleExchangeGold(interaction, userId) {
  const goldBars = getItem(userId, 'gold');

  if (goldBars === 0) {
    return interaction.followUp({ 
      content: t(interaction, 'middleman_no_gold'), 
      ephemeral: true 
    });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('gold_confirm_1')
        .setLabel(`1 Gold Bar → ${GOLD_RATE} Coins`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('gold_confirm_10')
        .setLabel(`10 Gold Bars → ${GOLD_RATE * 10} Coins`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(goldBars < 10),
      new ButtonBuilder()
        .setCustomId('gold_confirm_all')
        .setLabel(t(interaction, 'middleman_all') + ` (${goldBars})`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('middleman_cancel')
        .setLabel(t(interaction, 'middleman_cancel'))
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({
    content: t(interaction, 'middleman_gold_how_many'),
    embeds: [],
    components: [row],
    files: []
  });
}

// Execute: Sell Tokens
async function executeSellTokens(interaction, userId) {
  await interaction.deferUpdate();
  
  const amount = interaction.customId === 'sell_confirm_all' 
    ? getItem(userId, 'saloon_token')
    : parseInt(interaction.customId.split('_')[2]);

  const tokens = getItem(userId, 'saloon_token');

  if (tokens < amount) {
    return interaction.editReply({ 
      content: t(interaction, 'middleman_insufficient_tokens'),
      components: [],
      embeds: [],
      files: []
    });
  }

  const coinsToReceive = amount * TOKEN_RATE;
  const coinsWeight = coinsToReceive * 0.0001;

  const removeResult = removeItem(userId, 'saloon_token', amount);
  const addResult = addItem(userId, 'silver', coinsToReceive);

  if (!addResult.success) {
    addItem(userId, 'saloon_token', amount);
    return interaction.editReply({ 
      content: t(interaction, 'saloon_inventory_full', { weight: coinsWeight.toFixed(2) }),
      components: [],
      embeds: [],
      files: []
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ ' + t(interaction, 'middleman_transaction_complete'))
    .setDescription(t(interaction, 'middleman_sold_tokens', { 
      tokens: amount.toLocaleString(),
      coins: coinsToReceive.toLocaleString()
    }))
    .addFields(
      { name: '🎫 ' + t(interaction, 'saloon_token_balance'), value: `${removeResult.remainingQuantity.toLocaleString()} Tokens`, inline: true },
      { name: '🪙 ' + t(interaction, 'saloon_coin_balance'), value: `${addResult.totalQuantity.toLocaleString()} Coins`, inline: true },
      { name: '⚖️ ' + t(interaction, 'weight'), value: `+${coinsWeight.toFixed(2)}kg`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: null, embeds: [embed], components: [], files: [] });
}

// Execute: Buy Tokens
async function executeBuyTokens(interaction, userId) {
  await interaction.deferUpdate();
  
  const amount = interaction.customId === 'buy_confirm_all'
    ? Math.floor(getItem(userId, 'silver') / TOKEN_RATE)
    : parseInt(interaction.customId.split('_')[2]);

  const coinsNeeded = amount * TOKEN_RATE;
  const coins = getItem(userId, 'silver');

  if (coins < coinsNeeded) {
    return interaction.editReply({ 
      content: t(interaction, 'middleman_insufficient_coins'),
      components: [],
      embeds: [],
      files: []
    });
  }

  const tokensWeight = amount * 0.00001;

  const removeResult = removeItem(userId, 'silver', coinsNeeded);
  const addResult = addItem(userId, 'saloon_token', amount);

  if (!addResult.success) {
    addItem(userId, 'silver', coinsNeeded);
    return interaction.editReply({ 
      content: t(interaction, 'middleman_inventory_full_tokens', { weight: tokensWeight.toFixed(5) }),
      components: [],
      embeds: [],
      files: []
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#0099FF')
    .setTitle('✅ ' + t(interaction, 'middleman_transaction_complete'))
    .setDescription(t(interaction, 'middleman_bought_tokens', { 
      coins: coinsNeeded.toLocaleString(),
      tokens: amount.toLocaleString()
    }))
    .addFields(
      { name: '🪙 ' + t(interaction, 'saloon_coin_balance'), value: `${removeResult.remainingQuantity.toLocaleString()} Coins`, inline: true },
      { name: '🎫 ' + t(interaction, 'saloon_token_balance'), value: `${addResult.totalQuantity.toLocaleString()} Tokens`, inline: true },
      { name: '⚖️ ' + t(interaction, 'weight'), value: `+${tokensWeight.toFixed(5)}kg`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: null, embeds: [embed], components: [], files: [] });
}

// Execute: Exchange Gold
async function executeExchangeGold(interaction, userId) {
  await interaction.deferUpdate();
  
  const amount = interaction.customId === 'gold_confirm_all'
    ? getItem(userId, 'gold')
    : parseInt(interaction.customId.split('_')[2]);

  const goldBars = getItem(userId, 'gold');

  if (goldBars < amount) {
    return interaction.editReply({ 
      content: t(interaction, 'middleman_insufficient_gold'),
      components: [],
      embeds: [],
      files: []
    });
  }

  const coinsToReceive = amount * GOLD_RATE;
  const coinsWeight = coinsToReceive * 0.0001;

  const removeResult = removeItem(userId, 'gold', amount);
  const addResult = addItem(userId, 'silver', coinsToReceive);

  if (!addResult.success) {
    addItem(userId, 'gold', amount);
    return interaction.editReply({ 
      content: t(interaction, 'saloon_inventory_full', { weight: coinsWeight.toFixed(2) }),
      components: [],
      embeds: [],
      files: []
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('✅ ' + t(interaction, 'middleman_transaction_complete'))
    .setDescription(t(interaction, 'middleman_exchanged_gold', { 
      gold: amount.toLocaleString(),
      coins: coinsToReceive.toLocaleString()
    }))
    .addFields(
      { name: '🥇 ' + t(interaction, 'middleman_gold_balance'), value: `${removeResult.remainingQuantity.toLocaleString()} Gold Bars`, inline: true },
      { name: '🪙 ' + t(interaction, 'saloon_coin_balance'), value: `${addResult.totalQuantity.toLocaleString()} Coins`, inline: true },
      { name: '⚖️ ' + t(interaction, 'weight'), value: `+${coinsWeight.toFixed(2)}kg`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: null, embeds: [embed], components: [], files: [] });
}
