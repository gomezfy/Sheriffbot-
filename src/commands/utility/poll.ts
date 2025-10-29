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
      .setDescription('Poll system for the saloon')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addSubcommand(subcommand =>
        subcommand
          .setName('create')
          .setDescription('Create a custom poll with multiple options')
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
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('quick')
          .setDescription('Create a quick Yes/No/Maybe poll')
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
          )
      ),
    'poll'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'create') {
      await executeCreatePoll(interaction);
    } else if (subcommand === 'quick') {
      await executeQuickPoll(interaction);
    }
  },
};

async function executeCreatePoll(interaction: ChatInputCommandInteraction): Promise<void> {
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
}

async function executeQuickPoll(interaction: ChatInputCommandInteraction): Promise<void> {
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
}
