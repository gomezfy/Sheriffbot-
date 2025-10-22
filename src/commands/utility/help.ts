import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageFlags, ButtonInteraction, EmbedBuilder, ComponentType } from 'discord.js';
import { infoEmbed, successEmbed } from '../../utils/embeds';

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

function getOverviewEmbed(): EmbedBuilder {
  return infoEmbed(
    '🤠 Sheriff Rex - Guia de Comandos',
    '**Bem-vindo ao Velho Oeste!** Sheriff Rex é um bot completo com sistema de economia, jogos, mineração e muito mais.\n\n' +
    '📱 **Suporte a DM:** Alguns comandos funcionam em mensagens diretas!\n' +
    '🎮 **34 Comandos Disponíveis**\n\n' +
    '**Selecione uma categoria abaixo para ver os comandos:**',
    '🌵 Use os botões para navegar entre as categorias'
  )
    .setThumbnail('https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png')
    .addFields(
      {
        name: '💰 Economia & Trading',
        value: '`/daily` • `/give` • `/inventory` • `/redeem` • `/leaderboard`\n8 comandos de economia e moedas',
        inline: false
      },
      {
        name: '🎲 Gambling & Jogos',
        value: '`/casino` • `/dice` • `/poker` • `/bankrob` • `/duel`\n5 comandos de apostas e jogos',
        inline: false
      },
      {
        name: '⛏️ Mineração',
        value: '`/mine` - Sistema de mineração solo e cooperativa\n1 comando com múltiplos modos',
        inline: false
      },
      {
        name: '👤 Perfil & Customização',
        value: '`/profile` • `/avatar` • `/inventory`\n3 comandos de perfil e visual',
        inline: false
      },
      {
        name: '🔫 Sistema de Bounty',
        value: '`/wanted` • `/bounties` • `/capture` • `/clearbounty`\n4 comandos de recompensas',
        inline: false
      },
      {
        name: '⚙️ Administração',
        value: '`/announcement` • `/servidor` • `/setwelcome` • `/setlogs`\n10 comandos administrativos',
        inline: false
      },
      {
        name: '🔧 Utilidades',
        value: '`/help` • `/ping` • `/idioma`\n3 comandos de utilidade',
        inline: false
      }
    );
}

function getEconomyEmbed(): EmbedBuilder {
  return successEmbed(
    '💰 Economia & Trading',
    '**Sistema econômico completo com moedas, itens e transferências.**\n\n' +
    '🪙 **Silver Coins** - Moeda principal do servidor\n' +
    '🥇 **Gold Bars** - Itens valiosos (1 barra = 700 Silver)\n' +
    '🎟️ **Saloon Tokens** - Moeda premium para customizações\n' +
    '💼 **Backpack System** - Sistema de mochila com upgrades',
    'Comandos de Economia'
  )
    .addFields(
      {
        name: '📱 `/daily` (Funciona em DM)',
        value: '**Recompensa Diária**\n' +
               '• Reivindique suas moedas diárias\n' +
               '• Sistema de streak (dias seguidos)\n' +
               '• Bônus progressivo por consistência\n' +
               '• Cooldown: 24 horas',
        inline: false
      },
      {
        name: '📱 `/redeem` (Funciona em DM)',
        value: '**Resgatar Códigos**\n' +
               '• Resgate códigos de compra da loja\n' +
               '• Códigos de eventos especiais\n' +
               '• Recompensas exclusivas\n' +
               '• Uso único por código',
        inline: false
      },
      {
        name: '📱 `/leaderboard` (Funciona em DM)',
        value: '**Ranking de Riqueza**\n' +
               '• Top 10 jogadores mais ricos\n' +
               '• Visual profissional com Canvas\n' +
               '• Hall da Fama com Top 3\n' +
               '• Mostra sua posição no ranking',
        inline: false
      },
      {
        name: '📱 `/inventory` (Funciona em DM)',
        value: '**Visualizar Inventário**\n' +
               '• Veja todos os seus itens\n' +
               '• Peso atual/máximo da mochila\n' +
               '• Barras de ouro, minérios, etc\n' +
               '• Organizado por categoria',
        inline: false
      },
      {
        name: '🏦 `/give` (Apenas em Servidores)',
        value: '**Transferir Itens/Moedas**\n' +
               '• Transfira coins ou itens para outros\n' +
               '• Sistema de confirmação\n' +
               '• Previne transferências inválidas\n' +
               '• Logs de transações',
        inline: false
      },
      {
        name: '⚙️ Comandos Admin',
        value: '`/addsilver` • `/addgold` • `/addtokens` • `/addbackpack`\n' +
               '`/removegold` • `/setuptoken` • `/generatecode` • `/middleman`',
        inline: false
      }
    );
}

function getGamblingEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle('🎲 Gambling & Jogos')
    .setDescription(
      '**Jogos de apostas e azar do Velho Oeste!**\n\n' +
      '💰 Aposte suas Silver Coins\n' +
      '🎰 Múltiplos jogos disponíveis\n' +
      '🤝 Jogos solo e cooperativos\n' +
      '⚠️ Aposte com responsabilidade!'
    )
    .setFooter({ text: 'Comandos de Gambling' })
    .addFields(
      {
        name: '📱 `/casino` (Funciona em DM)',
        value: '**Slot Machine do Saloon**\n' +
               '• Jogo de slots clássico\n' +
               '• Múltiplas linhas de pagamento\n' +
               '• Jackpots progressivos\n' +
               '• Apostas flexíveis',
        inline: false
      },
      {
        name: '🎲 `/dice` (Apenas em Servidores)',
        value: '**Duelo de Dados**\n' +
               '• Desafie outro jogador\n' +
               '• Aposte qualquer quantia\n' +
               '• Maior número vence\n' +
               '• Sistema de aceitação',
        inline: false
      },
      {
        name: '🃏 `/poker` (Apenas em Servidores)',
        value: '**Texas Hold\'em Poker**\n' +
               '• Poker completo com regras oficiais\n' +
               '• Apostas progressivas\n' +
               '• Rankings de mãos tradicionais\n' +
               '• Multiplayer',
        inline: false
      },
      {
        name: '🏦 `/bankrob` (Apenas em Servidores)',
        value: '**Assalto ao Banco**\n' +
               '• Jogo cooperativo (2 jogadores)\n' +
               '• Recompensas altas\n' +
               '• Taxa de sucesso variável\n' +
               '• Cooldown de 2 horas',
        inline: false
      },
      {
        name: '🔫 `/duel` (Apenas em Servidores)',
        value: '**Duelo Western PvP**\n' +
               '• Duelo ao estilo Velho Oeste\n' +
               '• Combate baseado em turnos\n' +
               '• Apostas opcionais\n' +
               '• Sistema de XP',
        inline: false
      }
    );
}

function getMiningEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xE67E22)
    .setTitle('⛏️ Sistema de Mineração')
    .setDescription(
      '**Mine nas montanhas do Velho Oeste!**\n\n' +
      '🥇 Encontre Gold Bars valiosas\n' +
      '💎 Descubra minérios raros\n' +
      '🤝 Mine sozinho ou em dupla\n' +
      '⏰ Cooldowns estratégicos'
    )
    .setFooter({ text: 'Comandos de Mineração' })
    .addFields(
      {
        name: '⛏️ `/mine` (Apenas em Servidores)',
        value: '**Comando de Mineração Principal**\n\n' +
               '**🚶 Modo Solo:**\n' +
               '• Cooldown: 50 minutos\n' +
               '• Recompensa: 1-3 Gold Bars\n' +
               '• Itens adicionais possíveis\n' +
               '• XP ao minerar\n\n' +
               '**👥 Modo Co-op:**\n' +
               '• Cooldown: 2 horas\n' +
               '• Recompensa: 4-6 Gold Bars (divididas)\n' +
               '• Bônus de cooperação\n' +
               '• XP compartilhado\n' +
               '• Requer parceiro',
        inline: false
      },
      {
        name: '💼 Sistema de Mochila',
        value: '**Capacidade de Peso:**\n' +
               '• Básica: 100kg\n' +
               '• Upgrades disponíveis até 500kg\n' +
               '• Compre upgrades na loja web\n' +
               '• Gold Bars pesam 5kg cada',
        inline: false
      },
      {
        name: '💰 Vendendo Ouro',
        value: '**Venda suas Gold Bars:**\n' +
               '• Use `/give` para vender para o mercador\n' +
               '• 1 Gold Bar = 700 Silver Coins\n' +
               '• Ou troque com outros jogadores\n' +
               '• Sistema de middleman disponível',
        inline: false
      }
    );
}

function getProfileEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle('👤 Perfil & Customização')
    .setDescription(
      '**Personalize seu perfil do Velho Oeste!**\n\n' +
      '🎨 Backgrounds customizáveis\n' +
      '📊 Sistema de XP e Níveis\n' +
      '🖼️ Profile cards visuais\n' +
      '✨ Efeito glassmorphism'
    )
    .setFooter({ text: 'Comandos de Perfil' })
    .addFields(
      {
        name: '📱 `/profile` (Funciona em DM)',
        value: '**Cartão de Perfil Visual**\n' +
               '• Profile card com Canvas\n' +
               '• Mostra XP, nível e bio\n' +
               '• Backgrounds customizáveis\n' +
               '• Loja de backgrounds integrada\n' +
               '• Efeito glassmorphism moderno\n' +
               '• Bordas coloridas por nível',
        inline: false
      },
      {
        name: '🛒 Sistema de Backgrounds',
        value: '**Customização Premium:**\n' +
               '• Compre com Saloon Tokens\n' +
               '• Navegação em carrossel\n' +
               '• Raridades: Epic, Legendary, Mythic\n' +
               '• Preview antes de comprar\n' +
               '• Troca instantânea após compra',
        inline: false
      },
      {
        name: '📱 `/avatar` (Funciona em DM)',
        value: '**Visualizar Avatar**\n' +
               '• Mostra avatar em alta resolução\n' +
               '• Seu avatar ou de outros usuários\n' +
               '• Link para download\n' +
               '• Formatos PNG e WebP',
        inline: false
      },
      {
        name: '📱 `/inventory` (Funciona em DM)',
        value: '**Inventário Detalhado**\n' +
               '• Todos os seus itens\n' +
               '• Peso e capacidade\n' +
               '• Gold Bars, minérios, etc\n' +
               '• Organização visual',
        inline: false
      }
    );
}

function getBountyEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('🔫 Sistema de Bounty')
    .setDescription(
      '**Caçada de recompensas no Velho Oeste!**\n\n' +
      '💀 Coloque recompensas em jogadores\n' +
      '🎯 Capture criminosos procurados\n' +
      '💰 Ganhe recompensas em Silver\n' +
      '⚖️ Sistema de justiça western'
    )
    .setFooter({ text: 'Comandos de Bounty' })
    .addFields(
      {
        name: '🔍 `/wanted` (Apenas em Servidores)',
        value: '**Cartaz de Procurado**\n' +
               '• Define recompensa em um jogador\n' +
               '• Cria poster visual wanted\n' +
               '• Define valor da recompensa\n' +
               '• Apenas admins podem usar',
        inline: false
      },
      {
        name: '📜 `/bounties` (Apenas em Servidores)',
        value: '**Lista de Recompensas**\n' +
               '• Veja todas as recompensas ativas\n' +
               '• Valores das bounties\n' +
               '• Quem está procurado\n' +
               '• Rankings de criminosos',
        inline: false
      },
      {
        name: '🎯 `/capture` (Apenas em Servidores)',
        value: '**Capturar Procurado**\n' +
               '• Tente capturar um criminoso\n' +
               '• 50% de chance de sucesso\n' +
               '• Ganhe a recompensa se sucesso\n' +
               '• Cooldown após tentativa',
        inline: false
      },
      {
        name: '❌ `/clearbounty` (Apenas em Servidores)',
        value: '**Limpar Recompensa**\n' +
               '• Remove bounty de um jogador\n' +
               '• Apenas admins\n' +
               '• Limpa o cartaz de procurado\n' +
               '• Restaura status normal',
        inline: false
      },
      {
        name: '⚙️ `/setwanted` (Admin)',
        value: '**Configurar Sistema**\n' +
               '• Define canal de wanted posters\n' +
               '• Configurações do sistema\n' +
               '• Apenas administradores',
        inline: false
      }
    );
}

function getAdminEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xF39C12)
    .setTitle('⚙️ Administração do Servidor')
    .setDescription(
      '**Comandos exclusivos para administradores!**\n\n' +
      '🛡️ Requer permissões de admin\n' +
      '🎛️ Configurações do servidor\n' +
      '💸 Gerenciamento de economia\n' +
      '📢 Sistema de anúncios avançado'
    )
    .setFooter({ text: 'Comandos Administrativos' })
    .addFields(
      {
        name: '📢 `/announcement` (Apenas em Servidores)',
        value: '**Sistema de Anúncios Avançado**\n' +
               '• Preview com confirmação (✅/❌)\n' +
               '• 8 presets de cores western\n' +
               '• Thumbnails e imagens customizadas\n' +
               '• Targeting: @everyone, @here, roles\n' +
               '• Sistema de templates salvos\n' +
               '• Histórico de 100 anúncios\n' +
               '• Botões interativos opcionais',
        inline: false
      },
      {
        name: '💰 Comandos de Economia',
        value: '**Gerenciamento de Moedas:**\n' +
               '`/addsilver` - Adiciona Silver Coins\n' +
               '`/addgold` - Adiciona Gold Bars\n' +
               '`/addtokens` - Adiciona Saloon Tokens\n' +
               '`/removegold` - Remove Gold Bars\n' +
               '`/addbackpack` - Aumenta capacidade de mochila',
        inline: false
      },
      {
        name: '🎟️ `/generatecode` (Owner Only)',
        value: '**Gerar Códigos de Resgate**\n' +
               '• Cria códigos únicos\n' +
               '• Define recompensas\n' +
               '• Para promoções e eventos\n' +
               '• Apenas donos do bot',
        inline: false
      },
      {
        name: '🏦 `/middleman` (Apenas em Servidores)',
        value: '**Sistema de Intermediação**\n' +
               '• Facilita trocas seguras\n' +
               '• Previne scams\n' +
               '• Trocas entre jogadores\n' +
               '• Log de transações',
        inline: false
      },
      {
        name: '⚙️ Configurações do Servidor',
        value: '**Setup Commands:**\n' +
               '`/servidor` - Info do servidor\n' +
               '`/setwelcome` - Mensagens de boas-vindas\n' +
               '`/setlogs` - Canal de logs\n' +
               '`/setwanted` - Sistema de bounty\n' +
               '`/setuptoken` - Configurar tokens\n' +
               '`/idioma` - Mudar idioma\n' +
               '`/migrate` - Migração de dados',
        inline: false
      }
    );
}

function getUtilityEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x95A5A6)
    .setTitle('🔧 Comandos de Utilidade')
    .setDescription(
      '**Ferramentas úteis e informações do bot!**\n\n' +
      '📊 Status e informações\n' +
      '🌐 Configurações gerais\n' +
      '❓ Ajuda e suporte\n' +
      '⚡ Performance'
    )
    .setFooter({ text: 'Comandos de Utilidade' })
    .addFields(
      {
        name: '📱 `/help` (Funciona em DM)',
        value: '**Guia de Comandos**\n' +
               '• Este menu interativo!\n' +
               '• Navegação por categorias\n' +
               '• Descrições detalhadas\n' +
               '• Indica comandos com suporte DM\n' +
               '• Links úteis (suporte, convite, site)',
        inline: false
      },
      {
        name: '📱 `/ping` (Funciona em DM)',
        value: '**Latência do Bot**\n' +
               '• Verifica tempo de resposta\n' +
               '• Latency da API do Discord\n' +
               '• Status de conexão\n' +
               '• Útil para diagnósticos',
        inline: false
      },
      {
        name: '🌐 `/idioma` (Apenas em Servidores)',
        value: '**Mudar Idioma**\n' +
               '• PT-BR (Português Brasil)\n' +
               '• EN-US (English)\n' +
               '• ES-ES (Español)\n' +
               '• Configuração por servidor',
        inline: false
      },
      {
        name: '📊 `/servidor` (Apenas em Servidores)',
        value: '**Informações do Servidor**\n' +
               '• Estatísticas do servidor\n' +
               '• Contagem de membros\n' +
               '• Data de criação\n' +
               '• Configurações ativas',
        inline: false
      }
    );
}

