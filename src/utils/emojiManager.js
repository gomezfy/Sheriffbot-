// Função para obter o emoji do Saloon Token
function getSaloonTokenEmoji(guild) {
  if (!guild) return '🪙'; // Fallback para emoji padrão
  
  const emoji = guild.emojis.cache.find(e => e.name === 'saloon_token');
  return emoji ? emoji.toString() : '🪙';
}

module.exports = { getSaloonTokenEmoji };
