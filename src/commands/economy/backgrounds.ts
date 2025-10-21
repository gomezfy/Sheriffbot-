import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from 'discord.js';
import { 
  getAllBackgrounds, 
  getUserBackgrounds, 
  userOwnsBackground, 
  getRarityColor, 
  getRarityEmoji,
  getUserCurrentBackground
} from '../../utils/backgroundManager';
import { getUserSilver } from '../../utils/dataManager';
import { Colors } from '../../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backgrounds')
    .setDescription('🎨 View and manage profile backgrounds')
    .addSubcommand(subcommand =>
      subcommand
        .setName('shop')
        .setDescription('View all available backgrounds for purchase')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('owned')
        .setDescription('View your owned backgrounds')
    ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'shop') {
      await showBackgroundShop(interaction);
    } else if (subcommand === 'owned') {
      await showOwnedBackgrounds(interaction);
    }
  },
};

async function showBackgroundShop(interaction: ChatInputCommandInteraction): Promise<void> {
  const allBackgrounds = getAllBackgrounds();
  const userSilver = getUserSilver(interaction.user.id);
  
  const embed = new EmbedBuilder()
    .setColor(Colors.GOLD)
    .setTitle('🎨 Background Shop')
    .setDescription(`**Your Silver:** 🪙 ${userSilver.toLocaleString()} Silver Coins\n\nPurchase backgrounds to customize your profile!`)
    .setFooter({ text: 'Use buttons below to purchase backgrounds' })
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
  
  if (purchasableBackgrounds.length > 0) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    for (const bg of purchasableBackgrounds) {
      const canAfford = userSilver >= bg.price;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_bg_${bg.id}`)
          .setLabel(`Buy ${bg.name}`)
          .setEmoji(getRarityEmoji(bg.rarity))
          .setStyle(canAfford ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(!canAfford)
      );
    }
    
    await interaction.reply({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}

async function showOwnedBackgrounds(interaction: ChatInputCommandInteraction): Promise<void> {
  const ownedBackgrounds = getUserBackgrounds(interaction.user.id);
  const currentBg = getUserCurrentBackground(interaction.user.id);
  
  const embed = new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle('🎨 Your Owned Backgrounds')
    .setDescription(`You own **${ownedBackgrounds.length}** background${ownedBackgrounds.length !== 1 ? 's' : ''}`)
    .setFooter({ text: 'Use /profile to change your active background' })
    .setTimestamp();
  
  if (ownedBackgrounds.length === 0) {
    embed.addFields({
      name: 'No Backgrounds',
      value: 'You don\'t own any backgrounds yet! Check `/backgrounds shop` to purchase some.'
    });
  } else {
    const bgList = ownedBackgrounds.map(bg => {
      const emoji = getRarityEmoji(bg.rarity);
      const active = currentBg?.id === bg.id ? '⭐ **ACTIVE**' : '';
      return `${emoji} **${bg.name}** ${active}\n${bg.description}`;
    }).join('\n\n');
    
    embed.addFields({
      name: 'Your Collection',
      value: bgList
    });
  }
  
  await interaction.reply({ embeds: [embed] });
}
