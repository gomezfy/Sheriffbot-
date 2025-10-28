import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  ComponentType
} from 'discord.js';
import {
  createQueue,
  getQueue,
  playSong,
  pauseSong,
  resumeSong,
  skipSong,
  stopMusic,
  toggleLoop,
  toggleLoopQueue,
  searchSong,
  setVolume,
  getVolume,
  getCurrentTime,
  createProgressBar,
  formatDuration
} from '../../utils/musicQueue';
import { t, getLocale } from '../../utils/i18n';
import { applyLocalizations } from '../../utils/commandLocalizations';

const commandBuilder = new SlashCommandBuilder()
  .setName('music')
  .setDescription('🎵 Professional music player system')
  .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(option =>
          option
            .setName('song')
            .setDescription('Song name or YouTube URL')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('pause')
        .setDescription('Pause the current song')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('resume')
        .setDescription('Resume the paused song')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('skip')
        .setDescription('Skip to the next song')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop playing and clear the queue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('queue')
        .setDescription('Show the current music queue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('nowplaying')
        .setDescription('Show the currently playing song')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('loop')
        .setDescription('Toggle loop for current song')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('loopqueue')
        .setDescription('Toggle loop for entire queue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('volume')
        .setDescription('Set the player volume (0-100)')
        .addIntegerOption(option =>
          option
            .setName('level')
            .setDescription('Volume level (0-100)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(100)
        )
    );

module.exports = {
  data: applyLocalizations(commandBuilder, 'music'),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'play':
        await handlePlay(interaction);
        break;
      case 'pause':
        await handlePause(interaction);
        break;
      case 'resume':
        await handleResume(interaction);
        break;
      case 'skip':
        await handleSkip(interaction);
        break;
      case 'stop':
        await handleStop(interaction);
        break;
      case 'queue':
        await handleQueue(interaction);
        break;
      case 'nowplaying':
        await handleNowPlaying(interaction);
        break;
      case 'loop':
        await handleLoop(interaction);
        break;
      case 'loopqueue':
        await handleLoopQueue(interaction);
        break;
      case 'volume':
        await handleVolume(interaction);
        break;
    }
  }
};

function createNowPlayingEmbed(guildId: string, interaction: any): EmbedBuilder | null {
  const queue = getQueue(guildId);
  if (!queue || queue.songs.length === 0) return null;

  const song = queue.songs[0];
  const currentTime = getCurrentTime(guildId);
  const progress = createProgressBar(currentTime, song.durationInSec, 25);
  
  const currentTimeStr = formatDuration(currentTime);
  const totalTimeStr = song.duration;
  
  const statusIcon = queue.playing ? '▶️' : '⏸️';
  const statusText = queue.playing ? t(interaction, 'music_status_playing') : t(interaction, 'music_status_paused');
  const loopText = queue.loop 
    ? t(interaction, 'music_loop_mode_song') 
    : queue.loopQueue 
    ? t(interaction, 'music_loop_mode_queue') 
    : t(interaction, 'music_loop_mode_normal');
  
  const embed = new EmbedBuilder()
    .setColor(0x1DB954)
    .setAuthor({ 
      name: t(interaction, 'music_now_playing'), 
      iconURL: 'https://cdn.discordapp.com/attachments/placeholder/music-note.png' 
    })
    .setTitle(song.title)
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .setDescription(
      `${statusIcon} **${t(interaction, 'music_status')}:** ${statusText}\n` +
      `${loopText}\n` +
      `${t(interaction, 'music_volume')}: ${queue.volume}%\n\n` +
      `\`${currentTimeStr}\` ${progress} \`${totalTimeStr}\``
    )
    .addFields(
      { name: t(interaction, 'music_requested_by'), value: `<@${song.requestedBy}>`, inline: true },
      { name: t(interaction, 'music_queue_count'), value: `${queue.songs.length} ${t(interaction, 'music_songs')}`, inline: true },
      { name: t(interaction, 'music_duration'), value: totalTimeStr, inline: true }
    )
    .setFooter({ text: t(interaction, 'music_use_buttons') })
    .setTimestamp();

  return embed;
}

async function handlePlay(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    await interaction.editReply({
      content: t(interaction, 'music_need_voice_channel')
    });
    return;
  }

  const query = interaction.options.getString('song', true);

  await interaction.editReply({
    content: t(interaction, 'music_searching')
  });

  const song = await searchSong(query);

  if (!song) {
    await interaction.editReply({
      content: t(interaction, 'music_not_found')
    });
    return;
  }

  song.requestedBy = interaction.user.id;
  song.requestedByTag = interaction.user.tag;

  let queue = getQueue(interaction.guildId!);

  if (!queue) {
    queue = await createQueue(
      interaction.guild!,
      voiceChannel,
      interaction.channel as any
    );
    queue.songs.push(song);
    await playSong(interaction.guildId!);

    const rows = createPlayerControls(interaction);
    const embed = createNowPlayingEmbed(interaction.guildId!, interaction);

    const reply = await interaction.editReply({
      content: '',
      embeds: embed ? [embed] : [],
      components: rows
    });

    setupControlsCollector(reply, interaction.guildId!, interaction);
    startProgressUpdater(reply, interaction.guildId!, interaction);
  } else {
    queue.songs.push(song);

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(t(interaction, 'music_added_to_queue'))
      .setDescription(`**[${song.title}](${song.url})**`)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: t(interaction, 'music_duration'), value: song.duration, inline: true },
        { name: t(interaction, 'music_position_in_queue'), value: `#${queue.songs.length}`, inline: true },
        { name: t(interaction, 'music_requested_by'), value: `<@${song.requestedBy}>`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({
      content: '',
      embeds: [embed]
    });
  }
}

