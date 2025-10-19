const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addItem } = require('../../utils/inventoryManager');
const { readData, writeData } = require('../../utils/database');
const path = require('path');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('migrate')
    .setDescription('[OWNER ONLY] Migrate old economy.json balances to new inventory system')
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
      

      const economyData = JSON.parse(fs.readFileSync(economyFile, 'utf8'));
      
      let migrated = 0;
      let failed = 0;
      let errors = [];

      for (const [userId, balance] of Object.entries(economyData)) {
        if (balance > 0) {
          const result = addItem(userId, 'saloon_token', balance);
          
          if (result.success) {
            migrated++;
          } else {
            failed++;
            errors.push(`User ${userId}: ${result.error}`);
          }
        }
      }

      // Backup old economy file
      fs.copyFileSync(economyFile, backupFile);
      
      // Clear economy file
      fs.writeFileSync(economyFile, JSON.stringify({}, null, 2));

      const embed = new EmbedBuilder()
        .setColor(failed > 0 ? '#FFD700' : '#00FF00')
        .setTitle('✅ Migration Complete!')
        .setDescription(`Successfully migrated old economy balances to inventory system.`)
        .addFields(
          { name: '✅ Successfully Migrated', value: `${migrated} users`, inline: true },
          { name: '❌ Failed', value: `${failed} users`, inline: true },
          { name: '📁 Backup', value: `economy.backup.json`, inline: false }
        )
        .setTimestamp();

      if (errors.length > 0 && errors.length <= 5) {
        embed.addFields({ 
          name: '⚠️ Errors', 
          value: errors.slice(0, 5).join('\n') 
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Migration error:', error);
      await interaction.editReply({ 
        content: `❌ Migration failed: ${error.message}` 
      });
    }
  },
};
