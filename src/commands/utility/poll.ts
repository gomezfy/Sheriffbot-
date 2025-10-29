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
      .setName('poll')
      .setDescription('Create a western-style poll in the saloon')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addStringOption(option =>
        option
          .setName('question')
          .setDescription('The question for the poll')
          .setRequired(true)
          .setMaxLength(300)
      )
      .addStringOption(option =>
        option
          .setName('option1')
          .setDescription('First option')
          .setRequired(true)
          .setMaxLength(55)
      )
      .addStringOption(option =>
        option
          .setName('option2')
          .setDescription('Second option')
          .setRequired(true)
          .setMaxLength(55)
      )
      .addStringOption(option =>
        option
          .setName('option3')
          .setDescription('Third option (optional)')
          .setRequired(false)
          .setMaxLength(55)
      )
      .addStringOption(option =>
        option
          .setName('option4')
          .setDescription('Fourth option (optional)')
          .setRequired(false)
          .setMaxLength(55)
      )
      .addStringOption(option =>
        option
          .setName('option5')
          .setDescription('Fifth option (optional)')
          .setRequired(false)
          .setMaxLength(55)
      )
      .addIntegerOption(option =>
        option
          .setName('duration')
          .setDescription('Poll duration in hours (1-168)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(168)
      )
      .addBooleanOption(option =>
        option
          .setName('multiple')
          .setDescription('Allow multiple selections?')
          .setRequired(false)
      ),
    'poll'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const option1 = interaction.options.getString('option1', true);
    const option2 = interaction.options.getString('option2', true);
    const option3 = interaction.options.getString('option3');
    const option4 = interaction.options.getString('option4');
    const option5 = interaction.options.getString('option5');
    const duration = interaction.options.getInteger('duration') || 24;
    const allowMultiple = interaction.options.getBoolean('multiple') || false;

    const westernEmojis = ['🤠', '🔫', '⭐', '💰', '🎯', '🏜️', '🍺', '🎰', '⚔️', '🐎'];
    
    const answers: Array<{ text: string; emoji?: string }> = [];
    const options = [option1, option2, option3, option4, option5].filter(opt => opt !== null);
    
    options.forEach((option, index) => {
      if (option) {
        answers.push({
          text: option,
          emoji: westernEmojis[index] || undefined
        });
      }
    });

    try {
      const pollData = {
        question: { text: `🤠 ${question}` },
        answers: answers,
        duration: duration,
        allowMultiselect: allowMultiple
      };

      const introEmbed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🎰 VOTAÇÃO NO SALOON')
        .setDescription(
          `**${interaction.user.displayName}** iniciou uma votação!\n\n` +
          `📊 **Pergunta:** ${question}\n` +
          `⏱️ **Duração:** ${duration} hora${duration > 1 ? 's' : ''}\n` +
          `🗳️ **Múltipla escolha:** ${allowMultiple ? 'Sim' : 'Não'}\n\n` +
          `*Vote abaixo, parceiro!*`
        )
        .setFooter({ text: 'Sheriff Bot - Sistema de Votações' })
        .setTimestamp();

      await interaction.reply({
        embeds: [introEmbed],
        poll: pollData
      });

      console.log(`✅ Poll created by ${interaction.user.tag}: "${question}"`);
      
    } catch (error: any) {
      console.error('Error creating poll:', error);
      
      await interaction.reply({
        content: t(interaction, 'error'),
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
