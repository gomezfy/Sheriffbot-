import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits 
} from 'discord.js';
import { uploadCustomEmojis, listCustomEmojis } from '../../utils/emojiUploader';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uploademojis')
    .setDescription('Upload custom emojis from assets/custom-emojis folder to the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ 
        content: '❌ This command can only be used in a server!', 
        ephemeral: true 
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Faz upload dos emojis
      const results = await uploadCustomEmojis(interaction.guild);

      // Cria embed com os resultados
      const embed = new EmbedBuilder()
        .setColor(results.failed === 0 ? '#00FF00' : '#FFA500')
        .setTitle('🎨 Custom Emoji Upload Results')
        .setTimestamp();

      // Adiciona estatísticas
      embed.addFields(
        { 
          name: '✅ Successfully Uploaded/Updated', 
          value: `${results.success} emoji(s)`, 
          inline: true 
        },
        { 
          name: '❌ Failed', 
          value: `${results.failed} emoji(s)`, 
          inline: true 
        }
      );

      // Adiciona erros se houver
      if (results.errors.length > 0) {
        const errorText = results.errors.slice(0, 10).join('\n');
        embed.addFields({
          name: '⚠️ Errors',
          value: `\`\`\`${errorText}\`\`\``,
          inline: false
        });

        if (results.errors.length > 10) {
          embed.setFooter({ text: `... and ${results.errors.length - 10} more errors` });
        }
      }

      // Lista os emojis disponíveis
      const availableEmojis = listCustomEmojis();
      if (availableEmojis.length > 0) {
        embed.addFields({
          name: '📋 Available Custom Emojis',
          value: availableEmojis.map(name => `\`${name}\``).join(', '),
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error: any) {
      console.error('Error uploading emojis:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Upload Failed')
        .setDescription(`An error occurred while uploading emojis:\n\`\`\`${error.message}\`\`\``)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
