const { EmbedBuilder } = require('discord.js');

/**
 * Creates an animated progress bar for Discord commands
 * @param {Object} interaction - Discord interaction object
 * @param {String} title - Title of the progress bar
 * @param {String} description - Description text
 * @param {Number} duration - Total duration in milliseconds
 * @param {String} color - Hex color code (default: #B8860B)
 * @returns {Promise} - Resolves when progress bar completes
 */
async function showProgressBar(interaction, title, description, duration, color = '#B8860B') {
  const steps = 10;
  const stepDuration = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const percentage = Math.floor((i / steps) * 100);
    const filledBlocks = Math.floor((i / steps) * 20);
    const emptyBlocks = 20 - filledBlocks;
    const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(`**${description}**\n\n\`${progressBar}\` ${percentage}%`)
      .setTimestamp();
    
    try {
      if (i === 0) {
        await interaction.editReply({ embeds: [embed], components: [], files: [] });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error updating progress bar:', error);
    }
    
    if (i < steps) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }
}

/**
 * Creates a simple ASCII progress bar string
 * @param {Number} percentage - Progress percentage (0-100)
 * @param {Number} length - Length of the bar (default: 20)
 * @param {String} fillChar - Character for filled part (default: █)
 * @param {String} emptyChar - Character for empty part (default: ░)
 * @returns {String} - Progress bar string
 */
function createProgressBarString(percentage, length = 20, fillChar = '█', emptyChar = '░') {
  const filledBlocks = Math.floor((percentage / 100) * length);
  const emptyBlocks = length - filledBlocks;
  return fillChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks);
}

module.exports = {
  showProgressBar,
  createProgressBarString
};
