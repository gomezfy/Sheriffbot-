import { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder,
  ChatInputCommandInteraction, 
  MessageFlags, 
  EmbedBuilder 
} from 'discord.js';
import { t, getLocale } from '../../utils/i18n';
import { 
  getMoneybagEmoji, 
  getSlotMachineEmoji, 
  getPickaxeEmoji, 
  getRevolverEmoji,
  getCowboyEmoji,
  getInfoEmoji
} from '../../utils/customEmojis';

function getMainEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  const cowboyEmoji = getCowboyEmoji();
  
  const description = locale === 'pt-BR'
    ? '🤠 **Bem-vindo ao Sheriff Bot!**\n\nSelecione uma categoria no menu abaixo para ver os comandos disponíveis.'
    : locale === 'es-ES'
    ? '🤠 **¡Bienvenido a Sheriff Bot!**\n\nSelecciona una categoría en el menú de abajo para ver los comandos disponibles.'
    : locale === 'fr'
    ? '🤠 **Bienvenue sur Sheriff Bot!**\n\nSélectionnez une catégorie dans le menu ci-dessous pour voir les commandes disponibles.'
    : '🤠 **Welcome to Sheriff Bot!**\n\nSelect a category from the menu below to view available commands.';
  
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${cowboyEmoji} ${t(interaction, 'help_title')}`)
    .setDescription(description)
    .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png')
    .setFooter({ text: t(interaction, 'help_footer') })
    .setTimestamp();
}

function getCategoryEmbed(interaction: ChatInputCommandInteraction, category: string): EmbedBuilder {
  const locale = getLocale(interaction);
  const cowboyEmoji = getCowboyEmoji();
  
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
    .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png')
    .setFooter({ text: t(interaction, 'help_footer') })
    .setTimestamp();

  switch (category) {
    case 'economy': {
      const moneyEmoji = getMoneybagEmoji();
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

      embed.setTitle(`${moneyEmoji} ${t(interaction, 'help_economy_title')}`)
        .setDescription(economyCommands);
      break;
    }

    case 'gambling': {
      const slotEmoji = getSlotMachineEmoji();
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

      embed.setTitle(`${slotEmoji} ${t(interaction, 'help_gambling_title')}`)
        .setDescription(gamblingCommands);
      break;
    }

    case 'mining': {
      const pickaxeEmoji = getPickaxeEmoji();
      const miningCommands = locale === 'pt-BR'
        ? `\`/mine\` ${serverText[locale]} - Minerar ouro (Solo/Cooperativo)`
        : locale === 'es-ES'
        ? `\`/mine\` ${serverText[locale]} - Minar oro (Solo/Cooperativo)`
        : locale === 'fr'
        ? `\`/mine\` ${serverText[locale]} - Miner de l'or (Solo/Coopératif)`
        : `\`/mine\` ${serverText[locale]} - Mine gold (Solo/Cooperative)`;

      embed.setTitle(`${pickaxeEmoji} ${t(interaction, 'help_mining_title')}`)
        .setDescription(miningCommands);
      break;
    }

    case 'profile': {
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

      embed.setTitle(`👤 ${t(interaction, 'help_profile_title')}`)
        .setDescription(profileCommands);
      break;
    }

    case 'bounty': {
      const revolverEmoji = getRevolverEmoji();
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

      embed.setTitle(`${revolverEmoji} ${t(interaction, 'help_bounty_title')}`)
        .setDescription(bountyCommands);
      break;
    }

    case 'admin': {
      const adminCommands = locale === 'pt-BR'
        ? `\`/announcement\` - Sistema de anúncios
\`/setwelcome\` - Configurar mensagens de boas-vindas
\`/setlogs\` - Configurar canal de logs
\`/servidor\` - Informações do servidor
\`/uploademojis\` - Gerenciar emojis customizados`
        : locale === 'es-ES'
        ? `\`/announcement\` - Sistema de anuncios
\`/setwelcome\` - Configurar mensajes de bienvenida
\`/setlogs\` - Configurar canal de registros
\`/servidor\` - Información del servidor
\`/uploademojis\` - Gestionar emojis personalizados`
        : locale === 'fr'
        ? `\`/announcement\` - Système d'annonces
\`/setwelcome\` - Configurer messages de bienvenue
\`/setlogs\` - Configurer canal de journaux
\`/servidor\` - Informations du serveur
\`/uploademojis\` - Gérer les émojis personnalisés`
        : `\`/announcement\` - Announcement system
\`/setwelcome\` - Setup welcome messages
\`/setlogs\` - Setup logs channel
\`/servidor\` - Server information
\`/uploademojis\` - Manage custom emojis`;

      embed.setTitle(`⚙️ ${t(interaction, 'help_admin_title')}`)
        .setDescription(adminCommands);
      break;
    }

    case 'utility': {
      const infoEmoji = getInfoEmoji();
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

      embed.setTitle(`${infoEmoji} ${t(interaction, 'help_utility_title')}`)
        .setDescription(utilityCommands);
      break;
    }

    default:
      embed.setTitle(`${cowboyEmoji} ${t(interaction, 'help_title')}`)
        .setDescription(t(interaction, 'help_overview_desc'));
  }

  return embed;
}