function getCategoryButtons(currentCategory: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_economy')
        .setLabel('💰 Economia')
        .setStyle(currentCategory === CATEGORIES.ECONOMY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.ECONOMY),
      new ButtonBuilder()
        .setCustomId('help_gambling')
        .setLabel('🎲 Gambling')
        .setStyle(currentCategory === CATEGORIES.GAMBLING ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.GAMBLING),
      new ButtonBuilder()
        .setCustomId('help_mining')
        .setLabel('⛏️ Mineração')
        .setStyle(currentCategory === CATEGORIES.MINING ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.MINING),
      new ButtonBuilder()
        .setCustomId('help_profile')
        .setLabel('👤 Perfil')
        .setStyle(currentCategory === CATEGORIES.PROFILE ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.PROFILE)
    );
}

function getSecondaryButtons(currentCategory: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_bounty')
        .setLabel('🔫 Bounty')
        .setStyle(currentCategory === CATEGORIES.BOUNTY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.BOUNTY),
      new ButtonBuilder()
        .setCustomId('help_admin')
        .setLabel('⚙️ Admin')
        .setStyle(currentCategory === CATEGORIES.ADMIN ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.ADMIN),
      new ButtonBuilder()
        .setCustomId('help_utility')
        .setLabel('🔧 Utilidade')
        .setStyle(currentCategory === CATEGORIES.UTILITY ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.UTILITY),
      new ButtonBuilder()
        .setCustomId('help_overview')
        .setLabel('🏠 Menu Inicial')
        .setStyle(currentCategory === CATEGORIES.OVERVIEW ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(currentCategory === CATEGORIES.OVERVIEW)
    );
}

function getLinkButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel('🆘 Suporte')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/gXwaYFNhfp'),
      new ButtonBuilder()
        .setLabel('➕ Adicionar Bot')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands'),
      new ButtonBuilder()
        .setLabel('🌐 Website')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://${process.env.REPLIT_DEV_DOMAIN || 'sheriff-bot.repl.co'}`)
    );
}

function getEmbedForCategory(category: string): EmbedBuilder {
  switch (category) {
    case CATEGORIES.ECONOMY:
      return getEconomyEmbed();
    case CATEGORIES.GAMBLING:
      return getGamblingEmbed();
    case CATEGORIES.MINING:
      return getMiningEmbed();
    case CATEGORIES.PROFILE:
      return getProfileEmbed();
    case CATEGORIES.BOUNTY:
      return getBountyEmbed();
    case CATEGORIES.ADMIN:
      return getAdminEmbed();
    case CATEGORIES.UTILITY:
      return getUtilityEmbed();
    default:
      return getOverviewEmbed();
  }
}

export = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their descriptions')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = getOverviewEmbed();
    const buttons = getCategoryButtons(CATEGORIES.OVERVIEW);
    const secondaryButtons = getSecondaryButtons(CATEGORIES.OVERVIEW);
    const linkButtons = getLinkButtons();

    const reply = await interaction.reply({
      embeds: [embed],
      components: [buttons, secondaryButtons, linkButtons],
      flags: MessageFlags.Ephemeral,
      fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000
    });

    collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({
          content: '❌ Apenas quem usou o comando pode navegar!',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const category = buttonInteraction.customId.replace('help_', '');
      const newEmbed = getEmbedForCategory(category);
      const newButtons = getCategoryButtons(category);
      const newSecondaryButtons = getSecondaryButtons(category);

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