async function handlePause(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const paused = pauseSong(interaction.guildId!);

  if (paused) {
    await interaction.reply({
      content: t(interaction, 'music_paused'),
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: t(interaction, 'music_could_not_pause'),
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleResume(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const resumed = resumeSong(interaction.guildId!);

  if (resumed) {
    await interaction.reply({
      content: t(interaction, 'music_resumed'),
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: t(interaction, 'music_could_not_resume'),
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleSkip(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const skipped = skipSong(interaction.guildId!);

  if (skipped) {
    await interaction.reply({
      content: t(interaction, 'music_skipped'),
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: t(interaction, 'music_could_not_skip'),
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleStop(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  stopMusic(interaction.guildId!);

  await interaction.reply({
    content: t(interaction, 'music_stopped'),
    flags: MessageFlags.Ephemeral
  });
}

async function handleQueue(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_queue_empty'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const currentSong = queue.songs[0];
  const upcomingSongs = queue.songs.slice(1, 11);

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(t(interaction, 'music_queue_title'))
    .setThumbnail(currentSong.thumbnail)
    .addFields({
      name: t(interaction, 'music_now_playing_label'),
      value: `**[${currentSong.title}](${currentSong.url})**\n${t(interaction, 'music_duration')}: ${currentSong.duration} | ${t(interaction, 'music_requested_by')}: <@${currentSong.requestedBy}>`,
      inline: false
    })
    .setTimestamp();

  if (upcomingSongs.length > 0) {
    const queueText = upcomingSongs
      .map((song, index) => `**${index + 1}.** [${song.title}](${song.url})\n${t(interaction, 'music_duration')}: ${song.duration} | ${t(interaction, 'music_requested_by')}: <@${song.requestedBy}>`)
      .join('\n\n');

    embed.addFields({
      name: t(interaction, 'music_up_next'),
      value: queueText,
      inline: false
    });

    if (queue.songs.length > 11) {
      embed.setFooter({ text: t(interaction, 'music_and_more').replace('{count}', `${queue.songs.length - 11}`) });
    }
  }

  if (queue.loop) {
    embed.addFields({
      name: t(interaction, 'music_loop_mode_song'),
      value: '**' + t(interaction, 'music_status_playing') + '**',
      inline: true
    });
  } else if (queue.loopQueue) {
    embed.addFields({
      name: t(interaction, 'music_loop_mode_queue'),
      value: '**' + t(interaction, 'music_status_playing') + '**',
      inline: true
    });
  }

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

async function handleNowPlaying(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const embed = createNowPlayingEmbed(interaction.guildId!, interaction);
  const rows = createPlayerControls(interaction);

  const reply = await interaction.reply({
    embeds: embed ? [embed] : [],
    components: rows,
    fetchReply: true
  });

  setupControlsCollector(reply, interaction.guildId!, interaction);
  startProgressUpdater(reply, interaction.guildId!, interaction);
}

async function handleLoop(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const loopEnabled = toggleLoop(interaction.guildId!);

  await interaction.reply({
    content: loopEnabled ? t(interaction, 'music_loop_song_enabled') : t(interaction, 'music_loop_disabled'),
    flags: MessageFlags.Ephemeral
  });
}

async function handleLoopQueue(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const loopEnabled = toggleLoopQueue(interaction.guildId!);

  await interaction.reply({
    content: loopEnabled ? t(interaction, 'music_loop_queue_enabled') : t(interaction, 'music_loop_disabled'),
    flags: MessageFlags.Ephemeral
  });
}

async function handleVolume(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: t(interaction, 'music_nothing_playing'),
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const volume = interaction.options.getInteger('level', true);
  setVolume(interaction.guildId!, volume);

  await interaction.reply({
    content: t(interaction, 'music_volume_set').replace('{volume}', `${volume}`),
    flags: MessageFlags.Ephemeral
  });
}

function createPlayerControls(interaction: any): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setLabel(t(interaction, 'music_btn_pause_resume'))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel(t(interaction, 'music_btn_skip'))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setLabel(t(interaction, 'music_btn_loop'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setLabel(t(interaction, 'music_btn_queue'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel(t(interaction, 'music_btn_stop'))
      .setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('music_volume_down')
      .setLabel(t(interaction, 'music_btn_volume_down'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_volume_up')
      .setLabel(t(interaction, 'music_btn_volume_up'))
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

function startProgressUpdater(message: any, guildId: string, interaction: any): void {
  const updateInterval = setInterval(async () => {
    const queue = getQueue(guildId);
    if (!queue || queue.songs.length === 0) {
      clearInterval(updateInterval);
      return;
    }

    const embed = createNowPlayingEmbed(guildId, interaction);
    if (embed) {
      try {
        await message.edit({
          embeds: [embed],
          components: message.components
        });
      } catch (error) {
        clearInterval(updateInterval);
      }
    } else {
      clearInterval(updateInterval);
    }
  }, 10000);

  setTimeout(() => clearInterval(updateInterval), 600000);
}

function setupControlsCollector(message: any, guildId: string, interaction: any): void {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 600000
  });

  collector.on('collect', async (i: any) => {
    const queue = getQueue(guildId);

    if (!queue) {
      await i.reply({
        content: t(i, 'music_nothing_playing'),
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    switch (i.customId) {
      case 'music_pause_resume':
        if (queue.playing) {
          pauseSong(guildId);
          await i.reply({
            content: t(i, 'music_paused'),
            flags: MessageFlags.Ephemeral
          });
        } else {
          resumeSong(guildId);
          await i.reply({
            content: t(i, 'music_resumed'),
            flags: MessageFlags.Ephemeral
          });
        }
        break;

      case 'music_skip':
        skipSong(guildId);
        await i.reply({
          content: t(i, 'music_skipped'),
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_loop':
        const loopEnabled = toggleLoop(guildId);
        await i.reply({
          content: loopEnabled ? t(i, 'music_loop_song_enabled') : t(i, 'music_loop_disabled'),
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_queue':
        const currentSong = queue.songs[0];
        const upcomingSongs = queue.songs.slice(1, 6);

        let queueText = `**${t(i, 'music_now_playing_label')}:**\n[${currentSong.title}](${currentSong.url})\n\n`;

        if (upcomingSongs.length > 0) {
          queueText += `**${t(i, 'music_up_next')}:**\n`;
          upcomingSongs.forEach((song, index) => {
            queueText += `${index + 1}. [${song.title}](${song.url})\n`;
          });

          if (queue.songs.length > 6) {
            queueText += `\n_${t(i, 'music_more_songs').replace('{count}', `${queue.songs.length - 6}`)}_`;
          }
        }

        await i.reply({
          content: queueText,
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_stop':
        stopMusic(guildId);
        await i.reply({
          content: t(i, 'music_stopped'),
          flags: MessageFlags.Ephemeral
        });
        collector.stop();
        break;

      case 'music_volume_up':
        const currentVolumeUp = getVolume(guildId);
        const newVolumeUp = Math.min(100, currentVolumeUp + 10);
        setVolume(guildId, newVolumeUp);
        const locale = getLocale(i);
        const volumeUpText = locale === 'pt-BR' ? `🔊 Volume: ${newVolumeUp}%`
          : locale === 'es-ES' ? `🔊 Volumen: ${newVolumeUp}%`
          : locale === 'fr' ? `🔊 Volume: ${newVolumeUp}%`
          : `🔊 Volume: ${newVolumeUp}%`;
        await i.reply({
          content: volumeUpText,
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_volume_down':
        const currentVolumeDown = getVolume(guildId);
        const newVolumeDown = Math.max(0, currentVolumeDown - 10);
        setVolume(guildId, newVolumeDown);
        const localeDown = getLocale(i);
        const volumeDownText = localeDown === 'pt-BR' ? `🔉 Volume: ${newVolumeDown}%`
          : localeDown === 'es-ES' ? `🔉 Volumen: ${newVolumeDown}%`
          : localeDown === 'fr' ? `🔉 Volume: ${newVolumeDown}%`
          : `🔉 Volume: ${newVolumeDown}%`;
        await i.reply({
          content: volumeDownText,
          flags: MessageFlags.Ephemeral
        });
        break;
    }
  });
}
