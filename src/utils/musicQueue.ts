import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
  AudioResource
} from '@discordjs/voice';
import { VoiceBasedChannel, Guild, TextChannel } from 'discord.js';
import playdl from 'play-dl';

export interface Song {
  title: string;
  url: string;
  duration: string;
  durationInSec: number;
  thumbnail: string;
  requestedBy: string;
  requestedByTag: string;
}

export interface ServerQueue {
  textChannel: TextChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection | null;
  songs: Song[];
  player: AudioPlayer;
  volume: number;
  playing: boolean;
  loop: boolean;
  loopQueue: boolean;
  currentResource: AudioResource<null> | null;
  startTime: number | null;
}

const queues = new Map<string, ServerQueue>();

export async function createQueue(
  guild: Guild,
  voiceChannel: VoiceBasedChannel,
  textChannel: TextChannel
): Promise<ServerQueue> {
  const player = createAudioPlayer();
  
  const queue: ServerQueue = {
    textChannel,
    voiceChannel,
    connection: null,
    songs: [],
    player,
    volume: 50,
    playing: false,
    loop: false,
    loopQueue: false,
    currentResource: null,
    startTime: null
  };

  queues.set(guild.id, queue);

  player.on(AudioPlayerStatus.Idle, () => {
    handleSongEnd(guild.id);
  });

  player.on('error', error => {
    console.error(`Audio player error in ${guild.id}:`, error);
    handleSongEnd(guild.id);
  });

  return queue;
}

export function getQueue(guildId: string): ServerQueue | undefined {
  return queues.get(guildId);
}

export function deleteQueue(guildId: string): void {
  const queue = queues.get(guildId);
  if (queue) {
    if (queue.connection) {
      queue.connection.destroy();
    }
    queue.player.stop();
    queues.delete(guildId);
  }
}

export async function playSong(guildId: string): Promise<void> {
  const queue = getQueue(guildId);
  if (!queue || queue.songs.length === 0) {
    deleteQueue(guildId);
    return;
  }

  const song = queue.songs[0];
  queue.playing = true;

  try {
    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: queue.voiceChannel.id,
        guildId: guildId,
        adapterCreator: queue.voiceChannel.guild.voiceAdapterCreator as any
      });

      queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(queue.connection!, VoiceConnectionStatus.Signalling, 5_000),
            entersState(queue.connection!, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          deleteQueue(guildId);
        }
      });

      queue.connection.subscribe(queue.player);
    }

    const stream = await playdl.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });

    if (resource.volume) {
      resource.volume.setVolumeLogarithmic(queue.volume / 100);
    }

    queue.currentResource = resource;
    queue.startTime = Date.now();
    queue.player.play(resource);
  } catch (error) {
    console.error('Error playing song:', error);
    queue.songs.shift();
    if (queue.songs.length > 0) {
      await playSong(guildId);
    } else {
      deleteQueue(guildId);
    }
  }
}

function handleSongEnd(guildId: string): void {
  const queue = getQueue(guildId);
  if (!queue) return;

  if (queue.loop && queue.songs.length > 0) {
    playSong(guildId);
  } else if (queue.loopQueue && queue.songs.length > 0) {
    const song = queue.songs.shift()!;
    queue.songs.push(song);
    playSong(guildId);
  } else {
    queue.songs.shift();
    if (queue.songs.length > 0) {
      playSong(guildId);
    } else {
      deleteQueue(guildId);
    }
  }
}

export function pauseSong(guildId: string): boolean {
  const queue = getQueue(guildId);
  if (!queue) return false;
  
  const paused = queue.player.pause();
  if (paused) {
    queue.playing = false;
  }
  return paused;
}

export function resumeSong(guildId: string): boolean {
  const queue = getQueue(guildId);
  if (!queue) return false;
  
  const resumed = queue.player.unpause();
  if (resumed) {
    queue.playing = true;
  }
  return resumed;
}

export function skipSong(guildId: string): boolean {
  const queue = getQueue(guildId);
  if (!queue || queue.songs.length === 0) return false;
  
  queue.player.stop();
  return true;
}

export function stopMusic(guildId: string): void {
  deleteQueue(guildId);
}

export function toggleLoop(guildId: string): boolean {
  const queue = getQueue(guildId);
  if (!queue) return false;
  
  queue.loop = !queue.loop;
  if (queue.loop) {
    queue.loopQueue = false;
  }
  return queue.loop;
}

export function toggleLoopQueue(guildId: string): boolean {
  const queue = getQueue(guildId);
  if (!queue) return false;
  
  queue.loopQueue = !queue.loopQueue;
  if (queue.loopQueue) {
    queue.loop = false;
  }
  return queue.loopQueue;
}

export function setVolume(guildId: string, volume: number): boolean {
  const queue = getQueue(guildId);
  if (!queue) return false;
  
  volume = Math.max(0, Math.min(100, volume));
  queue.volume = volume;
  
  if (queue.currentResource && queue.currentResource.volume) {
    queue.currentResource.volume.setVolumeLogarithmic(volume / 100);
  }
  
  return true;
}

export function getVolume(guildId: string): number {
  const queue = getQueue(guildId);
  return queue ? queue.volume : 50;
}

export async function searchSong(query: string): Promise<Song | null> {
  try {
    const isURL = playdl.yt_validate(query) === 'video';
    
    if (isURL) {
      const video = await playdl.video_info(query);
      const videoDetails = video.video_details;
      
      return {
        title: videoDetails.title || 'Unknown',
        url: videoDetails.url,
        duration: formatDuration(videoDetails.durationInSec || 0),
        durationInSec: videoDetails.durationInSec || 0,
        thumbnail: videoDetails.thumbnails?.[0]?.url || '',
        requestedBy: '',
        requestedByTag: ''
      };
    } else {
      const searchResults = await playdl.search(query, { limit: 1 });
      if (searchResults.length === 0) return null;
      
      const video = searchResults[0];
      
      return {
        title: video.title || 'Unknown',
        url: video.url,
        duration: formatDuration(video.durationInSec || 0),
        durationInSec: video.durationInSec || 0,
        thumbnail: video.thumbnails?.[0]?.url || '',
        requestedBy: '',
        requestedByTag: ''
      };
    }
  } catch (error) {
    console.error('Error searching song:', error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getCurrentTime(guildId: string): number {
  const queue = getQueue(guildId);
  if (!queue || !queue.startTime || !queue.playing) return 0;
  
  return Math.floor((Date.now() - queue.startTime) / 1000);
}

export function createProgressBar(current: number, total: number, length: number = 20): string {
  if (total === 0) return '▬'.repeat(length);
  
  const progress = Math.min(current / total, 1);
  const filledLength = Math.round(progress * length);
  const emptyLength = length - filledLength;
  
  const filled = '▰'.repeat(filledLength);
  const empty = '▱'.repeat(emptyLength);
  
  return filled + empty;
}
