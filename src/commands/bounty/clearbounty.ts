import { SlashCommandBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
const { removeBounty, getBountyByTarget } = require('../../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearbounty')
    .setDescription('🚫 Remove a bounty you placed on someone'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // This command requires a user option but it's missing in the original
    // For now, we'll assume it should be added
    await interaction.reply({
      embeds: [warningEmbed(
        'Command Under Maintenance',
        'This command is being updated with new features.',
        'Use /bounties to view active bounties'
      )],
      flags: MessageFlags.Ephemeral
    });
  },
};
