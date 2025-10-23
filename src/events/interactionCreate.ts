import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, Interaction, MessageFlags, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, AttachmentBuilder } from 'discord.js';
import { setUserBio } from '../utils/profileManager';
import { getUserBackgrounds, purchaseBackground, setUserBackground as setBgActive, getBackgroundById, getRarityEmoji, getAllBackgrounds, userOwnsBackground, getRarityColor } from '../utils/backgroundManager';
import { getUserGold } from '../utils/dataManager';
import path from 'path';
import fs from 'fs';

async function showBackgroundCarousel(interaction: any, index: number, isUpdate: boolean = false): Promise<void> {
  const allBackgrounds = getAllBackgrounds();
  const bg = allBackgrounds[index];
  const userTokens = getUserGold(interaction.user.id);
  const owned = userOwnsBackground(interaction.user.id, bg.id);
  
  const embed = new EmbedBuilder()
    .setColor(getRarityColor(bg.rarity))
    .setTitle(`🛒 Background Shop`)
    .setDescription(
      `**${getRarityEmoji(bg.rarity)} ${bg.name}** - ${bg.rarity.toUpperCase()}\n\n` +
      `${bg.description}\n\n` +
      `**Price:** ${bg.free ? '✅ FREE' : `🎫 ${bg.price.toLocaleString()} Saloon Tokens`}\n` +
      `**Status:** ${owned ? '✅ Already Owned' : bg.free ? '✅ Available' : userTokens >= bg.price ? '💰 Can Purchase' : '❌ Not enough tokens'}\n\n` +
      `**Your Tokens:** 🎫 ${userTokens.toLocaleString()}`
    )
    .setFooter({ text: `Background ${index + 1} of ${allBackgrounds.length} • Use arrows to navigate` })
    .setTimestamp();
  
  // Add background image
  const backgroundsDir = path.join(process.cwd(), 'assets', 'profile-backgrounds');
  const bgPath = path.join(backgroundsDir, bg.filename);
  
  const files = [];
  if (fs.existsSync(bgPath)) {
    const attachment = new AttachmentBuilder(bgPath, { name: `preview.${bg.filename.split('.').pop()}` });
    files.push(attachment);
    embed.setImage(`attachment://preview.${bg.filename.split('.').pop()}`);
  }
  
  // Navigation and purchase buttons
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`carousel_prev_${index}`)
        .setLabel('◀ Back')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`buy_bg_${bg.id}_${index}`)
        .setLabel(owned ? 'Owned' : bg.free ? 'Free' : `Buy - ${bg.price} 🎫`)
        .setEmoji('🛒')
        .setStyle(owned ? ButtonStyle.Secondary : bg.free ? ButtonStyle.Success : userTokens >= bg.price ? ButtonStyle.Success : ButtonStyle.Danger)
        .setDisabled(owned || (bg.free === false && userTokens < bg.price)),
      new ButtonBuilder()
        .setCustomId(`carousel_next_${index}`)
        .setLabel('Next ▶')
        .setStyle(ButtonStyle.Secondary)
    );
  
  if (isUpdate) {
    await interaction.update({ embeds: [embed], files, components: [row] });
  } else {
    await interaction.reply({ embeds: [embed], files, components: [row], flags: MessageFlags.Ephemeral });
  }
}

export = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    if (interaction.isButton()) {
      // Edit Bio Button
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

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(bioInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }
      
      // Change Background Button
      if (interaction.customId === 'change_background') {
        const ownedBackgrounds = getUserBackgrounds(interaction.user.id);
        
        if (ownedBackgrounds.length === 0) {
          await interaction.reply({
            content: '❌ You don\'t own any backgrounds! Click "🛒 Shop Backgrounds" to purchase some.',
            flags: MessageFlags.Ephemeral
          });
          return;
        }
        
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('select_background')
          .setPlaceholder('Choose a background...')
          .addOptions(
            ownedBackgrounds.map(bg =>
              new StringSelectMenuOptionBuilder()
                .setLabel(bg.name)
                .setDescription(bg.description.substring(0, 100))
                .setValue(bg.id)
                .setEmoji(getRarityEmoji(bg.rarity))
            )
          );
        
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎨 Select Background')
          .setDescription('Choose a background from your collection:')
          .setFooter({ text: 'Your profile will update automatically' });
        
        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
      }
      
      // Shop Backgrounds Button - Show carousel
      if (interaction.customId === 'shop_backgrounds') {
        await showBackgroundCarousel(interaction, 0);
      }
      
      // Carousel Navigation
      if (interaction.customId.startsWith('carousel_')) {
        const [_, action, indexStr] = interaction.customId.split('_');
        const currentIndex = parseInt(indexStr);
        
        if (action === 'next' || action === 'prev') {
          const allBackgrounds = getAllBackgrounds();
          let newIndex = currentIndex;
          
          if (action === 'next') {
            newIndex = (currentIndex + 1) % allBackgrounds.length;
          } else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = allBackgrounds.length - 1;
          }
          
          await showBackgroundCarousel(interaction, newIndex, true);
        }
      }
      
      // Purchase Background Buttons from carousel
      if (interaction.customId.startsWith('buy_bg_')) {
        const parts = interaction.customId.split('_');
        const bgId = parts.slice(2, -1).join('_'); // Handle IDs with underscores
        const currentIndex = parseInt(parts[parts.length - 1]);
        const background = getBackgroundById(bgId);
        
        if (!background) {
          await interaction.reply({ content: '❌ Background not found!', flags: MessageFlags.Ephemeral });
          return;
        }
        
        const userTokens = getUserGold(interaction.user.id);
        const result = purchaseBackground(interaction.user.id, bgId);
        
        if (result.success) {
          // Show success message temporarily
          const successEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Purchase Successful!')
            .setDescription(result.message)
            .addFields(
              { name: '🎨 Background', value: background.name, inline: true },
              { name: '💰 Price', value: `🎫 ${background.price.toLocaleString()}`, inline: true },
              { name: '💳 Remaining', value: `🎫 ${(userTokens - background.price).toLocaleString()}`, inline: true }
            )
            .setFooter({ text: 'Returning to shop...' })
            .setTimestamp();
          
          await interaction.update({ embeds: [successEmbed], files: [], components: [] });
          
          // Wait 2 seconds then return to carousel with updated state
          setTimeout(async () => {
            await showBackgroundCarousel(interaction, currentIndex, true);
          }, 2000);
        } else {
          // Show error briefly then return to carousel
          const errorEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('❌ Purchase Failed')
            .setDescription(result.message)
            .setFooter({ text: 'Returning to shop...' });
          
          await interaction.update({ embeds: [errorEmbed], files: [], components: [] });
          
          // Wait 2 seconds then return to carousel
          setTimeout(async () => {
            await showBackgroundCarousel(interaction, currentIndex, true);
          }, 2000);
        }
      }
    }
    
    // Select Menu Handler
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_background') {
        const selectedBgId = interaction.values[0];
        const background = getBackgroundById(selectedBgId);
        
        if (!background) {
          await interaction.reply({ content: '❌ Background not found!', flags: MessageFlags.Ephemeral });
          return;
        }
        
        const result = setBgActive(interaction.user.id, selectedBgId);
        
        if (result.success) {
          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Background Changed!')
            .setDescription(result.message)
            .addFields(
              { name: '🎨 Active Background', value: `${getRarityEmoji(background.rarity)} ${background.name}`, inline: false }
            )
            .setFooter({ text: 'Use /profile to see your updated card' })
            .setTimestamp();
          
          await interaction.update({ embeds: [embed], components: [] });
        } else {
          await interaction.reply({ content: `❌ ${result.message}`, flags: MessageFlags.Ephemeral });
        }
      }
    }

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

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    }
  },
};
