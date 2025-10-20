import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { addItem } from '../../utils/inventoryManager';
import * as fs from 'fs';
import * as path from 'path';

const OWNER_ID = process.env.OWNER_ID;
const economyFile = path.join(__dirname, '..', '..', '..', 'data', 'economy.json');
const backupFile = path.join(__dirname, '..', '..', '..', 'data', 'economy.backup.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('migrate')
    .setDescription('[OWNER ONLY] Migrate old economy.json balances to new inventory system')
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({ 
        content: '❌ This command is only available to the bot owner!', 
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!fs.existsSync(economyFile)) {
        await interaction.editReply({ 
          content: '❌ Economy file not found! Nothing to migrate.' 
        });
        return;
      }
      
      const economyData: Record<string, number> = JSON.parse(fs.readFileSync(economyFile, 'utf8'));
      
      let migrated = 0;
      let failed = 0;
      const errors: string[] = [];

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

      fs.copyFileSync(economyFile, backupFile);
      
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
        content: `❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  },
};
