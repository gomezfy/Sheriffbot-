const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { setUserBio } = require('../utils/profileManager');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle button interactions
    if (interaction.isButton()) {
      if (interaction.customId === 'edit_bio') {
        const modal = new ModalBuilder()
          .setCustomId('bio_modal')
          .setTitle('Edit Your Bio');

        const bioInput = new TextInputBuilder()
          .setCustomId('bio_text')
          .setLabel('About Me (max 200 characters)')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('A mysterious cowboy wandering the Wild West...')
          .setMaxLength(200)
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(bioInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'bio_modal') {
        const bioText = interaction.fields.getTextInputValue('bio_text');

        setUserBio(interaction.user.id, bioText);

        const embed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ Bio Updated!')
          .setDescription('Your profile bio has been updated successfully.')
          .addFields(
            { name: '📝 New Bio', value: bioText, inline: false }
          )
          .setFooter({ text: 'Use /profile to see your updated card' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
