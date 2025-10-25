import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageFlags, ButtonInteraction, EmbedBuilder, ComponentType } from 'discord.js';
import { t, getLocale } from '../../utils/i18n';
import { getMoneybagEmoji, getSlotMachineEmoji, getPickaxeEmoji, getRevolverEmoji } from '../../utils/customEmojis';

const CATEGORIES = {
  OVERVIEW: 'overview',
  ECONOMY: 'economy',
  GAMBLING: 'gambling',
  MINING: 'mining',
  PROFILE: 'profile',
  BOUNTY: 'bounty',
  ADMIN: 'admin',
  UTILITY: 'utility'
};

function getOverviewEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  
  const moneyEmoji = getMoneybagEmoji();
  const slotEmoji = getSlotMachineEmoji();
  const pickaxeEmoji = getPickaxeEmoji();
  const revolverEmoji = getRevolverEmoji();
  
  const categoryMap: Record<string, string> = {
    'pt-BR': `${moneyEmoji} **Economia & Trading:** \`/daily\` • \`/give\` • \`/inventory\` • \`/redeem\` • \`/leaderboard\`\n8 comandos de economia e moedas\n\n${slotEmoji} **Gambling & Jogos:** \`/casino\` • \`/dice\` • \`/poker\` • \`/bankrob\` • \`/duel\`\n5 comandos de apostas e jogos\n\n${pickaxeEmoji} **Mineração:** \`/mine\` - Sistema de mineração solo e cooperativa\n1 comando com múltiplos modos\n\n👤 **Perfil & Customização:** \`/profile\` • \`/avatar\` • \`/inventory\`\n3 comandos de perfil e visual\n\n${revolverEmoji} **Sistema de Bounty:** \`/wanted\` • \`/bounties\` • \`/capture\` • \`/clearbounty\`\n4 comandos de recompensas\n\n⚙️ **Administração:** \`/announcement\` • \`/servidor\` • \`/setwelcome\` • \`/setlogs\`\n10 comandos administrativos\n\n🔧 **Utilidades:** \`/help\` • \`/ping\` • \`/idioma\`\n3 comandos de utilidade`,
    'en-US': `${moneyEmoji} **Economy & Trading:** \`/daily\` • \`/give\` • \`/inventory\` • \`/redeem\` • \`/leaderboard\`\n8 economy and coins commands\n\n${slotEmoji} **Gambling & Games:** \`/casino\` • \`/dice\` • \`/poker\` • \`/bankrob\` • \`/duel\`\n5 gambling and games commands\n\n${pickaxeEmoji} **Mining:** \`/mine\` - Solo and cooperative mining system\n1 command with multiple modes\n\n👤 **Profile & Customization:** \`/profile\` • \`/avatar\` • \`/inventory\`\n3 profile and visual commands\n\n${revolverEmoji} **Bounty System:** \`/wanted\` • \`/bounties\` • \`/capture\` • \`/clearbounty\`\n4 bounty commands\n\n⚙️ **Administration:** \`/announcement\` • \`/servidor\` • \`/setwelcome\` • \`/setlogs\`\n10 administrative commands\n\n🔧 **Utilities:** \`/help\` • \`/ping\` • \`/idioma\`\n3 utility commands`,
    'es-ES': `${moneyEmoji} **Economía & Trading:** \`/daily\` • \`/give\` • \`/inventory\` • \`/redeem\` • \`/leaderboard\`\n8 comandos de economía y monedas\n\n${slotEmoji} **Apuestas & Juegos:** \`/casino\` • \`/dice\` • \`/poker\` • \`/bankrob\` • \`/duel\`\n5 comandos de apuestas y juegos\n\n${pickaxeEmoji} **Minería:** \`/mine\` - Sistema de minería solo y cooperativa\n1 comando con múltiples modos\n\n👤 **Perfil & Personalización:** \`/profile\` • \`/avatar\` • \`/inventory\`\n3 comandos de perfil y visual\n\n${revolverEmoji} **Sistema de Recompensas:** \`/wanted\` • \`/bounties\` • \`/capture\` • \`/clearbounty\`\n4 comandos de recompensas\n\n⚙️ **Administración:** \`/announcement\` • \`/servidor\` • \`/setwelcome\` • \`/setlogs\`\n10 comandos administrativos\n\n🔧 **Utilidades:** \`/help\` • \`/ping\` • \`/idioma\`\n3 comandos de utilidad`,
    'fr': `${moneyEmoji} **Économie & Trading:** \`/daily\` • \`/give\` • \`/inventory\` • \`/redeem\` • \`/leaderboard\`\n8 commandes d'économie et monnaie\n\n${slotEmoji} **Jeux & Paris:** \`/casino\` • \`/dice\` • \`/poker\` • \`/bankrob\` • \`/duel\`\n5 commandes de jeux et paris\n\n${pickaxeEmoji} **Minage:** \`/mine\` - Système de minage solo et coopératif\n1 commande avec plusieurs modes\n\n👤 **Profil & Personnalisation:** \`/profile\` • \`/avatar\` • \`/inventory\`\n3 commandes de profil et visuel\n\n${revolverEmoji} **Système de Primes:** \`/wanted\` • \`/bounties\` • \`/capture\` • \`/clearbounty\`\n4 commandes de primes\n\n⚙️ **Administration:** \`/announcement\` • \`/servidor\` • \`/setwelcome\` • \`/setlogs\`\n10 commandes administratives\n\n🔧 **Utilitaires:** \`/help\` • \`/ping\` • \`/idioma\`\n3 commandes utilitaires`
  };
  
  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(t(interaction, 'help_title'))
    .setDescription(t(interaction, 'help_overview_desc') + '\n\n' + (categoryMap[locale] || categoryMap['en-US']))
    .setFooter({ text: t(interaction, 'help_footer') })
    .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png');
}

function getEconomyEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  
  const dmText: Record<string, string> = {
    'pt-BR': '(Funciona em DM)',
    'en-US': '(Works in DM)',
    'es-ES': '(Funciona en MP)',
    'fr': '(Fonctionne en MP)'
  };
  
  const serverText: Record<string, string> = {
    'pt-BR': '(Apenas em Servidores)',
    'en-US': '(Servers Only)',
    'es-ES': '(Solo en Servidores)',
    'fr': '(Serveurs Uniquement)'
  };
  
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(t(interaction, 'help_economy_title'))
    .setDescription(t(interaction, 'help_economy_desc'))
    .setFooter({ text: t(interaction, 'help_footer') })
    .addFields(
      { name: `📱 /daily ${dmText[locale]}`, value: locale === 'pt-BR' ? '• Recompensa diária de moedas\n• Sistema de streak\n• Bônus progressivo' : locale === 'fr' ? '• Récompense quotidienne\n• Système de série\n• Bonus progressif' : locale === 'es-ES' ? '• Recompensa diaria\n• Sistema de racha\n• Bonificación progresiva' : '• Daily coin reward\n• Streak system\n• Progressive bonus', inline: false },
      { name: `📱 /redeem ${dmText[locale]}`, value: locale === 'pt-BR' ? '• Resgate códigos da loja\n• Eventos especiais\n• Uso único' : locale === 'fr' ? '• Codes de la boutique\n• Événements spéciaux\n• Usage unique' : locale === 'es-ES' ? '• Códigos de la tienda\n• Eventos especiales\n• Uso único' : '• Shop codes\n• Special events\n• Single use', inline: false },
      { name: `📱 /leaderboard ${dmText[locale]}`, value: locale === 'pt-BR' ? '• Top 10 jogadores\n• Visual profissional\n• Sua posição' : locale === 'fr' ? '• Top 10 joueurs\n• Visuel professionnel\n• Votre position' : locale === 'es-ES' ? '• Top 10 jugadores\n• Visual profesional\n• Tu posición' : '• Top 10 players\n• Professional visual\n• Your position', inline: false },
      { name: `📱 /inventory ${dmText[locale]}`, value: locale === 'pt-BR' ? '• Veja seus itens\n• Peso/capacidade\n• Organizado' : locale === 'fr' ? '• Voir vos objets\n• Poids/capacité\n• Organisé' : locale === 'es-ES' ? '• Ver tus objetos\n• Peso/capacidad\n• Organizado' : '• View your items\n• Weight/capacity\n• Organized', inline: false },
      { name: `🏦 /give ${serverText[locale]}`, value: locale === 'pt-BR' ? '• Transferir moedas/itens\n• Sistema de confirmação\n• Logs' : locale === 'fr' ? '• Transférer monnaie/objets\n• Système de confirmation\n• Journaux' : locale === 'es-ES' ? '• Transferir monedas/objetos\n• Sistema de confirmación\n• Registros' : '• Transfer coins/items\n• Confirmation system\n• Logs', inline: false }
    );
}

function getGamblingEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  
  const dmText: Record<string, string> = {
    'pt-BR': '(Funciona em DM)',
    'en-US': '(Works in DM)',
    'es-ES': '(Funciona en MP)',
    'fr': '(Fonctionne en MP)'
  };
  
  const serverText: Record<string, string> = {
    'pt-BR': '(Apenas em Servidores)',
    'en-US': '(Servers Only)',
    'es-ES': '(Solo en Servidores)',
    'fr': '(Serveurs Uniquement)'
  };
  
  return new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle(t(interaction, 'help_gambling_title'))
    .setDescription(t(interaction, 'help_gambling_desc'))
    .setFooter({ text: t(interaction, 'help_footer') })
    .addFields(
      { name: `📱 /casino ${dmText[locale]}`, value: locale === 'pt-BR' ? '• Slot machine\n• Jackpots\n• Apostas flexíveis' : locale === 'fr' ? '• Machine à sous\n• Jackpots\n• Paris flexibles' : locale === 'es-ES' ? '• Tragamonedas\n• Jackpots\n• Apuestas flexibles' : '• Slot machine\n• Jackpots\n• Flexible bets', inline: false },
      { name: `🎲 /dice ${serverText[locale]}`, value: locale === 'pt-BR' ? '• Duelo de dados\n• Desafie jogadores\n• Maior número vence' : locale === 'fr' ? '• Duel de dés\n• Défiez les joueurs\n• Plus grand gagne' : locale === 'es-ES' ? '• Duelo de dados\n• Desafía jugadores\n• Mayor gana' : '• Dice duel\n• Challenge players\n• Highest wins', inline: false },
      { name: `🃏 /poker ${serverText[locale]}`, value: locale === 'pt-BR' ? '• Texas Hold\'em\n• Regras oficiais\n• Multiplayer' : locale === 'fr' ? '• Texas Hold\'em\n• Règles officielles\n• Multijoueur' : locale === 'es-ES' ? '• Texas Hold\'em\n• Reglas oficiales\n• Multijugador' : '• Texas Hold\'em\n• Official rules\n• Multiplayer', inline: false },
      { name: `🏦 /bankrob ${serverText[locale]}`, value: locale === 'pt-BR' ? '• Assalto cooperativo\n• 2 jogadores\n• Cooldown 2h' : locale === 'fr' ? '• Braquage coopératif\n• 2 joueurs\n• Temps de récupération 2h' : locale === 'es-ES' ? '• Asalto cooperativo\n• 2 jugadores\n• Cooldown 2h' : '• Cooperative heist\n• 2 players\n• 2h cooldown', inline: false },
      { name: `🔫 /duel ${serverText[locale]}`, value: locale === 'pt-BR' ? '• Duelo PvP\n• Combate por turnos\n• Sistema de XP' : locale === 'fr' ? '• Duel PvP\n• Combat par tours\n• Système d\'XP' : locale === 'es-ES' ? '• Duelo PvP\n• Combate por turnos\n• Sistema de XP' : '• PvP duel\n• Turn-based combat\n• XP system', inline: false }
    );
}

function getMiningEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xE67E22)
    .setTitle(t(interaction, 'help_mining_title'))
    .setDescription(t(interaction, 'help_mining_desc'))
    .setFooter({ text: t(interaction, 'help_footer') });
}

function getProfileEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(t(interaction, 'help_profile_title'))
    .setDescription(t(interaction, 'help_profile_desc'))
    .setFooter({ text: t(interaction, 'help_footer') });
}

function getBountyEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle(t(interaction, 'help_bounty_title'))
    .setDescription(t(interaction, 'help_bounty_desc'))
    .setFooter({ text: t(interaction, 'help_footer') });
}

function getAdminEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xF39C12)
    .setTitle(t(interaction, 'help_admin_title'))
    .setDescription(t(interaction, 'help_admin_desc'))
    .setFooter({ text: t(interaction, 'help_footer') });
}

function getUtilityEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x95A5A6)
    .setTitle(t(interaction, 'help_utility_title'))
    .setDescription(t(interaction, 'help_utility_desc'))
    .setFooter({ text: t(interaction, 'help_footer') });
}

function getCategoryButtons(interaction: ChatInputCommandInteraction, currentCategory: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_economy')
        .setLabel(t(interaction, 'help_btn_economy'))
        .setStyle(currentCategory === CATEGORIES.ECONOMY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.ECONOMY),
      new ButtonBuilder()
        .setCustomId('help_gambling')
        .setLabel(t(interaction, 'help_btn_gambling'))
        .setStyle(currentCategory === CATEGORIES.GAMBLING ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.GAMBLING),
      new ButtonBuilder()
        .setCustomId('help_mining')
        .setLabel(t(interaction, 'help_btn_mining'))
        .setStyle(currentCategory === CATEGORIES.MINING ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.MINING),
      new ButtonBuilder()
        .setCustomId('help_profile')
        .setLabel(t(interaction, 'help_btn_profile'))
        .setStyle(currentCategory === CATEGORIES.PROFILE ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.PROFILE)
    );
}

function getSecondaryButtons(interaction: ChatInputCommandInteraction, currentCategory: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_bounty')
        .setLabel(t(interaction, 'help_btn_bounty'))
        .setStyle(currentCategory === CATEGORIES.BOUNTY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.BOUNTY),
      new ButtonBuilder()
        .setCustomId('help_admin')
        .setLabel(t(interaction, 'help_btn_admin'))
        .setStyle(currentCategory === CATEGORIES.ADMIN ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.ADMIN),
      new ButtonBuilder()
        .setCustomId('help_utility')
        .setLabel(t(interaction, 'help_btn_utility'))
        .setStyle(currentCategory === CATEGORIES.UTILITY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.UTILITY),
      new ButtonBuilder()
        .setCustomId('help_overview')
        .setLabel(t(interaction, 'help_btn_home'))
        .setStyle(currentCategory === CATEGORIES.OVERVIEW ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.OVERVIEW)
    );
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

function getEmbedForCategory(category: string, interaction: ChatInputCommandInteraction): EmbedBuilder {
  switch (category) {
    case CATEGORIES.ECONOMY:
      return getEconomyEmbed(interaction);
    case CATEGORIES.GAMBLING:
      return getGamblingEmbed(interaction);
    case CATEGORIES.MINING:
      return getMiningEmbed(interaction);
    case CATEGORIES.PROFILE:
      return getProfileEmbed(interaction);
    case CATEGORIES.BOUNTY:
      return getBountyEmbed(interaction);
    case CATEGORIES.ADMIN:
      return getAdminEmbed(interaction);
    case CATEGORIES.UTILITY:
      return getUtilityEmbed(interaction);
    default:
      return getOverviewEmbed(interaction);
  }
}

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = getOverviewEmbed(interaction);
    const buttons = getCategoryButtons(interaction, CATEGORIES.OVERVIEW);
    const secondaryButtons = getSecondaryButtons(interaction, CATEGORIES.OVERVIEW);
    const linkButtons = getLinkButtons(interaction);

    const reply = await interaction.reply({
      embeds: [embed],
      components: [buttons, secondaryButtons, linkButtons],
      flags: MessageFlags.Ephemeral
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000
    });

    collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({
          content: t(interaction, 'help_only_user'),
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const category = buttonInteraction.customId.replace('help_', '');
      const newEmbed = getEmbedForCategory(category, interaction);
      const newButtons = getCategoryButtons(interaction, category);
      const newSecondaryButtons = getSecondaryButtons(interaction, category);

      await buttonInteraction.update({
        embeds: [newEmbed],
        components: [newButtons, newSecondaryButtons, linkButtons]
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({
          components: []
        });
      } catch (error) {
      }
    });
  },
};
