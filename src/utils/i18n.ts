import { ChatInputCommandInteraction } from 'discord.js';

const translations: Record<string, Record<string, string>> = {
  'pt-BR': {
    cooldown: 'Devagar, parceiro! Até os cavalos precisam descansar. Volta daqui a {time}! 🐴',
    error: 'Essa não, parceiro! Meu cavalo tropeçou e derrubou tudo... 🤠',
    inventory_full: 'Peraí, cowboy! Tá carregando o rancho inteiro nas costas? Libera espaço aí! 🎒',
    daily_claimed: 'Opa, cowboy ganancioso! Já passou por aqui hoje. Volte daqui a {time} que tem mais! 💰',
    daily_success: 'Olha só quem chegou no saloon! Aqui está suas {amount} Moedas de Prata, parceiro! 🍻',
    daily_title: '🎁 BAÚ DIÁRIO DO VELHO OESTE',
    daily_description: 'Volte amanhã que o xerife deixa mais moedas no cofre! 🤠',
    daily_footer: 'Não gasta tudo com whisky, viu parceiro? 🥃',
    daily_cooldown_title: '⏰ O GALO AINDA NÃO CANTOU!',
    daily_cooldown_desc: 'Calma lá, cowboy! Já passou aqui hoje pegando suas moedas!\n\n**Volta quando o sol nascer de novo:** {time}',
    daily_cooldown_footer: 'Vai descansar um pouco, até o xerife dorme! 😴',
    mine_cooldown: 'Você está cansado demais para minerar! Volte em: **{time}**',
    mine_title: 'MINERAÇÃO DE OURO',
    mine_choose: 'Escolha seu método de mineração:',
    mine_solo: 'Mineração Solo',
    mine_solo_desc: 'Duração: 50 minutos\nRecompensa: 1-3 Barras de Ouro\nRisco: Baixo',
    mine_coop: 'Mineração Cooperativa',
    mine_coop_desc: 'Duração: 2 horas\nRecompensa: 4-6 Barras de Ouro (divididas)\nRisco: Alto',
    mine_gold_value: '1 Barra de Ouro = {value} Moedas de Prata',
    mine_progress: 'Minerando ouro...',
    mine_success: 'Você minerou {amount} Barra(s) de Ouro!',
    mine_value: 'Valor',
    mine_next: 'Próxima Mineração',
    mine_good_work: 'Bom trabalho, parceiro!',
    silver_coins: 'Moedas de Prata',
    gold_bars: 'Barras de Ouro',
    weight: 'Peso',
    time_minutes: '{min} minutos',
    time_hours: '{hours}h {min}m',
  },
  'en-US': {
    cooldown: 'Whoa there, cowpoke! Even the fastest guns need a break. Come back in {time}! 🐴',
    error: 'Well butter my biscuit! My horse done kicked the bucket... 🤠',
    inventory_full: 'Hold up, partner! You carrying the whole ranch on your back? Lighten that load! 🎒',
    daily_claimed: 'Easy there, greedy gunslinger! Already got your gold today. Mosey back in {time}! 💰',
    daily_success: 'Well I\'ll be! Look who rode into the saloon! Here\'s your {amount} Silver Coins, partner! 🍻',
    daily_title: '🎁 WILD WEST DAILY TREASURE',
    daily_description: 'Ride back tomorrow when the sheriff refills the vault! 🤠',
    daily_footer: 'Don\'t spend it all on whisky now, ya hear? 🥃',
    daily_cooldown_title: '⏰ THE ROOSTER AIN\'T CROWED YET!',
    daily_cooldown_desc: 'Simmer down, cowboy! You done grabbed your coins already!\n\n**Come back when the sun rises again:** {time}',
    daily_cooldown_footer: 'Go rest your spurs, even outlaws need sleep! 😴',
    mine_cooldown: 'You\'re too tired to mine! Come back in: **{time}**',
    mine_title: 'GOLD MINING',
    mine_choose: 'Choose your mining method:',
    mine_solo: 'Solo Mining',
    mine_solo_desc: 'Duration: 50 minutes\nReward: 1-3 Gold Bars\nRisk: Low',
    mine_coop: 'Cooperative Mining',
    mine_coop_desc: 'Duration: 2 hours\nReward: 4-6 Gold Bars (split)\nRisk: High',
    mine_gold_value: '1 Gold Bar = {value} Silver Coins',
    mine_progress: 'Mining for gold...',
    mine_success: 'You mined {amount} Gold Bar(s)!',
    mine_value: 'Value',
    mine_next: 'Next Mining',
    mine_good_work: 'Good work, partner!',
    silver_coins: 'Silver Coins',
    gold_bars: 'Gold Bars',
    weight: 'Weight',
    time_minutes: '{min} minutes',
    time_hours: '{hours}h {min}m',
  },
  'es-ES': {
    cooldown: '¡Tranquilo, vaquero! Hasta los caballos necesitan siesta. ¡Vuelve en {time}! 🐴',
    error: '¡Caramba, compadre! Mi caballo tropezó y tiró todo... 🤠',
    inventory_full: '¡Oye vaquero! ¿Llevas el rancho entero en la espalda? ¡Libera espacio! 🎒',
    daily_claimed: '¡Ey, pistolero codicioso! Ya pasaste hoy. Vuelve en {time} que habrá más! 💰',
    daily_success: '¡Mira quién llegó al saloon! ¡Aquí tienes tus {amount} Monedas de Plata, compadre! 🍻',
    daily_title: '🎁 COFRE DIARIO DEL VIEJO OESTE',
    daily_description: '¡Vuelve mañana que el sheriff deja más monedas! 🤠',
    daily_footer: '¡No lo gastes todo en tequila, eh compadre! 🥃',
    daily_cooldown_title: '⏰ ¡EL GALLO NO HA CANTADO AÚN!',
    daily_cooldown_desc: '¡Calma vaquero! Ya agarraste tus monedas hoy!\n\n**Vuelve cuando salga el sol otra vez:** {time}',
    daily_cooldown_footer: '¡Ve a descansar, hasta los forajidos duermen! 😴',
    mine_cooldown: '¡Estás muy cansado para minar! Vuelve en: **{time}**',
    mine_title: 'MINERÍA DE ORO',
    mine_choose: 'Elige tu método de minería:',
    mine_solo: 'Minería Solo',
    mine_solo_desc: 'Duración: 50 minutos\nRecompensa: 1-3 Barras de Oro\nRiesgo: Bajo',
    mine_coop: 'Minería Cooperativa',
    mine_coop_desc: 'Duración: 2 horas\nRecompensa: 4-6 Barras de Oro (divididas)\nRiesgo: Alto',
    mine_gold_value: '1 Barra de Oro = {value} Monedas de Plata',
    mine_progress: 'Minando oro...',
    mine_success: '¡Minaste {amount} Barra(s) de Oro!',
    mine_value: 'Valor',
    mine_next: 'Próxima Minería',
    mine_good_work: '¡Buen trabajo, compadre!',
    silver_coins: 'Monedas de Plata',
    gold_bars: 'Barras de Oro',
    weight: 'Peso',
    time_minutes: '{min} minutos',
    time_hours: '{hours}h {min}m',
  }
};

export function getLocale(interaction: ChatInputCommandInteraction): string {
  const locale = interaction.locale || 'en-US';
  
  if (locale.startsWith('pt')) return 'pt-BR';
  if (locale.startsWith('es')) return 'es-ES';
  
  return 'en-US';
}

export function t(interaction: ChatInputCommandInteraction, key: string, params: Record<string, any> = {}): string {
  const locale = getLocale(interaction);
  let text = translations[locale][key] || translations['en-US'][key] || key;
  
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}

export { translations };