function getCategorySelectMenu(interaction: ChatInputCommandInteraction, isAdmin: boolean = false): ActionRowBuilder<StringSelectMenuBuilder> {
  const locale = getLocale(interaction);
  
  const categoryNames = {
    economy: locale === 'pt-BR' ? '💰 Economia' : locale === 'es-ES' ? '💰 Economía' : locale === 'fr' ? '💰 Économie' : '💰 Economy',
    gambling: locale === 'pt-BR' ? '🎰 Jogos' : locale === 'es-ES' ? '🎰 Juegos' : locale === 'fr' ? '🎰 Jeux' : '🎰 Gambling',
    mining: locale === 'pt-BR' ? '⛏️ Mineração' : locale === 'es-ES' ? '⛏️ Minería' : locale === 'fr' ? '⛏️ Minage' : '⛏️ Mining',
    profile: locale === 'pt-BR' ? '👤 Perfil' : locale === 'es-ES' ? '👤 Perfil' : locale === 'fr' ? '👤 Profil' : '👤 Profile',
    bounty: locale === 'pt-BR' ? '🔫 Recompensas' : locale === 'es-ES' ? '🔫 Recompensas' : locale === 'fr' ? '🔫 Primes' : '🔫 Bounty',
    utility: locale === 'pt-BR' ? 'ℹ️ Utilidades' : locale === 'es-ES' ? 'ℹ️ Utilidades' : locale === 'fr' ? 'ℹ️ Utilitaires' : 'ℹ️ Utility'
  };

  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.economy)
      .setValue('economy')
      .setEmoji('💰'),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.gambling)
      .setValue('gambling')
      .setEmoji('🎰'),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.mining)
      .setValue('mining')
      .setEmoji('⛏️'),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.profile)
      .setValue('profile')
      .setEmoji('👤'),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.bounty)
      .setValue('bounty')
      .setEmoji('🔫'),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.utility)
      .setValue('utility')
      .setEmoji('ℹ️')
  ];

  // Add admin category if user has permissions
  if (isAdmin) {
    const adminLabel = locale === 'pt-BR' ? '⚙️ Admin' : locale === 'es-ES' ? '⚙️ Admin' : locale === 'fr' ? '⚙️ Admin' : '⚙️ Admin';
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(adminLabel)
        .setValue('admin')
        .setEmoji('⚙️')
    );
  }

  const placeholder = locale === 'pt-BR' 
    ? '📚 Selecione uma categoria...' 
    : locale === 'es-ES'
    ? '📚 Selecciona una categoría...'
    : locale === 'fr'
    ? '📚 Sélectionnez une catégorie...'
    : '📚 Select a category...';

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_category_select')
    .setPlaceholder(placeholder)
    .addOptions(options);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const isAdmin = interaction.memberPermissions?.has('Administrator') || false;
    const mainEmbed = getMainEmbed(interaction);
    const selectMenu = getCategorySelectMenu(interaction, isAdmin);

    await interaction.reply({
      embeds: [mainEmbed],
      components: [selectMenu],
      flags: MessageFlags.Ephemeral
    });
  },
  
  // Handler para o select menu
  async handleSelectMenu(interaction: any): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'help_category_select') return;

    const category = interaction.values[0];
    const isAdmin = interaction.memberPermissions?.has('Administrator') || false;
    
    const categoryEmbed = getCategoryEmbed(interaction, category);
    const selectMenu = getCategorySelectMenu(interaction, isAdmin);

    await interaction.update({
      embeds: [categoryEmbed],
      components: [selectMenu]
    });
  }
};
