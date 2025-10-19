import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#D2B48C')
      .setTitle('🤠 SHERIFF BOT - COMMAND GUIDE')
      .setDescription('Here are all the commands available in the frontier, partner!')
      .addFields(
        {
          name: '💰 **ECONOMY COMMANDS**',
          value: '```\n' +
                 '/daily - Claim your daily Silver Coins reward\n' +
                 '/claim - Claim special rewards\n' +
                 '/inventory - Check your saddlebag inventory\n' +
                 '/give - Give Silver Coins or items to another player\n' +
                 '```',
          inline: false
        },
        {
          name: '⛏️ **MINING & WORK**',
          value: '```\n' +
                 '/mine - Mine for gold in the mountains\n' +
                 '  • Solo Mining: 50min cooldown, 1-3 Gold Bars\n' +
                 '  • Cooperative Mining: 2h cooldown, 4-6 Gold Bars (split)\n' +
                 '```',
          inline: false
        },
        {
          name: '🎲 **GAME COMMANDS**',
          value: '```\n' +
                 '/dice - Challenge a player to a dice duel\n' +
                 '/poker - Play a game of poker\n' +
                 '/casino - Visit the casino and try your luck\n' +
                 '/bankrob - Plan a bank robbery with a partner\n' +
                 '```',
          inline: false
        },
        {
          name: '🔫 **BOUNTY & WANTED COMMANDS**',
          value: '```\n' +
                 '/wanted - Check who\'s wanted in town\n' +
                 '/bounties - View active bounties\n' +
                 '/clearbounty - Clear a bounty (admin only)\n' +
                 '```',
          inline: false
        },
        {
          name: '👤 **PROFILE & INFO COMMANDS**',
          value: '```\n' +
                 '/perfil - View your or another user\'s profile\n' +
                 '/avatar - Display a user\'s avatar\n' +
                 '/servidor - View server information\n' +
                 '/ping - Check bot latency\n' +
                 '```',
          inline: false
        },
        {
          name: '⚙️ **ADMIN COMMANDS**',
          value: '```\n' +
                 '/setwelcome - Configure welcome messages for new members\n' +
                 '/addgold - Add Gold Bars to a user\n' +
                 '/removegold - Remove Gold Bars from a user\n' +
                 '/addsilver - Add Silver Coins to a user\n' +
                 '/removesilver - Remove Silver Coins from a user\n' +
                 '/setuptoken - Setup economy token role\n' +
                 '/announcement - Send an announcement\n' +
                 '/migrate - Migrate economy data\n' +
                 '```',
          inline: false
        },
        {
          name: '💡 **ECONOMY SYSTEM**',
          value: '```diff\n' +
                 '+ 🪙 Silver Coins: Main currency for trading\n' +
                 '+ 🥇 Gold Bars: Valuable items (1 bar = 700 Silver)\n' +
                 '+ 💼 Inventory System: Max weight 100kg\n' +
                 '+ ⛏️ Mine gold solo or with friends\n' +
                 '+ 🎲 Play games to earn more coins\n' +
                 '```',
          inline: false
        }
      )
      .setFooter({ text: '🌵 Stay safe in the Wild West, partner!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
