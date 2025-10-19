const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getUserSilver, removeUserSilver, addUserSilver, setUserSilver, addBounty, getBountyByTarget, removeContribution } = require('../../utils/dataManager');
const { generateWantedPoster } = require('../../utils/wantedPoster');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Place a bounty on another player')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The player to put a bounty on')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Silver Coins to offer as reward')
        .setRequired(true)
        .setMinValue(10)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    const poster = interaction.user;

    // Check if trying to bounty themselves
    if (target.id === poster.id) {
      return interaction.reply({ 
        content: '❌ You cannot place a bounty on yourself!', 
        ephemeral: true 
      });
    }

    // Check if target is a bot
    if (target.bot) {
      return interaction.reply({ 
        content: '❌ You cannot place a bounty on bots!', 
        ephemeral: true 
      });
    }

    // Check if poster has enough silver
    const posterSilver = getUserSilver(poster.id);
    if (posterSilver < amount) {
      return interaction.reply({ 
        content: `❌ You don't have enough coins! You have ${posterSilver} Silver Coins but need ${amount} Silver Coins.`, 
        ephemeral: true 
      });
    }

    // Defer reply since image generation takes time
    await interaction.deferReply();

    let silverDeducted = false;
    let bountyAdded = false;
    const posterBalanceBefore = getUserSilver(poster.id);

    try {
      // Remove silver from poster
      const removeResult = removeUserSilver(poster.id, amount);
      
      if (!removeResult.success) {
        return interaction.editReply({
          content: `❌ Failed to create bounty. ${removeResult.error || 'Could not deduct Silver Coins from your inventory.'}`,
          ephemeral: true
        });
      }
      
      silverDeducted = true;

      // Check if bounty already exists
      const existingBounty = getBountyByTarget(target.id);
      const isUpdate = !!existingBounty;

      // Add bounty
      addBounty(target.id, target.tag, poster.id, poster.tag, amount);
      bountyAdded = true;

      // Get updated bounty amount
      const updatedBounty = getBountyByTarget(target.id);

      // Generate wanted poster image
      const posterBuffer = await generateWantedPoster(target, updatedBounty.totalAmount);
      const attachment = new AttachmentBuilder(posterBuffer, { name: 'wanted.png' });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎯 WANTED POSTER CREATED!')
        .setDescription(isUpdate 
          ? `**${poster.tag}** increased the bounty on **${target.tag}**!` 
          : `**${poster.tag}** placed a bounty on **${target.tag}**!`
        )
        .addFields(
          { name: 'Target', value: `${target.tag}`, inline: true },
          { name: 'Total Bounty', value: `🪙 ${updatedBounty.totalAmount.toLocaleString()} Silver Coins`, inline: true },
          { name: 'Added', value: `🪙 ${amount.toLocaleString()} Silver Coins`, inline: true }
        )
        .setImage('attachment://wanted.png')
        .setFooter({ text: 'Use /claim to capture this bounty!' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], files: [attachment] });
      
    } catch (error) {
      console.error('Error creating wanted poster:', error);
      
      // Rollback logic based on what succeeded
      if (bountyAdded) {
        // Bounty was added, try to remove the contribution
        const rollbackSuccess = removeContribution(target.id, poster.id, amount);
        
        if (rollbackSuccess) {
          // Successfully removed contribution, refund the silver
          const refundResult = setUserSilver(poster.id, posterBalanceBefore);
          
          if (!refundResult.success) {
            await interaction.editReply({ 
              content: `❌ Failed to create wanted poster. Could not refund ${amount} Silver Coins - your inventory is too heavy! The coins were lost.`, 
              ephemeral: true 
            });
          } else {
            await interaction.editReply({ 
              content: '❌ Failed to create wanted poster. Your Silver Coins have been refunded.', 
              ephemeral: true 
            });
          }
        } else {
          // Could not remove contribution (bounty was claimed during generation)
          await interaction.editReply({ 
            content: '⚠️ Failed to create wanted poster, but the bounty was already claimed by someone else. Your Silver Coins contributed to the claimed bounty.', 
            ephemeral: true 
          });
        }
      } else if (silverDeducted) {
        // Silver was deducted but bounty was never added (addBounty failed)
        // Refund the silver since no bounty was created
        const refundResult = setUserSilver(poster.id, posterBalanceBefore);
        
        if (!refundResult.success) {
          await interaction.editReply({ 
            content: `❌ Failed to create wanted poster. Could not refund ${amount} Silver Coins - your inventory is too heavy! The coins were lost.`, 
            ephemeral: true 
          });
        } else {
          await interaction.editReply({ 
            content: '❌ Failed to create wanted poster. Your Silver Coins have been refunded.', 
            ephemeral: true 
          });
        }
      } else {
        // Error before silver was deducted (shouldn't happen, but safe fallback)
        await interaction.editReply({ 
          content: '❌ Failed to create wanted poster. No Silver Coins were deducted.', 
          ephemeral: true 
        });
      }
    }
  },
};
