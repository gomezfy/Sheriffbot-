import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { infoEmbed, field } from '../../utils/embeds';

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = infoEmbed(
      '🤠 Sheriff Rex - Command Guide',
      '**Welcome to the Wild West!** Here\'s everything you need to survive on the frontier.\n\n**💰 ECONOMY SYSTEM**\n🪙 **Silver Coins** - Main currency\n🥇 **Gold Bars** - Valuable items (1 bar = 700 Silver)\n💼 **Inventory** - Max weight 100kg',
      '🌵 Sheriff Rex Bot • Use commands wisely, partner!'
    )
      .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png')
      .addFields(
        {
          name: '💰 Economy & Trading',
          value: '```yaml\n' +
                 '/daily     : Claim daily Silver Coins reward\n' +
                 '/work      : Work at Western jobs to earn coins\n' +
                 '/inventory : Check your saddlebag contents\n' +
                 '/give      : Transfer coins or items to players\n' +
                 '/claim     : Redeem special reward codes\n' +
                 '```',
          inline: false
        },
        {
          name: '⛏️ Mining & Resources',
          value: '```yaml\n' +
                 '/mine : Mine for gold in the mountains\n' +
                 '  Solo   - 50min cooldown | 1-3 Gold Bars\n' +
                 '  Co-op  - 2h cooldown    | 4-6 Gold Bars (split)\n' +
                 '```',
          inline: false
        },
        {
          name: '🎲 Gambling & Games',
          value: '```yaml\n' +
                 '/casino  : Spin the lucky wheel\n' +
                 '/dice    : Challenge players to dice duel\n' +
                 '/poker   : Play Texas Hold\'em poker\n' +
                 '/bankrob : Rob the bank with a partner\n' +
                 '/duel    : Western showdown (coming soon)\n' +
                 '```',
          inline: false
        },
        {
          name: '👤 Profile & Stats',
          value: '```yaml\n' +
                 '/profile     : View Western profile card\n' +
                 '/avatar      : Display user avatar\n' +
                 '/leaderboard : Top 10 richest players\n' +
                 '```',
          inline: false
        },
        {
          name: '🔫 Bounty System',
          value: '```yaml\n' +
                 '/wanted   : Check wanted posters\n' +
                 '/bounties : View active bounties\n' +
                 '```',
          inline: false
        },
        {
          name: '⚙️ Server Management (Admin Only)',
          value: '```yaml\n' +
                 '/setwelcome  : Configure welcome messages\n' +
                 '/setlogs     : Setup server logs channel\n' +
                 '/setwanted   : Configure wanted posters\n' +
                 '/announcement: Send server announcements\n' +
                 '/addsilver   : Give Silver Coins to users\n' +
                 '/addgold     : Give Gold Bars to users\n' +
                 '```',
          inline: false
        },
        {
          name: '🔧 Utility Commands',
          value: '```yaml\n' +
                 '/help     : Show this command guide\n' +
                 '/ping     : Check bot response time\n' +
                 '/servidor : View server information\n' +
                 '/idioma   : Change bot language\n' +
                 '```',
          inline: false
        }
      );

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🆘 Support Server')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/gXwaYFNhfp'),
        new ButtonBuilder()
          .setLabel('➕ Add Bot')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands'),
        new ButtonBuilder()
          .setLabel('🌐 Website')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://${process.env.REPLIT_DEV_DOMAIN || 'sheriff-bot.repl.co'}`)
      );

    await interaction.reply({ embeds: [embed], components: [buttons], flags: MessageFlags.Ephemeral });
  },
};
