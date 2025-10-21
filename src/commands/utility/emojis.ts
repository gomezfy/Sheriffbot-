import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { CUSTOM_EMOJIS, getAllEmojis, getEmojisByCategory } from '../../utils/customEmojis';
import { Colors } from '../../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojis')
    .setDescription('🎨 View all custom cowboy emojis available!')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Filter by category')
        .setRequired(false)
        .addChoices(
          { name: '😊 Reactions', value: 'REACTIONS' },
          { name: '✨ Positive', value: 'POSITIVE' },
          { name: '😢 Negative', value: 'NEGATIVE' },
          { name: '👋 Greetings', value: 'GREETINGS' },
          { name: '🎬 Actions', value: 'ACTIONS' },
          { name: '👤 Characters', value: 'CHARACTERS' },
          { name: '🎮 Activities', value: 'ACTIVITIES' },
          { name: '🔫 Items', value: 'ITEMS' },
          { name: '🌟 Symbols', value: 'SYMBOLS' }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString('category') as keyof typeof CUSTOM_EMOJIS | null;

    let emojis = category 
      ? getEmojisByCategory(category)
      : getAllEmojis();

    const embed = new EmbedBuilder()
      .setColor(Colors.GOLD)
      .setTitle('🤠 Sheriff Rex Custom Emojis')
      .setDescription(category 
        ? `**Category:** ${category.charAt(0) + category.slice(1).toLowerCase()}`
        : '**All Categories**')
      .setFooter({ text: `Total: ${emojis.length} custom emojis • Use /emojis category:<name> to filter` })
      .setTimestamp();

    // Group emojis by category if showing all
    if (!category) {
      const categories = Object.keys(CUSTOM_EMOJIS) as Array<keyof typeof CUSTOM_EMOJIS>;
      
      for (const cat of categories) {
        const catEmojis = getEmojisByCategory(cat);
        const emojiList = catEmojis.slice(0, 5).map(e => {
          const icon = e.animated ? '🎬' : '🖼️';
          return `${icon} **${e.name}**`;
        }).join('\n');
        
        const more = catEmojis.length > 5 ? `\n*...and ${catEmojis.length - 5} more*` : '';
        
        embed.addFields({
          name: `${getCategoryIcon(cat)} ${cat.charAt(0) + cat.slice(1).toLowerCase()} (${catEmojis.length})`,
          value: emojiList + more,
          inline: true
        });
      }
    } else {
      // Show all emojis in the selected category
      const emojiList = emojis.map((e, idx) => {
        const icon = e.animated ? '🎬' : '🖼️';
        return `${icon} **${e.name}** - ${e.description}`;
      }).join('\n');

      embed.addFields({
        name: `Emojis in ${category}`,
        value: emojiList || 'No emojis found'
      });
    }

    embed.addFields({
      name: '💡 How to Use',
      value: 'Custom emojis are automatically used throughout the bot in various commands, messages, and reactions to enhance your Wild West experience!',
      inline: false
    });

    await interaction.reply({ embeds: [embed] });
  },
};

function getCategoryIcon(category: keyof typeof CUSTOM_EMOJIS): string {
  const icons: Record<keyof typeof CUSTOM_EMOJIS, string> = {
    REACTIONS: '😊',
    POSITIVE: '✨',
    NEGATIVE: '😢',
    GREETINGS: '👋',
    ACTIONS: '🎬',
    CHARACTERS: '👤',
    ACTIVITIES: '🎮',
    ITEMS: '🔫',
    SYMBOLS: '🌟'
  };
  return icons[category] || '🤠';
}
