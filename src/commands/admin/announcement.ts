import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits, 
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  TextChannel,
  Role
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { 
  getCowboyEmoji, 
  getScrollEmoji, 
  getCancelEmoji, 
  getCheckEmoji, 
  getTimerEmoji 
} from '../../utils/customEmojis';

interface AnnouncementData {
  templates: Record<string, Template>;
  history: HistoryEntry[];
}

interface Template {
  name: string;
  title: string;
  message: string;
  color: string;
  thumbnail?: string;
  image?: string;
  footer?: string;
}

interface HistoryEntry {
  id: string;
  guildId: string;
  channelId: string;
  authorId: string;
  authorTag: string;
  title: string;
  timestamp: number;
}

const DATA_PATH = path.join(__dirname, '../../data/announcements.json');

function loadData(): AnnouncementData {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const defaultData: AnnouncementData = { templates: {}, history: [] };
      fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch (error) {
    return { templates: {}, history: [] };
  }
}

function saveData(data: AnnouncementData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function addToHistory(guildId: string, channelId: string, authorId: string, authorTag: string, title: string): void {
  // Always reload data to prevent race conditions
  const data = loadData();
  
  data.history.unshift({
    id: Date.now().toString(),
    guildId,
    channelId,
    authorId,
    authorTag,
    title,
    timestamp: Date.now()
  });
  
  // Keep only last 100 entries per guild
  const guildHistory = data.history.filter(h => h.guildId === guildId);
  const otherHistory = data.history.filter(h => h.guildId !== guildId);
  data.history = [...guildHistory.slice(0, 100), ...otherHistory];
  
  saveData(data);
}

const COLOR_PRESETS: Record<string, { name: string; hex: string }> = {
  gold: { name: '🟡 Gold Rush', hex: '#FFD700' },
  red: { name: '🔴 Wanted Poster', hex: '#DC143C' },
  green: { name: '🟢 Sheriff Badge', hex: '#2ECC71' },
  blue: { name: '🔵 Saloon Night', hex: '#3498DB' },
  purple: { name: '🟣 Royal Poker', hex: '#9B59B6' },
  orange: { name: '🟠 Desert Sunset', hex: '#E67E22' },
  brown: { name: '🟤 Western Leather', hex: '#8B4513' },
  silver: { name: '⚪ Silver Coin', hex: '#C0C0C0' }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement')
    .setDescription('🤠 Advanced announcement system with templates and preview')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('send')
        .setDescription('Send an advanced announcement with preview')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to send the announcement')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('title')
            .setDescription('Announcement title')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('message')
            .setDescription('Announcement message (supports \\n for new lines)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('color_preset')
            .setDescription('Choose a Western-themed color preset')
            .addChoices(
              { name: '🟡 Gold Rush (Default)', value: 'gold' },
              { name: '🔴 Wanted Poster', value: 'red' },
              { name: '🟢 Sheriff Badge', value: 'green' },
              { name: '🔵 Saloon Night', value: 'blue' },
              { name: '🟣 Royal Poker', value: 'purple' },
              { name: '🟠 Desert Sunset', value: 'orange' },
              { name: '🟤 Western Leather', value: 'brown' },
              { name: '⚪ Silver Coin', value: 'silver' }
            )
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('thumbnail')
            .setDescription('Thumbnail URL (small image on top-right)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('image')
            .setDescription('Large image URL (banner at bottom)')
            .setRequired(false)
        )
        .addRoleOption(option =>
          option
            .setName('mention_role')
            .setDescription('Role to mention (optional)')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('mention_everyone')
            .setDescription('Mention @everyone (use with caution)')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('mention_here')
            .setDescription('Mention @here (online members)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('footer')
            .setDescription('Custom footer text (optional)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('template')
        .setDescription('Manage announcement templates')
        .addStringOption(option =>
          option
            .setName('action')
            .setDescription('Action to perform')
            .addChoices(
              { name: 'Create', value: 'create' },
              { name: 'Edit', value: 'edit' },
              { name: 'List', value: 'list' },
              { name: 'Use', value: 'use' },
              { name: 'Delete', value: 'delete' }
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Template name')
            .setRequired(false)
        )
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to send (for "use" action)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('edit_field')
            .setDescription('The template field to edit')
            .setRequired(false)
            .addChoices(
              { name: 'Title', value: 'title' },
              { name: 'Message', value: 'message' },
              { name: 'Color', value: 'color' },
              { name: 'Thumbnail', value: 'thumbnail' },
              { name: 'Image', value: 'image' },
              { name: 'Footer', value: 'footer' }
            )
        )
        .addStringOption(option =>
          option
            .setName('new_value')
            .setDescription('The new value for the selected field')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('history')
        .setDescription('View announcement history')
        .addIntegerOption(option =>
          option
            .setName('limit')
            .setDescription('Number of recent announcements to show (default: 10)')
            .setMinValue(1)
            .setMaxValue(25)
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'send') {
      await handleSend(interaction);
    } else if (subcommand === 'template') {
      await handleTemplate(interaction);
    } else if (subcommand === 'history') {
      await handleHistory(interaction);
    }
  },
};

async function handleSend(interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.options.getChannel('channel', true);
  const title = interaction.options.getString('title', true);
  let message = interaction.options.getString('message', true);
  const colorPreset = interaction.options.getString('color_preset') || 'gold';
  const thumbnail = interaction.options.getString('thumbnail');
  const image = interaction.options.getString('image');
  const mentionRole = interaction.options.getRole('mention_role') as Role | null;
  const mentionEveryone = interaction.options.getBoolean('mention_everyone') || false;
  const mentionHere = interaction.options.getBoolean('mention_here') || false;
  const customFooter = interaction.options.getString('footer');

  // Replace \n with actual newlines
  message = message.replace(/\\n/g, '\n');

  // Validate channel type
  if (!channel || !('send' in channel)) {
    await interaction.reply({
      content: `${getCancelEmoji()} The channel must be a text channel!`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Validate permissions for @everyone/@here
  if (mentionEveryone || mentionHere) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.MentionEveryone)) {
      await interaction.reply({
        content: `${getCancelEmoji()} You need the "Mention Everyone" permission to use @everyone or @here mentions!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
  }

  // Get color from preset
  const colorHex = COLOR_PRESETS[colorPreset]?.hex || '#FFD700';
  const color = parseInt(colorHex.replace('#', ''), 16);

  // Build preview embed
  const previewEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`📢 ${title}`)
    .setDescription(message)
    .setTimestamp();

  if (thumbnail) previewEmbed.setThumbnail(thumbnail);
  if (image) previewEmbed.setImage(image);
  
  const footerText = customFooter || `Announced by ${interaction.user.tag}`;
  previewEmbed.setFooter({ text: footerText });

  // Build mention string
  let mentionText = '';
  if (mentionEveryone) mentionText = '@everyone ';
  else if (mentionHere) mentionText = '@here ';
  else if (mentionRole) mentionText = `${mentionRole} `;

  // Create confirmation buttons
  const confirmRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_announcement')
        .setLabel(`${getCheckEmoji()} Confirm & Send`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel_announcement')
        .setLabel(`${getCancelEmoji()} Cancel`)
        .setStyle(ButtonStyle.Danger)
    );

  // Send preview
  const previewMessage = await interaction.reply({
    content: `**📋 Preview of announcement:**\n${mentionText ? `**Mentions:** ${mentionText}` : ''}`,
    embeds: [previewEmbed],
    components: [confirmRow],
    flags: MessageFlags.Ephemeral
  });

  // Wait for button interaction
  try {
    const buttonInteraction = await previewMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000 // 1 minute
    });

    if (buttonInteraction.customId === 'confirm_announcement') {
      // Send the announcement
      const finalEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`📢 ${title}`)
        .setDescription(message)
        .setFooter({ text: footerText })
        .setTimestamp();

      if (thumbnail) finalEmbed.setThumbnail(thumbnail);
      if (image) finalEmbed.setImage(image);

      const sendOptions: any = { embeds: [finalEmbed] };
      if (mentionText) {
        sendOptions.content = mentionText.trim();
        if (mentionEveryone || mentionHere) {
          // Both @everyone and @here require 'everyone' in allowedMentions.parse
          sendOptions.allowedMentions = { parse: ['everyone'] };
        }
      }

      await (channel as TextChannel).send(sendOptions);

      // Save to history (reload data to avoid race condition)
      addToHistory(interaction.guildId!, channel.id, interaction.user.id, interaction.user.tag, title);

      // Update confirmation
      await buttonInteraction.update({
        content: `✅ **Announcement sent successfully to ${channel}!**`,
        embeds: [],
        components: []
      });
    } else {
      // Cancelled
      await buttonInteraction.update({
        content: '❌ Announcement cancelled.',
        embeds: [],
        components: []
      });
    }
  } catch (error) {
    // Timeout
    await interaction.editReply({
      content: '⏱️ Announcement preview expired. Please try again.',
      embeds: [],
      components: []
    });
  }
}

async function handleTemplate(interaction: ChatInputCommandInteraction): Promise<void> {
  const action = interaction.options.getString('action', true);
  const name = interaction.options.getString('name');

  if (name && (name === '__proto__' || name === 'constructor' || name === 'prototype')) {
    await interaction.reply({
        content: '❌ Invalid template name.',
        flags: MessageFlags.Ephemeral
    });
    return;
  }
  const channel = interaction.options.getChannel('channel');

  const data = loadData();

  if (action === 'create') {
    if (!name) {
      await interaction.reply({
        content: '❌ Please provide a template name!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (data.templates[name]) {
      await interaction.reply({
        content: `❌ A template named "${name}" already exists! Use a different name or delete the existing one first.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Create interactive template builder using Modal would be ideal,
    // but for simplicity we'll provide a quick JSON-based approach
    const exampleTemplate: Template = {
      name: name,
      title: 'Your Title Here',
      message: 'Your message here\nSupports multiple lines',
      color: '#FFD700',
      thumbnail: undefined,
      image: undefined,
      footer: `Template: ${name}`
    };

    data.templates[name] = exampleTemplate;
    saveData(data);

    await interaction.reply({
        content: `✅ **Template "${name}" created!**\n\nUse \`/announcement template action:edit name:${name} ...\` to modify it.`,
        flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (action === 'edit') {
    const field = interaction.options.getString('edit_field');
    const value = interaction.options.getString('new_value');

    if (!name || !field || value === null) {
        await interaction.reply({
            content: '❌ For editing, you must provide the template name, the field to edit, and the new value!',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (!data.templates[name]) {
        await interaction.reply({
            content: `❌ Template "${name}" not found!`,
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    (data.templates[name] as any)[field] = value;
    saveData(data);

    await interaction.reply({
        content: `✅ Template "${name}" updated! Field \`${field}\` is now set to \`${value}\`.`,
        flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (action === 'list') {
    const templates = Object.values(data.templates);
    if (templates.length === 0) {
      await interaction.reply({
        content: '📝 No templates saved yet.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📝 Saved Announcement Templates')
      .setDescription(templates.map(t => `**${t.name}**\n└ ${t.title}`).join('\n\n'))
      .setFooter({ text: `Total: ${templates.length} templates` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  if (action === 'use') {
    if (!name || !channel) {
      await interaction.reply({
        content: '❌ Please provide both template name and channel!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const template = data.templates[name];
    if (!template) {
      await interaction.reply({
        content: `❌ Template "${name}" not found!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Send template announcement
    const color = parseInt(template.color.replace('#', ''), 16);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📢 ${template.title}`)
      .setDescription(template.message)
      .setFooter({ text: template.footer || `Announced by ${interaction.user.tag}` })
      .setTimestamp();

    if (template.thumbnail) embed.setThumbnail(template.thumbnail);
    if (template.image) embed.setImage(template.image);

    if (!('send' in channel)) {
      await interaction.reply({
        content: '❌ The channel must be a text channel!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await (channel as TextChannel).send({ embeds: [embed] });

    // Save to history
    addToHistory(interaction.guildId!, channel.id, interaction.user.id, interaction.user.tag, template.title);

    await interaction.reply({
      content: `✅ Template "${name}" sent to ${channel}!`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (action === 'delete') {
    if (!name) {
      await interaction.reply({
        content: '❌ Please provide a template name!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!data.templates[name]) {
      await interaction.reply({
        content: `❌ Template "${name}" not found!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    delete data.templates[name];
    saveData(data);

    await interaction.reply({
      content: `✅ Template "${name}" deleted!`,
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleHistory(interaction: ChatInputCommandInteraction): Promise<void> {
  const limit = interaction.options.getInteger('limit') || 10;
  const data = loadData();

  const guildHistory = data.history.filter(h => h.guildId === interaction.guildId);

  if (guildHistory.length === 0) {
    await interaction.reply({
      content: '📜 No announcement history found for this server.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const entries = guildHistory.slice(0, limit);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('📜 Announcement History')
    .setDescription(
      entries.map((entry, i) => {
        const date = new Date(entry.timestamp);
        return `**${i + 1}.** ${entry.title}\n└ By ${entry.authorTag} in <#${entry.channelId}>\n└ <t:${Math.floor(entry.timestamp / 1000)}:R>`;
      }).join('\n\n')
    )
    .setFooter({ text: `Showing ${entries.length} of ${guildHistory.length} announcements` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
