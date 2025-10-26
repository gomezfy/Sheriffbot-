import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { t, getLocale } from '../../utils/i18n';
import { 
  getMoneybagEmoji, 
  getSlotMachineEmoji, 
  getPickaxeEmoji, 
  getRevolverEmoji,
  getCowboyEmoji,
  getInfoEmoji
} from '../../utils/customEmojis';

function getAllCategoriesEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  
  const moneyEmoji = getMoneybagEmoji();
  const slotEmoji = getSlotMachineEmoji();
  const pickaxeEmoji = getPickaxeEmoji();
  const revolverEmoji = getRevolverEmoji();
  const cowboyEmoji = getCowboyEmoji();
  const infoEmoji = getInfoEmoji();
  
  const dmText: Record<string, string> = {
    'pt-BR': '(DM)',
    'en-US': '(DM)',
    'es-ES': '(MP)',
    'fr': '(MP)'
  };
  
  const serverText: Record<string, string> = {
    'pt-BR': '(Server)',
    'en-US': '(Server)',
    'es-ES': '(Server)',
    'fr': '(Server)'
  };

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${cowboyEmoji} ${t(interaction, 'help_title')}`)
    .setDescription(t(interaction, 'help_overview_desc'))
    .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png')
    .setFooter({ text: t(interaction, 'help_footer') })
    .setTimestamp();

  // Economy Category
  const economyCommands = locale === 'pt-BR' 
    ? `\`/daily\` ${dmText[locale]} - Recompensa diária
\`/give\` ${serverText[locale]} - Transferir moedas/itens
\`/inventory\` ${dmText[locale]} - Ver seu inventário
\`/leaderboard\` ${dmText[locale]} - Top 10 jogadores
\`/redeem\` ${dmText[locale]} - Resgatar códigos
\`/middleman\` ${dmText[locale]} - Converter moedas
\`/territories\` ${serverText[locale]} - Sistema de territórios`
    : locale === 'es-ES'
    ? `\`/daily\` ${dmText[locale]} - Recompensa diaria
\`/give\` ${serverText[locale]} - Transferir monedas/objetos
\`/inventory\` ${dmText[locale]} - Ver tu inventario
\`/leaderboard\` ${dmText[locale]} - Top 10 jugadores
\`/redeem\` ${dmText[locale]} - Canjear códigos
\`/middleman\` ${dmText[locale]} - Convertir monedas
\`/territories\` ${serverText[locale]} - Sistema de territorios`
    : locale === 'fr'
    ? `\`/daily\` ${dmText[locale]} - Récompense quotidienne
\`/give\` ${serverText[locale]} - Transférer monnaie/objets
\`/inventory\` ${dmText[locale]} - Voir votre inventaire
\`/leaderboard\` ${dmText[locale]} - Top 10 joueurs
\`/redeem\` ${dmText[locale]} - Codes de rachat
\`/middleman\` ${dmText[locale]} - Convertir monnaie
\`/territories\` ${serverText[locale]} - Système de territoires`
    : `\`/daily\` ${dmText[locale]} - Daily reward
\`/give\` ${serverText[locale]} - Transfer coins/items
\`/inventory\` ${dmText[locale]} - View your inventory
\`/leaderboard\` ${dmText[locale]} - Top 10 players
\`/redeem\` ${dmText[locale]} - Redeem codes
\`/middleman\` ${dmText[locale]} - Convert currency
\`/territories\` ${serverText[locale]} - Territory system`;

  embed.addFields({
    name: `${moneyEmoji} ${t(interaction, 'help_economy_title')}`,
    value: economyCommands,
    inline: false
  });

  // Gambling Category
  const gamblingCommands = locale === 'pt-BR'
    ? `\`/casino\` ${dmText[locale]} - Slot machine
\`/dice\` ${serverText[locale]} - Duelo de dados
\`/poker\` ${serverText[locale]} - Texas Hold'em
\`/bankrob\` ${serverText[locale]} - Assalto cooperativo
\`/duel\` ${serverText[locale]} - Duelo PvP (HP system)`
    : locale === 'es-ES'
    ? `\`/casino\` ${dmText[locale]} - Tragamonedas
\`/dice\` ${serverText[locale]} - Duelo de dados
\`/poker\` ${serverText[locale]} - Texas Hold'em
\`/bankrob\` ${serverText[locale]} - Asalto cooperativo
\`/duel\` ${serverText[locale]} - Duelo PvP (HP system)`
    : locale === 'fr'
    ? `\`/casino\` ${dmText[locale]} - Machine à sous
\`/dice\` ${serverText[locale]} - Duel de dés
\`/poker\` ${serverText[locale]} - Texas Hold'em
\`/bankrob\` ${serverText[locale]} - Braquage coopératif
\`/duel\` ${serverText[locale]} - Duel PvP (HP system)`
    : `\`/casino\` ${dmText[locale]} - Slot machine
\`/dice\` ${serverText[locale]} - Dice duel
\`/poker\` ${serverText[locale]} - Texas Hold'em
\`/bankrob\` ${serverText[locale]} - Cooperative heist
\`/duel\` ${serverText[locale]} - PvP duel (HP system)`;

  embed.addFields({
    name: `${slotEmoji} ${t(interaction, 'help_gambling_title')}`,
    value: gamblingCommands,
    inline: false
  });

  // Mining Category
  const miningCommands = locale === 'pt-BR'
    ? `\`/mine\` ${serverText[locale]} - Minerar ouro (Solo/Cooperativo)`
    : locale === 'es-ES'
    ? `\`/mine\` ${serverText[locale]} - Minar oro (Solo/Cooperativo)`
    : locale === 'fr'
    ? `\`/mine\` ${serverText[locale]} - Miner de l'or (Solo/Coopératif)`
    : `\`/mine\` ${serverText[locale]} - Mine gold (Solo/Cooperative)`;

  embed.addFields({
    name: `${pickaxeEmoji} ${t(interaction, 'help_mining_title')}`,
    value: miningCommands,
    inline: false
  });

  // Profile Category
  const profileCommands = locale === 'pt-BR'
    ? `\`/profile\` ${dmText[locale]} - Ver perfil com estatísticas
\`/avatar\` ${dmText[locale]} - Customizar avatar do perfil
\`/inventory\` ${dmText[locale]} - Ver inventário completo`
    : locale === 'es-ES'
    ? `\`/profile\` ${dmText[locale]} - Ver perfil con estadísticas
\`/avatar\` ${dmText[locale]} - Personalizar avatar del perfil
\`/inventory\` ${dmText[locale]} - Ver inventario completo`
    : locale === 'fr'
    ? `\`/profile\` ${dmText[locale]} - Voir profil avec statistiques
\`/avatar\` ${dmText[locale]} - Personnaliser avatar du profil
\`/inventory\` ${dmText[locale]} - Voir inventaire complet`
    : `\`/profile\` ${dmText[locale]} - View profile with stats
\`/avatar\` ${dmText[locale]} - Customize profile avatar
\`/inventory\` ${dmText[locale]} - View complete inventory`;

  embed.addFields({
    name: `👤 ${t(interaction, 'help_profile_title')}`,
    value: profileCommands,
    inline: false
  });

  // Bounty Category
  const bountyCommands = locale === 'pt-BR'
    ? `\`/wanted\` ${serverText[locale]} - Colocar recompensa em alguém
\`/bounties\` ${serverText[locale]} - Ver recompensas ativas
\`/capture\` ${serverText[locale]} - Capturar procurado
\`/clearbounty\` ${serverText[locale]} - Limpar sua recompensa`
    : locale === 'es-ES'
    ? `\`/wanted\` ${serverText[locale]} - Poner recompensa a alguien
\`/bounties\` ${serverText[locale]} - Ver recompensas activas
\`/capture\` ${serverText[locale]} - Capturar buscado
\`/clearbounty\` ${serverText[locale]} - Limpiar tu recompensa`
    : locale === 'fr'
    ? `\`/wanted\` ${serverText[locale]} - Mettre une prime sur quelqu'un
\`/bounties\` ${serverText[locale]} - Voir primes actives
\`/capture\` ${serverText[locale]} - Capturer recherché
\`/clearbounty\` ${serverText[locale]} - Effacer votre prime`
    : `\`/wanted\` ${serverText[locale]} - Put bounty on someone
\`/bounties\` ${serverText[locale]} - View active bounties
\`/capture\` ${serverText[locale]} - Capture wanted person
\`/clearbounty\` ${serverText[locale]} - Clear your bounty`;

  embed.addFields({
    name: `${revolverEmoji} ${t(interaction, 'help_bounty_title')}`,
    value: bountyCommands,
    inline: false
  });

  // Admin Category (only show if user has permissions)
  if (interaction.memberPermissions?.has('Administrator')) {
    const adminCommands = locale === 'pt-BR'
      ? `\`/announcement\` - Sistema de anúncios
\`/setwelcome\` - Configurar mensagens de boas-vindas
\`/setlogs\` - Configurar canal de logs
\`/servidor\` - Informações do servidor`
      : locale === 'es-ES'
      ? `\`/announcement\` - Sistema de anuncios
\`/setwelcome\` - Configurar mensajes de bienvenida
\`/setlogs\` - Configurar canal de registros
\`/servidor\` - Información del servidor`
      : locale === 'fr'
      ? `\`/announcement\` - Système d'annonces
\`/setwelcome\` - Configurer messages de bienvenue
\`/setlogs\` - Configurer canal de journaux
\`/servidor\` - Informations du serveur`
      : `\`/announcement\` - Announcement system
\`/setwelcome\` - Setup welcome messages
\`/setlogs\` - Setup logs channel
\`/servidor\` - Server information`;

    embed.addFields({
      name: `⚙️ ${t(interaction, 'help_admin_title')}`,
      value: adminCommands,
      inline: false
    });
  }

  // Utility Category
  const utilityCommands = locale === 'pt-BR'
    ? `\`/help\` - Este menu de ajuda
\`/ping\` - Ver latência do bot
\`/idioma\` - Mudar idioma`
    : locale === 'es-ES'
    ? `\`/help\` - Este menú de ayuda
\`/ping\` - Ver latencia del bot
\`/idioma\` - Cambiar idioma`
    : locale === 'fr'
    ? `\`/help\` - Ce menu d'aide
\`/ping\` - Voir latence du bot
\`/idioma\` - Changer la langue`
    : `\`/help\` - This help menu
\`/ping\` - View bot latency
\`/idioma\` - Change language`;

  embed.addFields({
    name: `${infoEmoji} ${t(interaction, 'help_utility_title')}`,
    value: utilityCommands,
    inline: false
  });

  return embed;
}

function getLinkButtons(interaction: ChatInputCommandInteraction): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel(t(interaction, 'help_btn_support'))
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/gXwaYFNhfp'),
      new ButtonBuilder()
        .setLabel(t(interaction, 'help_btn_invite'))
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands'),
      new ButtonBuilder()
        .setLabel(t(interaction, 'help_btn_website'))
        .setStyle(ButtonStyle.Link)
        .setURL(`https://${process.env.REPLIT_DEV_DOMAIN || 'sheriff-bot.repl.co'}`)
    );
}

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = getAllCategoriesEmbed(interaction);
    const linkButtons = getLinkButtons(interaction);

    await interaction.reply({
      embeds: [embed],
      components: [linkButtons],
      flags: MessageFlags.Ephemeral
    });
  },
};
