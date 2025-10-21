import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, Interaction, MessageFlags, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { setUserBio } from '../utils/profileManager';
import { getUserBackgrounds, purchaseBackground, setUserBackground as setBgActive, getBackgroundById, getRarityEmoji, getAllBackgrounds, userOwnsBackground, getRarityColor } from '../utils/backgroundManager';
import { getUserSilver } from '../utils/dataManager';

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
      
      // Shop Backgrounds Button
      if (interaction.customId === 'shop_backgrounds') {
        const allBackgrounds = getAllBackgrounds();
        const userSilver = getUserSilver(interaction.user.id);
        
        const embed = new EmbedBuilder()
          .setColor('#F1C40F')
          .setTitle('🛒 Background Shop')
          .setDescription(`**Your Silver:** 🪙 ${userSilver.toLocaleString()} Silver Coins\n\nPurchase backgrounds to customize your profile!`)
          .setFooter({ text: 'Click a button below to purchase' })
          .setTimestamp();
        
        // Group by rarity
        const rarities = ['common', 'rare', 'epic', 'legendary'];
        
        for (const rarity of rarities) {
          const bgsOfRarity = allBackgrounds.filter(bg => bg.rarity === rarity);
          if (bgsOfRarity.length === 0) continue;
          
          const bgList = bgsOfRarity.map(bg => {
            const owned = userOwnsBackground(interaction.user.id, bg.id);
            const emoji = getRarityEmoji(bg.rarity);
            const priceText = bg.free ? 'FREE' : `🪙 ${bg.price.toLocaleString()}`;
            const status = owned ? '✅ Owned' : priceText;
            
            return `${emoji} **${bg.name}**\n${bg.description}\n💰 ${status}`;
          }).join('\n\n');
          
          embed.addFields({
            name: `${getRarityEmoji(rarity)} ${rarity.toUpperCase()} Backgrounds`,
            value: bgList,
            inline: false
          });
        }
        
        // Create buttons for purchasable backgrounds (up to 5)
        const purchasableBackgrounds = allBackgrounds
          .filter(bg => !bg.free && !userOwnsBackground(interaction.user.id, bg.id))
          .slice(0, 5);
        
        const components = [];
        
        if (purchasableBackgrounds.length > 0) {
          const row = new ActionRowBuilder<ButtonBuilder>();
          
          for (const bg of purchasableBackgrounds) {
            const canAfford = userSilver >= bg.price;
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`buy_bg_${bg.id}`)
                .setLabel(`${bg.name}`)
                .setEmoji(getRarityEmoji(bg.rarity))
                .setStyle(canAfford ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(!canAfford)
            );
          }
          
          components.push(row);
        }
        
        await interaction.reply({ embeds: [embed], components, flags: MessageFlags.Ephemeral });
      }
      
      // Purchase Background Buttons
      if (interaction.customId.startsWith('buy_bg_')) {
        const bgId = interaction.customId.replace('buy_bg_', '');
        const background = getBackgroundById(bgId);
        
        if (!background) {
          await interaction.reply({ content: '❌ Background not found!', flags: MessageFlags.Ephemeral });
          return;
        }
        
        const userSilver = getUserSilver(interaction.user.id);
        const result = purchaseBackground(interaction.user.id, bgId);
        
        if (result.success) {
          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Purchase Successful!')
            .setDescription(result.message)
            .addFields(
              { name: '🎨 Background', value: background.name, inline: true },
              { name: '💰 Price', value: `🪙 ${background.price.toLocaleString()}`, inline: true },
              { name: '💳 Remaining', value: `🪙 ${(userSilver - background.price).toLocaleString()}`, inline: true }
            )
            .setFooter({ text: 'Use /profile to change your background' })
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('❌ Purchase Failed')
            .setDescription(result.message)
            .setFooter({ text: 'Earn more silver coins to purchase backgrounds' });
          
          await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
