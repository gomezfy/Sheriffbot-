const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setuptoken')
    .setDescription('[OWNER ONLY] Add Saloon Token emoji to the server')
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // Check if user is owner
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ 
        content: '❌ This command is only available to the bot owner!', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      
      // Check if emoji already exists
      const existingEmoji = guild.emojis.cache.find(emoji => emoji.name === 'saloon_token');
      
      if (existingEmoji) {
        return interaction.editReply({ 
          content: `✅ Saloon Token emoji already exists: ${existingEmoji}` 
        });
      }

      // Create the emoji
      const tokenImagePath = path.join(__dirname, '..', '..', '..', 'assets', 'saloon-token.png');
      const emoji = await guild.emojis.create({
        attachment: tokenImagePath,
        name: 'saloon_token',
        reason: 'Saloon Token currency emoji for the bot'
      });

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✅ Emoji Created Successfully!')
        .setDescription(`The Saloon Token emoji has been added to the server!\n\n**Emoji:** ${emoji}\n**Name:** \`:saloon_token:\`\n**ID:** \`${emoji.id}\``)
        .setThumbnail(emoji.url)
        .setFooter({ text: 'All commands will now use this emoji!' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error creating emoji:', error);
      
      let errorMessage = '❌ Error creating emoji. ';
      
      if (error.code === 50013) {
        errorMessage += 'The bot does not have permission to manage emojis. Make sure the bot has the "Manage Emojis and Stickers" permission.';
      } else if (error.code === 30008) {
        errorMessage += 'The server has reached the maximum emoji limit.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      await interaction.editReply({ content: errorMessage });
    }
  },
};
