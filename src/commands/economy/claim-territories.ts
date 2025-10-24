import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getUserTerritories } from '../../utils/territoryManager';
import { processTerritoryIncome, canClaimTerritoryIncome, getTimeUntilNextPayout } from '../../utils/territoryIncome';
import { errorEmbed, warningEmbed, successEmbed, formatDuration } from '../../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim-territories')
    .setDescription('🏛️ Claim daily income from your territories')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]), // Guild Install, User Install

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    
    // Check if user has territories
    const userTerritories = getUserTerritories(userId);
    
    if (userTerritories.length === 0) {
      const embed = warningEmbed(
        'No Territories',
        'You don\'t own any territories yet!\n\nUse `/territories` to browse and purchase valuable properties.',
        'Build your empire!'
      );
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Check cooldown
    if (!canClaimTerritoryIncome(userId)) {
      const timeRemaining = getTimeUntilNextPayout(userId);
      
      const embed = warningEmbed(
        'Already Claimed',
        `You already claimed your territory income!\n\n**Time remaining:** ${formatDuration(timeRemaining)}\n**Territories owned:** ${userTerritories.length}`,
        'Come back in 24 hours!'
      );
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Defer reply for processing
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    // Process income
    const success = await processTerritoryIncome(interaction.client, userId);
    
    if (success) {
      const embed = successEmbed(
        'Territory Income Claimed!',
        `Your territory profits have been sent to your DM!\n\n**Territories:** ${userTerritories.length}\n**Next claim:** 24 hours`,
        'Check your direct messages!'
      );
      
      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = errorEmbed(
        'Claim Failed',
        'There was an error processing your territory income. Please try again later.',
        'Contact support if this persists'
      );
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
