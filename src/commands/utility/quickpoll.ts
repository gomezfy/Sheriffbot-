import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  MessageFlags,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { t } from '../../utils/i18n';
import { applyLocalizations } from '../../utils/commandLocalizations';

module.exports = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('quickpoll')
      .setDescription('Create a quick Yes/No poll')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addStringOption(option =>
        option
          .setName('question')
          .setDescription('The question for the poll')
          .setRequired(true)
          .setMaxLength(300)
      )
      .addIntegerOption(option =>
        option
          .setName('duration')
          .setDescription('Poll duration in hours (1-168)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(168)
      ),
    'quickpoll'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const duration = interaction.options.getInteger('duration') || 1;

    try {
      const pollData = {
        question: { text: `🤠 ${question}` },
        answers: [
          { text: 'Sim, parceiro!', emoji: '✅' },
          { text: 'Não, xerife!', emoji: '❌' },
          { text: 'Talvez...', emoji: '🤔' }
        ],
        duration: duration,
        allowMultiselect: false
      };

      const introEmbed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('⚡ VOTAÇÃO RÁPIDA')
        .setDescription(
          `**${interaction.user.displayName}** quer sua opinião!\n\n` +
          `📊 **Pergunta:** ${question}\n` +
          `⏱️ **Duração:** ${duration} hora${duration > 1 ? 's' : ''}\n\n` +
          `*Vote rápido, parceiro! O tempo tá passando!* 🏜️`
        )
        .setFooter({ text: 'Sheriff Bot - Votação Rápida' })
        .setTimestamp();

      await interaction.reply({
        embeds: [introEmbed],
        poll: pollData
      });

      console.log(`✅ Quick poll created by ${interaction.user.tag}: "${question}"`);
      
    } catch (error: any) {
      console.error('Error creating quick poll:', error);
      
      await interaction.reply({
        content: t(interaction, 'error'),
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
