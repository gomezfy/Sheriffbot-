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
  getVolume
} from '../../utils/musicQueue';

module.exports = {
  data: new SlashCommandBuilder()
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
    ),

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

async function handlePlay(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    await interaction.editReply({
      content: '❌ You need to be in a voice channel to play music!'
    });
    return;
  }

  const query = interaction.options.getString('song', true);

  await interaction.editReply({
    content: '🔍 Searching for your song...'
  });

  const song = await searchSong(query);

  if (!song) {
    await interaction.editReply({
      content: '❌ Could not find that song. Please try again with a different search term.'
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

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎵 Now Playing')
      .setDescription(`**[${song.title}](${song.url})**`)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: '⏱️ Duration', value: song.duration, inline: true },
        { name: '👤 Requested by', value: `<@${song.requestedBy}>`, inline: true }
      )
      .setTimestamp();

    const rows = createPlayerControls();

    const reply = await interaction.editReply({
      content: '',
      embeds: [embed],
      components: rows
    });

    setupControlsCollector(reply, interaction.guildId!);
  } else {
    queue.songs.push(song);

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('➕ Added to Queue')
      .setDescription(`**[${song.title}](${song.url})**`)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: '⏱️ Duration', value: song.duration, inline: true },
        { name: '📊 Position in Queue', value: `#${queue.songs.length}`, inline: true },
        { name: '👤 Requested by', value: `<@${song.requestedBy}>`, inline: true }
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
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const paused = pauseSong(interaction.guildId!);

  if (paused) {
    await interaction.reply({
      content: '⏸️ Paused the music!',
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: '❌ Could not pause the music.',
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleResume(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const resumed = resumeSong(interaction.guildId!);

  if (resumed) {
    await interaction.reply({
      content: '▶️ Resumed the music!',
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: '❌ Could not resume the music.',
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleSkip(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const skipped = skipSong(interaction.guildId!);

  if (skipped) {
    await interaction.reply({
      content: '⏭️ Skipped the current song!',
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: '❌ Could not skip the song.',
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleStop(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  stopMusic(interaction.guildId!);

  await interaction.reply({
    content: '⏹️ Stopped the music and cleared the queue!',
    flags: MessageFlags.Ephemeral
  });
}

async function handleQueue(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ The queue is empty!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const currentSong = queue.songs[0];
  const upcomingSongs = queue.songs.slice(1, 11);

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle('🎵 Music Queue')
    .setThumbnail(currentSong.thumbnail)
    .addFields({
      name: '🎵 Now Playing',
      value: `**[${currentSong.title}](${currentSong.url})**\n⏱️ ${currentSong.duration} | 👤 <@${currentSong.requestedBy}>`,
      inline: false
    })
    .setTimestamp();

  if (upcomingSongs.length > 0) {
    const queueText = upcomingSongs
      .map((song, index) => `**${index + 1}.** [${song.title}](${song.url})\n⏱️ ${song.duration} | 👤 <@${song.requestedBy}>`)
      .join('\n\n');

    embed.addFields({
      name: '📋 Up Next',
      value: queueText,
      inline: false
    });

    if (queue.songs.length > 11) {
      embed.setFooter({ text: `And ${queue.songs.length - 11} more songs...` });
    }
  }

  if (queue.loop) {
    embed.addFields({
      name: '🔂 Loop Status',
      value: '**Current Song** is looping',
      inline: true
    });
  } else if (queue.loopQueue) {
    embed.addFields({
      name: '🔁 Loop Status',
      value: '**Queue** is looping',
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
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const song = queue.songs[0];

  const embed = new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle('🎵 Now Playing')
    .setDescription(`**[${song.title}](${song.url})**`)
    .setThumbnail(song.thumbnail)
    .addFields(
      { name: '⏱️ Duration', value: song.duration, inline: true },
      { name: '👤 Requested by', value: `<@${song.requestedBy}>`, inline: true },
      { name: '▶️ Status', value: queue.playing ? 'Playing' : 'Paused', inline: true }
    )
    .setTimestamp();

  if (queue.loop) {
    embed.addFields({
      name: '🔂 Loop',
      value: 'Enabled',
      inline: true
    });
  } else if (queue.loopQueue) {
    embed.addFields({
      name: '🔁 Queue Loop',
      value: 'Enabled',
      inline: true
    });
  }

  const rows = createPlayerControls();

  const reply = await interaction.reply({
    embeds: [embed],
    components: rows,
    fetchReply: true
  });

  setupControlsCollector(reply, interaction.guildId!);
}

async function handleLoop(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const loopEnabled = toggleLoop(interaction.guildId!);

  await interaction.reply({
    content: loopEnabled ? '🔂 Loop enabled for current song!' : '🔂 Loop disabled!',
    flags: MessageFlags.Ephemeral
  });
}

async function handleLoopQueue(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const loopEnabled = toggleLoopQueue(interaction.guildId!);

  await interaction.reply({
    content: loopEnabled ? '🔁 Queue loop enabled!' : '🔁 Queue loop disabled!',
    flags: MessageFlags.Ephemeral
  });
}

async function handleVolume(interaction: ChatInputCommandInteraction): Promise<void> {
  const queue = getQueue(interaction.guildId!);

  if (!queue || queue.songs.length === 0) {
    await interaction.reply({
      content: '❌ Nothing is currently playing!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const volume = interaction.options.getInteger('level', true);
  setVolume(interaction.guildId!, volume);

  await interaction.reply({
    content: `🔊 Volume set to ${volume}%!`,
    flags: MessageFlags.Ephemeral
  });
}

function createPlayerControls(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setLabel('⏸️ Pause/Resume')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('⏭️ Skip')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setLabel('🔂 Loop')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setLabel('📋 Queue')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('⏹️ Stop')
      .setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('music_volume_down')
      .setLabel('🔉 -10%')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_volume_up')
      .setLabel('🔊 +10%')
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

function setupControlsCollector(message: any, guildId: string): void {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 600000
  });

  collector.on('collect', async (i: any) => {
    const queue = getQueue(guildId);

    if (!queue) {
      await i.reply({
        content: '❌ Nothing is currently playing!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    switch (i.customId) {
      case 'music_pause_resume':
        if (queue.playing) {
          pauseSong(guildId);
          await i.reply({
            content: '⏸️ Paused!',
            flags: MessageFlags.Ephemeral
          });
        } else {
          resumeSong(guildId);
          await i.reply({
            content: '▶️ Resumed!',
            flags: MessageFlags.Ephemeral
          });
        }
        break;

      case 'music_skip':
        skipSong(guildId);
        await i.reply({
          content: '⏭️ Skipped!',
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_loop':
        const loopEnabled = toggleLoop(guildId);
        await i.reply({
          content: loopEnabled ? '🔂 Loop enabled!' : '🔂 Loop disabled!',
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_queue':
        const currentSong = queue.songs[0];
        const upcomingSongs = queue.songs.slice(1, 6);

        let queueText = `**Now Playing:**\n[${currentSong.title}](${currentSong.url})\n\n`;

        if (upcomingSongs.length > 0) {
          queueText += '**Up Next:**\n';
          upcomingSongs.forEach((song, index) => {
            queueText += `${index + 1}. [${song.title}](${song.url})\n`;
          });

          if (queue.songs.length > 6) {
            queueText += `\n_+${queue.songs.length - 6} more songs_`;
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
          content: '⏹️ Stopped and cleared queue!',
          flags: MessageFlags.Ephemeral
        });
        collector.stop();
        break;

      case 'music_volume_up':
        const currentVolumeUp = getVolume(guildId);
        const newVolumeUp = Math.min(100, currentVolumeUp + 10);
        setVolume(guildId, newVolumeUp);
        await i.reply({
          content: `🔊 Volume: ${newVolumeUp}%`,
          flags: MessageFlags.Ephemeral
        });
        break;

      case 'music_volume_down':
        const currentVolumeDown = getVolume(guildId);
        const newVolumeDown = Math.max(0, currentVolumeDown - 10);
        setVolume(guildId, newVolumeDown);
        await i.reply({
          content: `🔉 Volume: ${newVolumeDown}%`,
          flags: MessageFlags.Ephemeral
        });
        break;
    }
  });
}
