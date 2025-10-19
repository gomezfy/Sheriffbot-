import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('middleman')
    .setDescription('📦 View the official Sheriff Bot shop'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replSlug = process.env.REPL_SLUG || 'localhost';
    const shopUrl = `https://${replSlug}.repl.co/shop.html`;

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏪 SHERIFF BOT SHOP')
      .setDescription('Welcome to the official Sheriff Bot shop!\n\nPurchase premium currency packs and exclusive items to enhance your Wild West experience!')
      .addFields(
        { 
          name: '💰 Available Packages', 
          value: 
            '**Starter Pack** - $1.99\n' +
            '• 100 🎫 Saloon Tokens\n' +
            '• 5,000 🪙 Silver Coins\n\n' +
            '**Popular Pack** - $4.99\n' +
            '• 350 🎫 Saloon Tokens\n' +
            '• 15,000 🪙 Silver Coins\n\n' +
            '**Gold Pack** - $9.99\n' +
            '• 900 🎫 Saloon Tokens\n' +
            '• 40,000 🪙 Silver Coins\n' +
            '• 🌟 VIP Status\n\n' +
            '**Ultimate Pack** - $19.99\n' +
            '• 2,500 🎫 Saloon Tokens\n' +
            '• 100,000 🪙 Silver Coins\n' +
            '• 🌟 VIP Status\n' +
            '• 🎨 Exclusive Profile Background\n\n' +
            '**Backpack Upgrade** - $9.99\n' +
            '• Upgrade carry capacity from 100kg to 500kg',
          inline: false 
        },
        { 
          name: '🔒 Secure Payment', 
          value: 'Powered by Stripe - Industry-leading payment security', 
          inline: false 
        },
        {
          name: '📝 How It Works',
          value: 
            '1. Click the button below to visit the shop\n' +
            '2. Select your desired package\n' +
            '3. Complete payment securely via Stripe\n' +
            '4. Receive your redemption code instantly\n' +
            '5. Use `/redeem <code>` to claim your purchase',
          inline: false
        }
      )
      .setFooter({ text: '🤠 Support the bot and get exclusive benefits!' })
      .setTimestamp();

    const shopButton = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🛒 Visit Shop')
          .setStyle(ButtonStyle.Link)
          .setURL(shopUrl),
        new ButtonBuilder()
          .setLabel('❓ Support')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/sheriffbot')
      );

    await interaction.reply({
      embeds: [embed],
      components: [shopButton]
    });
  },
};
